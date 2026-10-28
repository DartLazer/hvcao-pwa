# Automatic production deployment

Changes pushed or merged into `master` run the GitHub Actions `CI` workflow. The production server checks GitHub every five minutes and deploys only the current `master` commit after that workflow finishes successfully. Pull requests, failed checks, and superseded commits do not deploy. Normal build/startup time is additional to the five-minute polling interval.

This uses the public GitHub Actions API: no GitHub token, inbound webhook, self-hosted Actions runner, or production SSH private key in GitHub is required. If GitHub cannot be reached or its API rate limit is reached, the current site continues running and a later scheduled check retries.

## Installed server layout

- App configuration and existing data: `/home/rik/web_apps/hvcao-pwa`
- Deployment program: `/home/rik/.local/share/hvcao-deploy/deploy.py`
- Release copies and current-release symlink: `/home/rik/.local/share/hvcao-deploy/releases` and `current`
- Current commit and Compose paths: `/home/rik/.local/share/hvcao-deploy/state.json`
- Deployment log: `/home/rik/.local/share/hvcao-deploy/deploy.log`
- Latest image-build log: `/home/rik/.local/share/hvcao-deploy/build.log`
- Pre-deployment database backups: `/home/rik/.local/share/hvcao-deploy/backups` (latest 14 successful backup files retained)
- Scheduler: the `rik` user's crontab, marked `hvcao-auto-deploy`

The original checkout is retained as the source of server-local `config_files/env.ssl`, `config_files/database.env`, and optional `.env`. Every release copies these files with private permissions; production credentials are never committed. Existing PostgreSQL files and named application volumes are preserved. The deployer builds the API and frontend and starts only those two services with `--no-deps`; it never pulls or replaces PostgreSQL.

Builds happen while the old app is serving. Before changing containers, the deployer saves a compressed PostgreSQL dump. It then checks the local frontend, public site, API JSON responses, and the CORS header for `https://hvcao.nl`. Failed startup/health checks restore the previous app images. Database migrations are not automatically reversed: the dump is available for operator-directed recovery, and releases should use backwards-compatible migrations.

Keep at least 8 GiB free. The three most recent release copies and active/previous releases are retained; cleanup removes only deployment-owned image tags and release directories, never other applications' Docker resources. Builds can still consume Docker build-cache space; monitor disk usage.

## Operations

```sh
python3 /home/rik/.local/share/hvcao-deploy/deploy.py --status
python3 /home/rik/.local/share/hvcao-deploy/deploy.py --check
tail -n 80 /home/rik/.local/share/hvcao-deploy/deploy.log
tail -n 80 /home/rik/.local/share/hvcao-deploy/build.log
```

To check/deploy immediately, run `python3 /home/rik/.local/share/hvcao-deploy/deploy.py`. Concurrent runs are locked out. A failed release retries after 30 minutes, or immediately after removing `failed.json` once its cause has been addressed. To pause deployment, comment out the `hvcao-auto-deploy` line using `crontab -e`.

After automatic deployment, use the Compose file paths from `state.json` for manual container operations. Running Compose from the original checkout would restore the old source/configuration. The PostgreSQL major remains unchanged; upgrading it is a separate maintenance task.

The installed deployment program is deliberately stable. Updating its repository copy does not replace the installed program automatically; review and install changes to that program explicitly.
