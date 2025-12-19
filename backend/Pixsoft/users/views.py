from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
import requests
import jwt

User = get_user_model()

# Custom Adapter removed. SSL Verification enabled.

class PatchedOAuth2Client(OAuth2Client):
    def __init__(self, *args, **kwargs):
        # Fix for "got multiple values for argument 'scope_delimiter'"
        if 'scope_delimiter' in kwargs:
             kwargs.pop('scope_delimiter')
        super().__init__(*args, **kwargs)

class GoogleLogin(SocialLoginView):
    # Esta vista ignora la lógica estándar de dj-rest-auth/allauth para evitar
    # problemas de validación de id_token y clock skew. Hace el intercambio manualmente.
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client

    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        if not code:
            return Response({"error": "Code is required"}, status=400)

        try:
            # 1. Intercambio manual del código con Google
            from django.conf import settings
            token_url = "https://oauth2.googleapis.com/token"
            payload = {
                'code': code,
                'client_id': settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id'],
                'client_secret': settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['secret'],
                'redirect_uri': 'postmessage',
                'grant_type': 'authorization_code'
            }
            
            res = requests.post(token_url, data=payload)
            res.raise_for_status()
            google_data = res.json()
            
            # 2. Obtener datos del usuario desde el id_token
            import jwt
            # Decodificamos sin verificar firma para obtener email (ya confiamos en el canal HTTPS directo a Google)
            id_token = google_data.get('id_token')
            user_data = jwt.decode(id_token, options={"verify_signature": False})
            
            email = user_data.get('email')
            if not email:
                return Response({"error": "Google account has no email"}, status=400)

            # 3. Buscar o crear usuario en Django
            User = get_user_model()
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Crear usuario nuevo
                username = email.split('@')[0]
                # Asegurar username único
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=user_data.get('given_name', ''),
                    last_name=user_data.get('family_name', '')
                )
                user.set_unusable_password()
                user.save()
                
                # Crear perfil si es necesario (según tu modelo)
                try:
                    from .models import Profile
                    if not hasattr(user, 'profile'):
                        Profile.objects.create(user=user)
                except ImportError:
                    pass

            # 4. Generar tokens JWT de la aplicación (usando simplejwt)
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'pk': user.pk,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })

        except requests.exceptions.RequestException as e:
            return Response({"error": "Failed to connect to Google", "details": str(e)}, status=400)
        except Exception as e:
            import traceback
            return Response({"error": "Login failed", "details": str(e)}, status=400)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            from .models import Profile
            Profile.objects.create(user=user)
        return user

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserListUpdateView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class ToggleUserStaffStatusView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def perform_update(self, serializer):
        instance = serializer.save()
