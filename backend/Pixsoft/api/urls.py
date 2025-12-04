from django.urls import path
from .views import ProtectedTestView

urlpatterns = [
    path('test/', ProtectedTestView.as_view(), name='protected_test_view'),
]
