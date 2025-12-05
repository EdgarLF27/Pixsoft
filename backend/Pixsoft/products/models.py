from django.db import models
from django.contrib.auth import get_user_model 

User = get_user_model()

# --- 4.1 Categorías y Subcategorías (Jerárquicas) ---

class SaleCategory(models.Model):
    """Modelo para categorías y subcategorías jerárquicas (Cables, Componentes, etc.)."""
    
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre de la Categoría")
    
    # Campo para Subcategorías (Relación Padre-Hijo)
    parent = models.ForeignKey(
        'self', 
        null=True, 
        blank=True, 
        related_name='subcategories', 
        on_delete=models.SET_NULL,
        verbose_name="Categoría Padre"
    )
    
    class Meta:
        verbose_name_plural = "Categorías de Venta"
        
    def __str__(self):
        return self.name

# --- 4.1 Productos ---

class SaleProduct(models.Model):
    """Modelo para productos físicos de venta (Hardware, accesorios, etc.)."""
    
    name = models.CharField(max_length=255, verbose_name="Nombre del Producto")
    
    # Atributos principales requeridos (marca, modelo, precio)
    brand = models.CharField(max_length=100, blank=True, verbose_name="Marca")
    model = models.CharField(max_length=100, blank=True, verbose_name="Modelo")
    description = models.TextField(verbose_name="Descripción y Características")
    
    # 4.1 Manejo de Stock
    sku = models.CharField(max_length=50, unique=True, verbose_name="Código SKU")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio de Venta")
    stock_quantity = models.IntegerField(default=0, verbose_name="Stock Disponible")
    
    # Relación con la Categoría
    category = models.ForeignKey(
        SaleCategory, 
        on_delete=models.PROTECT, 
        related_name='products',
        verbose_name="Categoría"
    ) 
    
    # Campo para la imagen del producto
    image = models.ImageField(upload_to='product_pics/', blank=True, null=True, verbose_name="Imagen del Producto")
    
    # 4.1 Atributos Personalizados (JSONField para flexibilidad)
    # Almacena detalles específicos como 'tipo_conector', 'velocidad', 'compatibilidad'.
    custom_attributes = models.JSONField(
        default=dict,
        help_text="Atributos específicos del producto (e.g., {'Tipo Conector': 'HDMI', 'Velocidad': '10Gbps'})"
    )
    
    # Imagen del producto
    image = models.ImageField(
        upload_to='products/',
        null=True,
        blank=True,
        verbose_name="Imagen del Producto"
    )

    
    # Propiedad de disponibilidad
    @property
    def is_available(self):
        """Control de disponibilidad en función del stock."""
        return self.stock_quantity > 0

    def __str__(self):
        return f"[{self.category.name}] {self.name} ({self.brand})"