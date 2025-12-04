from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class ProtectedTestView(APIView):
    """
    A protected view to test Supabase JWT authentication.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        content = {
            'message': 'You have successfully accessed a protected endpoint!',
            'user_email': request.user.email,
        }
        return Response(content)

