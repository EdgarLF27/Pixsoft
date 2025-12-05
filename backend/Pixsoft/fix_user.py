import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pixsoft.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'Edgar_Fflores'
password = '123'
email = 'edgar@example.com'

try:
    if not User.objects.filter(username=username).exists():
        print(f"Creating user {username}...")
        User.objects.create_superuser(username, email, password)
        print("User created.")
    else:
        print(f"User {username} already exists. Resetting password...")
        u = User.objects.get(username=username)
        u.set_password(password)
        u.is_active = True
        u.is_staff = True
        u.is_superuser = True
        u.save()
        print("User updated.")
except Exception as e:
    print(f"Error: {e}")
