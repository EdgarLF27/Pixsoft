from django.db import models
from django.contrib.auth import get_user_model 

User = get_user_model()

# --- Modelos de Estructura de Producto ---

class RentalCategory(models.Model):
    """Categorías de Arrendamiento (Computadoras, Servidores, Impresión)"""
    
    name = models.CharField(max_length=100, unique=True, verbose_name="Categoría de Arrendamiento")
    
    class Meta:
        verbose_name_plural = "Categorías de Arrendamiento"
        
    def __str__(self):
        return self.name

class RentalProduct(models.Model):
    """Modelo para los productos que están disponibles para arrendamiento."""
    
    name = models.CharField(max_length=255, verbose_name="Nombre del Equipo")
    description = models.TextField(verbose_name="Descripción y Especificaciones")
    category = models.ForeignKey(
        RentalCategory, 
        on_delete=models.PROTECT, 
        related_name='rental_products'
    ) 
    
    # Requerimiento: Detalles de las especificaciones del equipo
    specifications = models.JSONField(
        default=dict,
        help_text="Detalles técnicos (e.g., {'RAM': '16GB', 'Procesador': 'i7'})"
    )
    
    sku = models.CharField(max_length=50, unique=True, verbose_name="Código de Inventario")
    stock_quantity = models.IntegerField(default=0, verbose_name="Cantidad en Inventario para Arrendamiento")
    
    @property
    def is_available(self):
        return self.stock_quantity > 0

    def __str__(self):
        return f"[{self.category.name}] {self.name}"

# --- Modelos de Planes y Contratos ---

class RentalPlan(models.Model):
    """Define los periodos y precios de arrendamiento para un producto."""
    
    RENTAL_PERIOD_CHOICES = [
        ('DAILY', 'Diario'),
        ('WEEKLY', 'Semanal'),
        ('MONTHLY', 'Mensual'),
        ('ANNUAL', 'Anual'),
    ]

    product = models.ForeignKey(RentalProduct, on_delete=models.CASCADE, related_name='plans')
    period = models.CharField(max_length=10, choices=RENTAL_PERIOD_CHOICES, verbose_name="Periodo")
    base_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Base por Periodo")
    
    # Requerimiento: Opciones de mantenimiento o seguros
    maintenance_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Costo Adicional de Mantenimiento/Seguro")
    
    class Meta:
        unique_together = ('product', 'period')
        verbose_name_plural = "Planes de Arrendamiento"
        
    def __str__(self):
        return f"{self.product.name} - {self.get_period_display()}"

class RentalContract(models.Model):
    """Representa un contrato de arrendamiento (el 'pedido')."""
    
    customer = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Cliente") 
    product = models.ForeignKey(RentalProduct, on_delete=models.PROTECT, verbose_name="Equipo Arrendado")
    plan = models.ForeignKey(RentalPlan, on_delete=models.PROTECT, verbose_name="Plan de Arrendamiento")
    
    start_date = models.DateField(verbose_name="Fecha de Inicio")
    end_date = models.DateField(verbose_name="Fecha de Finalización")
    
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Requerimiento: Opción para firmar contratos
    is_signed = models.BooleanField(default=False, verbose_name="Contrato Firmado")
    
    # Requerimiento: Detalle de los términos y condiciones de Arrendamiento
    contract_document = models.TextField(verbose_name="Términos y Condiciones del Contrato (Aplicados)") 
    
    CONTRACT_STATUS_CHOICES = [
        ('PENDING', 'Pendiente de Pago/Firma'),
        ('ACTIVE', 'Activo'),
        ('COMPLETED', 'Completado'),
        ('CANCELED', 'Cancelado'),
    ]
    status = models.CharField(max_length=10, choices=CONTRACT_STATUS_CHOICES, default='PENDING', verbose_name="Estado del Contrato")

    class Meta:
        verbose_name_plural = "Contratos de Arrendamiento"

    def __str__(self):
        return f"Contrato #{self.id} - {self.product.name} ({self.status})"