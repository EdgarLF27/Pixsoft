from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny 
from .models import SaleCategory, SaleProduct
from .serializers import SaleCategorySerializer, SaleProductSerializer
from django.db.models import F

# --- ViewSet para Categorías (Soporta Jerarquía) ---

class SaleCategoryViewSet(viewsets.ModelViewSet):
    """Gestión de categorías y subcategorías (jerarquía)."""
    # Muestra solo las categorías principales (parent__isnull=True)
    queryset = SaleCategory.objects.filter(parent__isnull=True) 
    serializer_class = SaleCategorySerializer
    permission_classes = [AllowAny] 

# --- ViewSet para Productos (Incluye Manejo de Stock) ---

class SaleProductViewSet(viewsets.ModelViewSet):
    """Gestión de productos (incluyendo stock, atributos y disponibilidad)."""
    queryset = SaleProduct.objects.all()
    serializer_class = SaleProductSerializer
    permission_classes = [AllowAny] 
    
    # Endpoint para consultar SOLO productos disponibles
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            # Permite filtrar por disponibilidad: /api/v1/products/productos/?available=true
            if 'available' in self.request.query_params and self.request.query_params['available'].lower() == 'true':
                return queryset.filter(stock_quantity__gt=0)
        return queryset

    # Acción personalizada para simular una compra (reduce el stock)
    # URL: /api/v1/products/productos/{id}/purchase/
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def purchase(self, request, pk=None):
        """Simula una venta para reducir el stock en tiempo real."""
        product = self.get_object()
        quantity = request.data.get('quantity', 1)
        
        try:
            quantity = int(quantity)
            if quantity <= 0:
                return Response({"detail": "La cantidad debe ser positiva."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
             return Response({"detail": "Cantidad no válida."}, status=status.HTTP_400_BAD_REQUEST)

        if product.stock_quantity < quantity:
            # 4.1 Control de disponibilidad y notificación de agotado
            return Response({
                "detail": f"Stock insuficiente. Solo quedan {product.stock_quantity} unidades.",
                "notify_client": True # Opción para notificar al cliente si está agotado
            }, status=status.HTTP_409_CONFLICT)
        
        # 4.1 Gestión de inventarios en tiempo real
        # Utilizamos F() para evitar condiciones de carrera (race conditions) al actualizar el stock
        SaleProduct.objects.filter(pk=product.pk).update(stock_quantity=F('stock_quantity') - quantity)
        product.refresh_from_db()

        return Response({
            "message": "Compra procesada. Stock actualizado en tiempo real.",
            "new_stock": product.stock_quantity
        }, status=status.HTTP_200_OK)