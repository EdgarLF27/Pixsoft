from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
import requests

User = get_user_model()

# Custom Adapter removed. SSL Verification enabled.

class PatchedOAuth2Client(OAuth2Client):
    def __init__(self, *args, **kwargs):
        # Fix for "got multiple values for argument 'scope_delimiter'"
        if 'scope_delimiter' in kwargs:
             kwargs.pop('scope_delimiter')
        super().__init__(*args, **kwargs)

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter # Reverted to standard adapter
    callback_url = "postmessage"
    client_class = PatchedOAuth2Client

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            # Error handling kept, but no credential printing
            import traceback
            error_details = traceback.format_exc()
            from rest_framework.response import Response
            return Response(
                {"error": str(e), "traceback": error_details.splitlines()[-3:]},
                status=400
            )

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
