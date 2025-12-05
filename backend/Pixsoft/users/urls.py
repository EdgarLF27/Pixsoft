from django.urls import path
from .views import RegisterView, ManageUserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user_register'),
    path('profile/', ManageUserView.as_view(), name='user_profile'),
]
