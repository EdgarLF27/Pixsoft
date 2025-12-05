from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from leasing.models import RentalPlan

User = get_user_model()

class Cart(models.Model):
    """
    Modelo que representa el carrito de compras de un usuario.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Carrito de {self.user.username}"

class CartItem(models.Model):
    """
    Modelo que representa un ítem dentro del carrito de compras.
    Puede ser un producto de venta (SaleProduct) o un producto de arrendamiento (RentalProduct).
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    
    # GenericForeignKey para apuntar a SaleProduct o RentalProduct
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    product = GenericForeignKey('content_type', 'object_id')

    quantity = models.PositiveIntegerField(default=1)

    # Campo específico para productos de arrendamiento
    rental_plan = models.ForeignKey(RentalPlan, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        # Evita duplicados del mismo producto en el carrito, a menos que sea un plan de renta distinto
        unique_together = ('cart', 'content_type', 'object_id', 'rental_plan')

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    @property
    def item_price(self):
        """
        Calcula el precio del ítem.
        Si es un producto de venta, usa su precio.
        Si es un producto de arrendamiento, usa el precio base del plan.
        """
        if self.rental_plan:
            return self.rental_plan.base_price
        return self.product.price

    @property
    def total_price(self):
        """
        Calcula el precio total para este ítem (precio * cantidad).
        """
        return self.item_price * self.quantity

class Order(models.Model):
    """
    Modelo que representa un pedido de un usuario.
    """
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('processing', 'En proceso'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('canceled', 'Cancelado'),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Podríamos añadir más campos para la dirección de envío, método de pago, etc.
    # shipping_address = models.ForeignKey('users.Address', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Pedido #{self.id} de {self.user.username}"

class OrderItem(models.Model):
    """
    Modelo que representa un ítem dentro de un pedido.
    Guarda una instantánea del producto y precio en el momento de la compra.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')

    # Relación genérica para poder apuntar a cualquier tipo de producto
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    product = GenericForeignKey('content_type', 'object_id')
    
    quantity = models.PositiveIntegerField()
    # Guardamos el precio en el momento de la compra para mantener un histórico fiable
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    # Campo específico para productos de arrendamiento
    rental_plan = models.ForeignKey(RentalPlan, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Ítem de pedido {self.id} para el pedido #{self.order.id}"

    @property
    def total_price(self):
        return self.price_at_purchase * self.quantity
