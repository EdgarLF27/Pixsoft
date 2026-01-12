from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import SaleCategoryViewSet, SaleProductViewSet

router = DefaultRouter()
router.register(r'category', SaleCategoryViewSet)
router.register(r'product', SaleProductViewSet)

urlpatterns = [
    # Mapea /api/v1/products/categories/ y /api/v1/products/productos/
    path('', include(router.urls)), 
]