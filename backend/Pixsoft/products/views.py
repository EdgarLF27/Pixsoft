from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.views import APIView
from django.db.models import F, Count, Sum
from .models import SaleCategory, SaleProduct
from .serializers import SaleCategorySerializer, SaleProductSerializer

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

class InventoryAnalyticsView(APIView):
    """
    Endpoint para Reportes de Inventario.
    Retorna:
    - Estado del stock (Total, Agotado, Bajo Stock).
    - Distribución por categorías.
    - Valor total del inventario.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. KPIs de Stock
        total_products = SaleProduct.objects.count()
        out_of_stock = SaleProduct.objects.filter(stock_quantity=0).count()
        low_stock = SaleProduct.objects.filter(stock_quantity__lt=5, stock_quantity__gt=0).count()
        
        # Valor del inventario (Precio * Cantidad)
        inventory_value_qs = SaleProduct.objects.aggregate(
            total_value=Sum(F('price') * F('stock_quantity'))
        )
        total_value = inventory_value_qs['total_value'] or 0

        # 2. Distribución por Categoría
        category_distribution = SaleProduct.objects.values('category__name').annotate(
            count=Count('id')
        ).order_by('-count')

        # 3. Alertas de Stock Bajo (Detalle)
        low_stock_items = SaleProduct.objects.filter(stock_quantity__lt=5).values(
            'name', 'sku', 'stock_quantity'
        )[:10]

        data = {
            "summary": {
                "total_products": total_products,
                "out_of_stock": out_of_stock,
                "low_stock": low_stock,
                "total_inventory_value": total_value
            },
            "by_category": list(category_distribution),
            "alerts": list(low_stock_items)
        }
        return Response(data)