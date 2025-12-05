from django.urls import path, include
from users.views import CustomTokenObtainPairView, UserListUpdateView, ToggleUserStaffStatusView, GoogleLogin
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/', include('users.urls')),
    path('users/manage/', UserListUpdateView.as_view(), name='user-list'),
    path('users/manage/<int:pk>/', ToggleUserStaffStatusView.as_view(), name='user-update'),
    path('products/', include('products.urls')),
    path('leasing/', include('leasing.urls')),
    path('orders/', include('orders.urls')),
    path('shipping/', include('shipping.urls')),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
]
