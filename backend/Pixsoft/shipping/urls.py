from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShippingMethodViewSet, ShipmentViewSet

router = DefaultRouter()
router.register(r'methods', ShippingMethodViewSet)
router.register(r'shipments', ShipmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
