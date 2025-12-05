from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem, Order
from .serializers import (
    CartSerializer, AddCartItemSerializer, CartItemSerializer, 
    OrderSerializer, CreateOrderSerializer
)

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
        """
        Devuelve el contenido del carrito del usuario autenticado.
        """
        cart = self.get_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def create(self, request):
        """
        Añade un ítem al carrito o actualiza su cantidad si ya existe.
        """
        cart = self.get_cart(request.user)
        serializer = AddCartItemSerializer(data=request.data, context={'cart': cart})
        
        if serializer.is_valid():
            cart_item = serializer.save()
            # Return the full cart item representation
            response_serializer = CartItemSerializer(cart_item)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """
        Actualiza la cantidad de un ítem específico en el carrito.
        """
        cart = self.get_cart(request.user)
        try:
            cart_item = cart.items.get(pk=pk)
        except CartItem.DoesNotExist:
            return Response({'error': 'Este ítem no existe en tu carrito.'}, status=status.HTTP_404_NOT_FOUND)

        # Solo permitimos actualizar la cantidad
        quantity = request.data.get('quantity')
        if quantity is None:
            return Response({'error': 'Debes proporcionar una cantidad.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response({'error': 'La cantidad debe ser un número entero positivo.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save()
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        """
        Elimina un ítem del carrito.
        """
        cart = self.get_cart(request.user)
        try:
            cart_item = cart.items.get(pk=pk)
        except CartItem.DoesNotExist:
            return Response({'error': 'Este ítem no existe en tu carrito.'}, status=status.HTTP_404_NOT_FOUND)

        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar los pedidos (historial y creación).
    - `list`: Devuelve el historial de pedidos del usuario.
    - `retrieve`: Devuelve un pedido específico del usuario.
    - `create`: Crea un nuevo pedido a partir del carrito del usuario.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Asegura que los usuarios solo puedan ver sus propios pedidos.
        """
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        """
        Usa un serializador diferente para la creación de pedidos.
        """
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        """
        Pasa el contexto del request al serializador de creación.
        """
        serializer.save()

    def get_serializer_context(self):
        """
        Asegura que el serializador tenga acceso al objeto request.
        """
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
