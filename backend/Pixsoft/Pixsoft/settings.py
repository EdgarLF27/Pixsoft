# settings.py - COMPLETO Y CORREGIDO

from pathlib import Path
import os
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(os.path.join(BASE_DIR.parent, '.env')) # Load .env file from the backend folder

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-=m#^mp8bp+%8u1-6izh^(vi2^9e2-9xd5--i59hhl03*b(5_!i'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# PERMITE TODOS LOS HOSTS PARA DESARROLLO
ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',  # AÑADIDO: corsheaders debe estar en INSTALLED_APPS
    'users',
    'api',
    'leasing',
    'products',
]

MIDDLEWARE = [
    # 1. Seguridad
    'django.middleware.security.SecurityMiddleware',
    
    # 2. CORS DEBE estar aquí, al inicio pero después de SecurityMiddleware
    'corsheaders.middleware.CorsMiddleware', 
    
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Pixsoft.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Pixsoft.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ----------------------------------------------------------------------
# --- CONFIGURACIÓN DRF (Django REST Framework) CORREGIDA ---
# ----------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.authentication.SupabaseAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # AÑADIDO para desarrollo
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        # CAMBIADO: Permitir acceso sin autenticación para desarrollo
        'rest_framework.permissions.AllowAny',
    ],
}

# ----------------------------------------------------------------------
# --- CONFIGURACIÓN CRÍTICA DE CORS CORREGIDA ---
# ----------------------------------------------------------------------

# IMPORTANTE: Para desarrollo, permite todos los orígenes
CORS_ALLOW_ALL_ORIGINS = True  # CAMBIADO de False a True para desarrollo

# También puedes mantener estas configuraciones específicas:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "file://",  # Para abrir HTML directamente desde el sistema de archivos
]

# Permite credenciales (cookies, headers de autenticación)
CORS_ALLOW_CREDENTIALS = True

# Métodos HTTP permitidos
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Headers permitidos
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ----------------------------------------------------------------------
# --- CONFIGURACIÓN ADICIONAL DE SEGURIDAD PARA DESARROLLO ---
# ----------------------------------------------------------------------

# Deshabilitar CSRF para desarrollo (¡QUITAR EN PRODUCCIÓN!)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# OPCIONAL: Deshabilitar CSRF completamente para desarrollo
# CSRF_COOKIE_SECURE = False
# CSRF_USE_SESSIONS = False

# Para autenticación por sesión
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = False  # Solo True en producción con HTTPS
SESSION_COOKIE_HTTPONLY = True

# ----------------------------------------------------------------------
# --- CONFIGURACIÓN DE LOGGING PARA DEBUG ---
# ----------------------------------------------------------------------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'corsheaders': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}