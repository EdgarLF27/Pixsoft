from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from django.utils import timezone

from .models import Cart, CartItem, Order
from .serializers import (
    CartSerializer, AddCartItemSerializer, CartItemSerializer, 
    OrderSerializer, CreateOrderSerializer
)

class SalesAnalyticsView(APIView):
    """
    Endpoint para obtener datos crudos de ventas para el Dashboard.
    Retorna:
    - Resumen (revenue total, ordenes totales, pendientes).
    - Gráfico de ventas (últimos 30 días).
    - Actividad reciente (últimas 5 ordenes).
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. KPIs Generales
        total_revenue = Order.objects.filter(status__in=['processing', 'shipped', 'delivered']).aggregate(Sum('total_price'))['total_price__sum'] or 0
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()

        # 2. Ventas por Día (Últimos 30 días)
        last_30_days = timezone.now() - timezone.timedelta(days=30)
        daily_sales = Order.objects.filter(
            created_at__gte=last_30_days,
            status__in=['processing', 'shipped', 'delivered']
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            revenue=Sum('total_price'),
            count=Count('id')
        ).order_by('date')

        # 3. Top Productos Recientes (Últimos 5 orders)
        # Nota: Idealmente serializamos con menos detalle para el dashboard
        recent_orders = Order.objects.order_by('-created_at')[:5]
        recent_orders_data = OrderSerializer(recent_orders, many=True).data

        data = {
            "summary": {
                "total_revenue": total_revenue,
                "total_orders": total_orders,
                "pending_orders": pending_orders
            },
            "sales_chart": list(daily_sales),
            "recent_activity": recent_orders_data
        }
        return Response(data)

class CartViewSet(viewsets.ViewSet):
    """
    ViewSet para gestionar el carrito de compras del usuario.
    Permite:
    - Ver el carrito.
    - Añadir/actualizar productos.
    - Eliminar productos.
    """
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        """Obtiene o crea un carrito para el usuario."""
        cart, created = Cart.objects.get_or_create(user=user)
        return cart

    def list(self, request):
        """Devuelve el contenido del carrito."""
        cart = self.get_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def create(self, request):
        """Añade un ítem al carrito."""
        cart = self.get_cart(request.user)
        serializer = AddCartItemSerializer(data=request.data, context={'cart': cart})
        
        if serializer.is_valid():
            cart_item = serializer.save()
            return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """Actualiza la cantidad de un ítem."""
        cart = self.get_cart(request.user)
        try:
            cart_item = cart.items.get(pk=pk)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        quantity = request.data.get('quantity')
        if quantity is None:
            return Response({'error': 'Falta cantidad.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            quantity = int(quantity)
            if quantity <= 0: raise ValueError
        except:
             return Response({'error': 'Cantidad inválida.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save()
        return Response(CartItemSerializer(cart_item).data)

    def destroy(self, request, pk=None):
        """Elimina un ítem del carrito."""
        cart = self.get_cart(request.user)
        try:
            cart_item = cart.items.get(pk=pk)
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar los pedidos.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        serializer.save()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
