from django.db import models
from leasing.models import RentalContract

class ShippingMethod(models.Model):
    """Métodos de envío disponibles (Nacional, Internacional, Local, etc.)"""
    TYPE_CHOICES = [
        ('NATIONAL', 'Nacional'),
        ('INTERNATIONAL', 'Internacional'),
        ('LOCAL', 'Local (Entrega/Recogida)'),
    ]

    name = models.CharField(max_length=100, verbose_name="Nombre del Método")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='NATIONAL')
    base_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Costo Base")
    cost_per_kg = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Costo por Kg (Opcional)")
    estimated_delivery_days = models.PositiveIntegerField(default=3, verbose_name="Días Estimados")

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

class Shipment(models.Model):
    """Registro de un envío o movimiento logístico."""
    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('PROCESSING', 'Procesando'),
        ('SHIPPED', 'Enviado'),
        ('IN_TRANSIT', 'En Tránsito'),
        ('DELIVERED', 'Entregado'),
        ('RETURNED', 'Devuelto'),
        ('SCHEDULED_PICKUP', 'Programado para Recogida'),
        ('PICKED_UP', 'Recogido'),
    ]

    tracking_number = models.CharField(max_length=100, unique=True, null=True, blank=True, verbose_name="Número de Seguimiento")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name="Estado")
    
    shipping_method = models.ForeignKey(ShippingMethod, on_delete=models.PROTECT, verbose_name="Método de Envío")
    
    origin_address = models.TextField(verbose_name="Dirección de Origen")
    destination_address = models.TextField(verbose_name="Dirección de Destino")
    
    # Para logística de arrendamientos
    scheduled_date = models.DateTimeField(null=True, blank=True, verbose_name="Fecha Programada (Entrega/Recogida)")
    related_contract = models.ForeignKey(RentalContract, on_delete=models.SET_NULL, null=True, blank=True, related_name='shipments', verbose_name="Contrato Relacionado")
    
    # Datos rápidos del cliente (por si no hay contrato o es venta directa)
    customer_name = models.CharField(max_length=200, verbose_name="Nombre Cliente")
    customer_email = models.EmailField(verbose_name="Email Cliente")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Envío #{self.id} - {self.tracking_number or 'Sin Tracking'} ({self.status})"
