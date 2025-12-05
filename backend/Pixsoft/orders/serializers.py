from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Cart, CartItem, Order, OrderItem
from products.models import SaleProduct
from leasing.models import RentalProduct, RentalPlan

class ProductRelatedField(serializers.RelatedField):
    """
    Un campo de serializador personalizado para manejar la relación genérica
    con SaleProduct y RentalProduct.
    """
    def to_representation(self, value):
        if isinstance(value, SaleProduct):
            return f"Venta: {value.name} - S/.{value.price}"
        elif isinstance(value, RentalProduct):
            return f"Alquiler: {value.name}"
        raise Exception('Tipo de producto inesperado para la relación.')

class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializador para mostrar los ítems del carrito.
    """
    product = ProductRelatedField(read_only=True)
    item_price = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()
    rental_plan_details = serializers.CharField(source='rental_plan', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'rental_plan_details', 'item_price', 'total_price']

class CartSerializer(serializers.ModelSerializer):
    """
    Serializador para mostrar el carrito completo.
    """
    items = CartItemSerializer(many=True, read_only=True)
    total_cart_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_cart_price', 'updated_at']
    
    def get_total_cart_price(self, obj):
        return sum(item.total_price for item in obj.items.all())

class AddCartItemSerializer(serializers.ModelSerializer):
    """
    Serializador para añadir un ítem al carrito.
    Maneja la lógica de validación para productos de venta vs. arrendamiento.
    """
    product_id = serializers.IntegerField()
    product_type = serializers.ChoiceField(choices=['sale', 'rental'])
    rental_plan_id = serializers.IntegerField(required=False)

    class Meta:
        model = CartItem
        fields = ['product_id', 'product_type', 'quantity', 'rental_plan_id']

    def validate(self, data):
        product_type = data['product_type']
        product_id = data['product_id']
        rental_plan_id = data.get('rental_plan_id')

        if product_type == 'sale':
            if not SaleProduct.objects.filter(id=product_id).exists():
                raise serializers.ValidationError("El producto de venta no existe.")
            if rental_plan_id:
                raise serializers.ValidationError("Los productos de venta no tienen plan de alquiler.")
        
        elif product_type == 'rental':
            if not RentalProduct.objects.filter(id=product_id).exists():
                raise serializers.ValidationError("El producto de alquiler no existe.")
            if not rental_plan_id:
                raise serializers.ValidationError("Debe especificar un plan de alquiler para este producto.")
            if not RentalPlan.objects.filter(id=rental_plan_id, product_id=product_id).exists():
                raise serializers.ValidationError("El plan de alquiler no es válido para este producto.")

        return data

    def save(self, **kwargs):
        cart = self.context['cart']
        product_type = self.validated_data['product_type']
        product_id = self.validated_data['product_id']
        quantity = self.validated_data['quantity']
        rental_plan_id = self.validated_data.get('rental_plan_id')

        if product_type == 'sale':
            content_type = ContentType.objects.get_for_model(SaleProduct)
            rental_plan = None
        else: # rental
            content_type = ContentType.objects.get_for_model(RentalProduct)
            rental_plan = RentalPlan.objects.get(id=rental_plan_id)

        # Actualizar cantidad si el ítem ya existe, o crear uno nuevo
        cart_item, created = CartItem.objects.update_or_create(
            cart=cart,
            content_type=content_type,
            object_id=product_id,
            rental_plan=rental_plan,
            defaults={'quantity': quantity}
        )
        
        self.instance = cart_item
        return self.instance

# --- Serializadores para Pedidos (Orders) ---

class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializador para los ítems de un pedido.
    """
    product = ProductRelatedField(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price_at_purchase', 'rental_plan']

class OrderSerializer(serializers.ModelSerializer):
    """
    Serializador para ver un pedido y su historial.
    """
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField()

    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'total_price', 'created_at', 'items']

class CreateOrderSerializer(serializers.Serializer):
    """
    Serializador para crear un pedido desde el carrito de un usuario.
    Este serializador no está basado en un modelo, sino que orquesta la lógica.
    """
    def create(self, validated_data):
        user = self.context['request'].user
        cart = getattr(user, 'cart', None)

        if not cart or not cart.items.exists():
            raise serializers.ValidationError("Tu carrito está vacío.")

        # Crear el pedido
        order = Order.objects.create(user=user)
        total_price = 0

        # Mover ítems del carrito al pedido
        for cart_item in cart.items.all():
            order_item = OrderItem.objects.create(
                order=order,
                content_type=cart_item.content_type,
                object_id=cart_item.object_id,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price_at_purchase=cart_item.item_price,
                rental_plan=cart_item.rental_plan
            )
            total_price += order_item.total_price
        
        # Actualizar el precio total del pedido
        order.total_price = total_price
        order.save()

        # Limpiar el carrito
        cart.items.all().delete()

        return order
