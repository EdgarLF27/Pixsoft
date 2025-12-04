from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ProductListView, RentalQuoteView, RentalContractViewSet # Importar RentalContractViewSet

router = DefaultRouter()
# Registro del ViewSet para contratos
router.register(r'contracts', RentalContractViewSet)

urlpatterns = [
    # Rutas para ViewSets (GET /contracts/, POST /contracts/, etc.)
    path('', include(router.urls)), 
    
    # Rutas para las APIView (cotizaciones y listas simples)
    path('products/', ProductListView.as_view(), name='product-list'),
    path('quote/', RentalQuoteView.as_view(), name='rental-quote'),
]