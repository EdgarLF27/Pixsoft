# leasing/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductListView, ContractViewSet, PlanListView, calculate_quote

router = DefaultRouter()
router.register(r'contracts', ContractViewSet, basename='contract')

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('plans/', PlanListView.as_view(), name='plan-list'),
    path('quote/', calculate_quote, name='calculate-quote'),  # ¡ESTA ES LA RUTA QUE FALTABA!
    path('', include(router.urls)),
]