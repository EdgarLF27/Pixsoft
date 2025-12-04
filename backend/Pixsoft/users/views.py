from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Profile
from .serializers import ProfileSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating the authenticated user's profile.
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Retrieve the profile for the currently authenticated user
        return self.request.user.profile


