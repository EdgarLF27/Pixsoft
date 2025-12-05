from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem
from .serializers import CartSerializer, AddCartItemSerializer, CartItemSerializer

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
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
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
            return Response({'error': 'Este ítem no existe en tu carrito.'}, status=status.HTTP_44_NOT_FOUND)

        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
