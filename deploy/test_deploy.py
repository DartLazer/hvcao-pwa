import unittest
from unittest.mock import patch
import deploy


class DeploymentGateTests(unittest.TestCase):
    def run_record(self, **changes):
        record = dict(head_sha='a' * 40, head_branch='master', event='push',
                      path='.github/workflows/ci.yml', run_number=1, run_attempt=1,
                      status='completed', conclusion='success')
        return record | changes

    def test_only_successful_current_master_push_can_deploy(self):
        self.assertTrue(deploy.eligible('a' * 40, [self.run_record()]))
        for changes in [dict(head_sha='b' * 40), dict(head_branch='feature'),
                        dict(event='pull_request'), dict(path='.github/workflows/other.yml'),
                        dict(status='in_progress'), dict(conclusion='failure'),
                        dict(conclusion='cancelled')]:
            with self.subTest(changes=changes):
                self.assertFalse(deploy.eligible('a' * 40, [self.run_record(**changes)]))
        self.assertFalse(deploy.eligible('a' * 40, []))

    def test_rerunning_failed_ci_does_not_reuse_old_success(self):
        records = [self.run_record(), self.run_record(run_attempt=2, status='in_progress', conclusion=None)]
        self.assertFalse(deploy.eligible('a' * 40, records))
        records[1] = self.run_record(run_attempt=2, conclusion='failure')
        self.assertFalse(deploy.eligible('a' * 40, records))

    def test_health_rejects_missing_production_cors_header(self):
        class Response:
            status = 200
            headers = {}
            def __enter__(self): return self
            def __exit__(self, *args): pass
        with patch.object(deploy.urllib.request, 'urlopen', return_value=Response()):
            with self.assertRaisesRegex(RuntimeError, 'CORS'):
                deploy.health()

    def test_backup_uses_running_api_database_role(self):
        with patch.object(deploy, 'capture', return_value='["existing_app_role", "existing_db"]'):
            command = deploy.database_backup_command(['/tmp/compose.yml'])
        self.assertEqual(command[-5:], ['pg_dump', '--no-owner', '-U', 'existing_app_role', 'existing_db'])

    def test_backup_rejects_missing_app_configuration(self):
        with patch.object(deploy, 'capture', return_value='[null, null]'):
            with self.assertRaisesRegex(RuntimeError, 'connection settings'):
                deploy.database_backup_command(['/tmp/compose.yml'])


if __name__ == '__main__':
    unittest.main()
