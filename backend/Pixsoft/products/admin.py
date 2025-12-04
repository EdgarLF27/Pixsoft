from django.contrib import admin
from .models import SaleCategory, SaleProduct

# --- 1. Admin para Categorías ---

@admin.register(SaleCategory)
class SaleCategoryAdmin(admin.ModelAdmin):
    """
    Permite visualizar la estructura jerárquica (Categoría Padre/Hijo).
    """
    list_display = ('name', 'parent', 'id')
    list_filter = ('parent',)
    search_fields = ('name',)
    
    # Campo 'parent' se muestra como un selector
    fieldsets = (
        (None, {
            'fields': ('name', 'parent')
        }),
    )

# --- 2. Admin para Productos ---

@admin.register(SaleProduct)
class SaleProductAdmin(admin.ModelAdmin):
    """
    Permite gestionar Stock, Atributos Personalizados, Marca y Precio.
    """
    list_display = (
        'name', 'category', 'brand', 'price', 
        'sku', 'stock_quantity', 'is_available'
    )
    # Filtro por Categoría y Disponibilidad (stock > 0)
    list_filter = ('category', 'brand', 'stock_quantity')
    search_fields = ('name', 'sku', 'brand', 'model')
    
    # Especifica el orden de los campos en el formulario de edición
    fieldsets = (
        ('Información General', {
            'fields': ('name', 'brand', 'model', 'category', 'description')
        }),
        ('Inventario y Precio', {
            'fields': ('sku', 'price', 'stock_quantity')
        }),
        # Usa el JSONField para los atributos personalizados
        ('Atributos Específicos', {
            'description': "Ej. {'Tipo Conector': 'HDMI', 'Velocidad': '10Gbps'}",
            'fields': ('custom_attributes',)
        }),
    )
    # is_available es una propiedad, Django la infiere
    readonly_fields = () 

    # Muestra el estado de disponibilidad como un booleano (check mark)
    def is_available(self, obj):
        return obj.is_available
    is_available.boolean = True
    is_available.short_description = 'Disponible'