from django.contrib import admin
from .models import RentalCategory, RentalProduct, RentalPlan, RentalContract

# --- Inline para añadir Planes dentro de la vista de Producto ---

class RentalPlanInline(admin.TabularInline):
    model = RentalPlan
    extra = 1 

# ----------------------------------------------------------------
# --- Administrador del Producto (Con el Fix para el list_filter) ---
# ----------------------------------------------------------------

@admin.register(RentalProduct)
class RentalProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'sku', 'stock_quantity', 'available_for_rental')
    
   # ¡LA CORRECCIÓN FINAL AQUÍ!
    # Usamos el campo real del modelo que Django puede verificar: 'stock_quantity'
    list_filter = ('category', 'stock_quantity')
    search_fields = ('name', 'sku', 'description')
    inlines = [RentalPlanInline]
    
    # Las propiedades no se listan en readonly_fields
    readonly_fields = () 

    # --- Método Auxiliar para Filtrar y Mostrar Estado ---
    def available_for_rental(self, obj):
        """Usa la propiedad is_available del modelo."""
        # Se llama a la propiedad del modelo
        return obj.is_available
    
    available_for_rental.boolean = True 
    # Permite ordenar el filtro por el campo real 'stock_quantity'
    available_for_rental.admin_order_field = 'stock_quantity' 
    available_for_rental.short_description = 'Disponible para Arrendar'

# ----------------------------------------------------------------
# --- Administrador del Contrato ---
# ----------------------------------------------------------------

@admin.register(RentalContract)
class RentalContractAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'product', 'start_date', 'end_date', 'total_cost', 'is_signed', 'status')
    list_filter = ('status', 'is_signed', 'start_date', 'plan')
    search_fields = ('customer__username', 'product__name')
    readonly_fields = ('total_cost',)

# ----------------------------------------------------------------
# --- Administrador de la Categoría ---
# ----------------------------------------------------------------

@admin.register(RentalCategory)
class RentalCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)