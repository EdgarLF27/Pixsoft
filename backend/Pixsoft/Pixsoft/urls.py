"""
URL configuration for Pixsoft project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet
from products.views import SaleProductViewSet, SaleCategoryViewSet
from shipping.views import ShippingMethodViewSet, ShipmentViewSet
from billing.views import InvoiceViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
# router.register(r'products', SaleProductViewSet) # Moved to products.urls
# router.register(r'categories', SaleCategoryViewSet) # Moved to products.urls
router.register(r'shipping/methods', ShippingMethodViewSet)
router.register(r'shipping/shipments', ShipmentViewSet)
from orders.views import OrderViewSet, CartViewSet

router.register(r'billing/invoices', InvoiceViewSet, basename='invoice')
router.register(r'billing/payments', PaymentViewSet)
router.register(r'orders/cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/leasing/', include('leasing.urls')),
    path('api/v1/products/', include('products.urls')),
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
