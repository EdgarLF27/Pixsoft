import jwt
import os
from django.contrib.auth.models import User
from rest_framework import authentication
from rest_framework import exceptions

class SupabaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        try:
            # The header should be in the format: "Bearer <token>"
            token_type, token = auth_header.split()
            if token_type.lower() != 'bearer':
                return None
        except ValueError:
            # Handle cases where the header is not in the expected format
            return None

        try:
            secret = os.environ.get('SUPABASE_JWT_SECRET')
            if not secret:
                raise exceptions.AuthenticationFailed('SUPABASE_JWT_SECRET not configured.')

            # Decode the token
            payload = jwt.decode(token, secret, algorithms=['HS256'])
            
            # Extract user identifier from the token (e.g., email)
            email = payload.get('email')
            if not email:
                raise exceptions.AuthenticationFailed('Token does not contain user email.')

            # Get or create a user in Django's database
            # We use email as the primary identifier and also set it as the username for simplicity
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email}
            )
            
            return (user, token)

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired.')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token.')
        except Exception as e:
            # Catch other potential errors during user creation or token processing
            raise exceptions.AuthenticationFailed(f'Authentication failed: {e}')
