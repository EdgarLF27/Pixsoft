"""
URL configuration for Pixsoft project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

# Views
from users.views import (
    UserViewSet, CustomTokenObtainPairView, GoogleLogin,
    RegisterView, ManageUserView
)
from shipping.views import ShippingMethodViewSet, ShipmentViewSet
from billing.views import InvoiceViewSet, PaymentViewSet
from orders.views import OrderViewSet, CartViewSet, SalesAnalyticsView
from products.views import InventoryAnalyticsView

router = DefaultRouter()
router.register(r'users', UserViewSet)
# router.register(r'products', SaleProductViewSet) # Use specialized URLs
# router.register(r'categories', SaleCategoryViewSet)
router.register(r'shipping/methods', ShippingMethodViewSet)
router.register(r'shipping/shipments', ShipmentViewSet)

router.register(r'billing/invoices', InvoiceViewSet, basename='invoice')
router.register(r'billing/payments', PaymentViewSet)
router.register(r'orders/cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Routes
    path('api/v1/', include('api.urls')),
    path('api/v1/', include(router.urls)),
    path('api/v1/leasing/', include('leasing.urls')),
    path('api/v1/products/', include('products.urls')),
    path('api/v1/marketing/', include('marketing.urls')),
    
    # Dashboard / Analytics
    path('api/v1/dashboard/sales/', SalesAnalyticsView.as_view(), name='dashboard-sales'),
    path('api/v1/dashboard/inventory/', InventoryAnalyticsView.as_view(), name='dashboard-inventory'),
    
    # Auth
    path('api/v1/auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('api/v1/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/users/register/', RegisterView.as_view(), name='register'),
    path('api/v1/users/profile/', ManageUserView.as_view(), name='profile'),
    path('accounts/', include('allauth.urls')), # Required for socialaccount_signup reverse match
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
