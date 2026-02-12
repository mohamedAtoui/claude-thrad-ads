import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-me')

DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.vercel.app',
]
if os.getenv('VERCEL_URL'):
    ALLOWED_HOSTS.append(os.getenv('VERCEL_URL'))

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'chat',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
    'x-auth-token',
]

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
    'UNAUTHENTICATED_USER': None,
}

# Data directory (used for local file-based storage fallback)
DATA_DIR = BASE_DIR / 'data'

# Redis / Vercel KV
KV_REST_API_URL = os.getenv('KV_REST_API_URL', '')
KV_REST_API_TOKEN = os.getenv('KV_REST_API_TOKEN', '')

# OpenAI
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# Thrad SSP
THRAD_API_KEY = os.getenv('THRAD_API_KEY', '').strip()
THRAD_API_KEY_FALLBACK = os.getenv('THRAD_API_KEY_FALLBACK', '').strip()
THRAD_CHATBOT_URL = os.getenv('THRAD_CHATBOT_URL', '')
