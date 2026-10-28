#!/usr/bin/env python3
"""Deploy public master commits only after the repository's CI workflow succeeds."""
import argparse
import datetime as dt
import fcntl
import gzip
import json
import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time
import urllib.request

LIVE = Path('/home/rik/web_apps/hvcao-pwa')
ROOT = Path('/home/rik/.local/share/hvcao-deploy')
REPO = 'DartLazer/hvcao-pwa'
SERVICES = ['hvcao_api_docker', 'hvcao_nuxt_docker']
LOG = logging.getLogger('hvcao-deploy')


def run(args, **kwargs):
    return subprocess.run(args, check=True, text=True, timeout=1800, **kwargs)


def capture(args):
    return run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout.strip()


def api(path):
    request = urllib.request.Request('https://api.github.com/repos/' + REPO + path,
        headers={'Accept': 'application/vnd.github+json', 'User-Agent': 'hvcao-production-deployer'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def compose(files, *args):
    command = ['docker', 'compose', '--project-name', 'hvcao-pwa']
    env = Path(files[0]).parent / '.env'
    command.extend(['--env-file', str(env) if env.exists() else '/dev/null'])
    for file in files:
        command.extend(['-f', str(file)])
    return command + list(args)


def write_json(path, value):
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(value, indent=2) + '\n')
    temporary.replace(path)


def eligible(head, runs):
    matching = [r for r in runs if r['head_sha'] == head and r['head_branch'] == 'master'
                and r['event'] == 'push' and r['path'] == '.github/workflows/ci.yml']
    if not matching:
        return False
    latest = max(matching, key=lambda r: (r['run_number'], r.get('run_attempt', 1)))
    return latest['status'] == 'completed' and latest['conclusion'] == 'success'


def health():
    # Read-only production checks, including the CORS policy used by the browser.
    for url in ['http://127.0.0.1:3099/', 'https://hvcao.nl/',
                'https://hvcao-api.sky-t.nl/api/question-version/',
                'https://hvcao-api.sky-t.nl/api/question-data/']:
        request = urllib.request.Request(url, headers={'Origin': 'https://hvcao.nl'})
        with urllib.request.urlopen(request, timeout=15) as response:
            if response.status != 200:
                raise RuntimeError('Health check failed: ' + url)
            if '/api/' in url:
                if response.headers.get('Access-Control-Allow-Origin') != 'https://hvcao.nl':
                    raise RuntimeError('Production CORS health check failed')
                json.load(response)


def await_health():
    last = None
    for _ in range(12):
        try:
            health()
            return
        except Exception as error:
            last = error
            time.sleep(10)
    raise RuntimeError('Health checks did not recover: ' + str(last))


def baseline():
    path = ROOT / 'state.json'
    if path.exists():
        return json.loads(path.read_text())
    images = {}
    for service, suffix in zip(SERVICES, ['api', 'frontend']):
        container = capture(compose([LIVE / 'docker-compose.yml'], 'ps', '-q', service))
        image = capture(['docker', 'inspect', '--format={{.Image}}', container])
        tag = 'hvcao-deploy-' + suffix + ':baseline'
        run(['docker', 'image', 'tag', image, tag])
        images[service] = {'image': tag}
    override = ROOT / 'baseline.json'
    write_json(override, {'services': images})
    state = {'sha': capture(['git', '-C', str(LIVE), 'rev-parse', 'HEAD']),
             'files': [str(LIVE / 'docker-compose.yml'), str(override)], 'baseline': True}
    write_json(path, state)
    return state


def database_backup_command(files):
    # Database container environment can be stale after an existing volume was restored.
    # Use the same database role/name as the currently running application.
    user, database = json.loads(capture(compose(files, 'exec', '-T', 'hvcao_api_docker',
        'python', '-c', 'import os,json; print(json.dumps([os.environ.get("SQL_USER"), os.environ.get("SQL_DATABASE")]))')))
    if not user or not database:
        raise RuntimeError('Running API does not provide database connection settings')
    return compose(files, 'exec', '-T', 'database', 'pg_dump', '--no-owner', '-U', user, database)


def backup_database(files):
    directory = ROOT / 'backups'
    directory.mkdir(exist_ok=True)
    stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    destination = directory / (stamp + '.sql.gz')
    command = database_backup_command(files)
    with subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE) as process:
        with gzip.open(destination, 'wb') as output:
            shutil.copyfileobj(process.stdout, output)
        stderr = process.stderr.read()
        if process.wait(timeout=120) != 0:
            destination.unlink(missing_ok=True)
            raise RuntimeError('Database backup failed: ' + stderr.decode(errors='replace'))
    if destination.stat().st_size < 100:
        raise RuntimeError('Database backup unexpectedly empty')
    LOG.info('Database backup saved: %s', destination)


def deploy(head, previous):
    if shutil.disk_usage(ROOT).free < 8 * 1024**3:
        raise RuntimeError('Deployment requires at least 8 GiB free disk space')
    release = ROOT / 'releases' / head
    release.mkdir(parents=True, exist_ok=True)
    archive = ROOT / 'source.tar'
    run(['git', '--git-dir=' + str(ROOT / 'repo.git'), 'archive', '--output=' + str(archive), head])
    run(['tar', '-xf', str(archive), '-C', str(release)])
    archive.unlink()
    for name in ['env.ssl', 'database.env']:
        shutil.copy2(LIVE / 'config_files' / name, release / 'config_files' / name)
        (release / 'config_files' / name).chmod(0o600)
    if (LIVE / '.env').exists():
        shutil.copy2(LIVE / '.env', release / '.env')
        (release / '.env').chmod(0o600)
    override = release / 'production.override.json'
    write_json(override, {'services': {
        'hvcao_api_docker': {'image': 'hvcao-deploy-api:' + head},
        'hvcao_nuxt_docker': {'image': 'hvcao-deploy-frontend:' + head},
        'database': {'volumes': [{'type': 'bind', 'source': str(LIVE / 'postgres/data'),
                                 'target': '/var/lib/postgresql/data'}]},
    }})
    files = [str(release / 'docker-compose.yml'), str(override)]
    run(compose(files, 'config', '--quiet'))
    LOG.info('Building %s while current application remains online', head)
    with (ROOT / 'build.log').open('w') as output:
        run(compose(files, 'build', *SERVICES), stdout=output, stderr=subprocess.STDOUT)
    backup_database(previous['files'])
    # Do not replace an older commit if master moved while the build was running.
    if api('/git/ref/heads/master')['object']['sha'] != head:
        LOG.info('Master moved during build; waiting for the next CI-approved release')
        return
    try:
        run(compose(files, 'up', '-d', '--no-deps', *SERVICES))
        await_health()
    except Exception:
        LOG.exception('Deployment failed; restoring previous application images')
        run(compose(previous['files'], 'up', '-d', '--no-deps', *SERVICES))
        await_health()
        raise
    state = {'sha': head, 'files': files, 'previous': previous['files'],
             'deployed_at': dt.datetime.now(dt.timezone.utc).isoformat()}
    write_json(ROOT / 'state.json', state)
    link = ROOT / 'current.tmp'
    link.unlink(missing_ok=True)
    link.symlink_to(release, target_is_directory=True)
    link.replace(ROOT / 'current')
    (ROOT / 'failed.json').unlink(missing_ok=True)
    LOG.info('Deployment successful: %s', head)
    # Keep the active and previous releases, plus one older release; no global Docker pruning.
    releases = sorted((ROOT / 'releases').iterdir(), key=lambda p: p.stat().st_mtime, reverse=True)
    protected = {Path(f).parent for f in files + previous['files']}
    for old in releases[3:]:
        if old not in protected and re.fullmatch('[0-9a-f]{40}', old.name):
            for prefix in ['hvcao-deploy-api:', 'hvcao-deploy-frontend:']:
                subprocess.run(['docker', 'image', 'rm', prefix + old.name], capture_output=True)
            shutil.rmtree(old)
    for old in sorted((ROOT / 'backups').glob('*.sql.gz'), reverse=True)[14:]:
        old.unlink()


def main():
    os.umask(0o077)
    ROOT.mkdir(parents=True, exist_ok=True)
    handler = RotatingFileHandler(ROOT / 'deploy.log', maxBytes=2_000_000, backupCount=3)
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s',
                        handlers=[handler, logging.StreamHandler()])
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='Check GitHub eligibility without deploying')
    parser.add_argument('--status', action='store_true')
    args = parser.parse_args()
    if args.status:
        print((ROOT / 'state.json').read_text() if (ROOT / 'state.json').exists() else 'Not initialized')
        return
    with (ROOT / 'deploy.lock').open('w') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return
        head = api('/git/ref/heads/master')['object']['sha']
        runs = api('/actions/workflows/ci.yml/runs?branch=master&event=push&per_page=10')['workflow_runs']
        approved = eligible(head, runs)
        if args.check:
            print(json.dumps({'head': head, 'ci_approved': approved}))
            return
        previous = baseline()
        if head == previous['sha'] or not approved:
            return
        failed = ROOT / 'failed.json'
        if failed.exists():
            failure = json.loads(failed.read_text())
            if failure['sha'] == head and time.time() - failure['time'] < 1800:
                return
        if not (ROOT / 'repo.git').exists():
            run(['git', 'clone', '--bare', 'https://github.com/' + REPO + '.git', str(ROOT / 'repo.git')])
        run(['git', '--git-dir=' + str(ROOT / 'repo.git'), 'fetch', 'origin', 'master'])
        try:
            deploy(head, previous)
        except Exception:
            write_json(failed, {'sha': head, 'time': time.time()})
            LOG.exception('Deployment failed; retrying in 30 minutes')
            raise


if __name__ == '__main__':
    try:
        main()
    except Exception:
        LOG.exception('Automatic deployment check failed')
        sys.exit(1)
