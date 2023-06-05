from django.contrib.auth import get_user_model
from django.db import migrations


def create_admin_user(apps, schema_editor):
    User = get_user_model()
    admin_username = 'admin'
    admin_password = 'adminpassword'

    try:
        admin_user = User.objects.get(username=admin_username)
    except User.DoesNotExist:
        admin_user = User.objects.create_superuser(username=admin_username, password=admin_password)
        print(f"Created admin user: {admin_username}")
    else:
        print(f"Admin user: {admin_username} already exists.")


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.RunPython(create_admin_user),
    ]
