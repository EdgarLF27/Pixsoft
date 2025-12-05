from django.contrib import admin
from .models import Cart, CartItem

class CartItemInline(admin.TabularInline):
    """
    Permite ver y editar los ítems del carrito directamente
    desde la vista de un Carrito.
    """
    model = CartItem
    extra = 0  # No mostrar formularios de ítems vacíos por defecto
    readonly_fields = ('product', 'item_price', 'total_price') # Campos que son calculados

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """
    Configuración del Admin para el modelo Cart.
    """
    list_display = ('user', 'created_at', 'updated_at')
    search_fields = ('user__username',)
    inlines = [CartItemInline] # Añade los ítems en la misma página de detalle del carrito

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """
    Configuración del Admin para el modelo CartItem.
    Útil para buscar o filtrar todos los ítems de carritos.
    """
    list_display = ('cart', 'product', 'quantity', 'rental_plan', 'total_price')
    list_filter = ('content_type',)
    search_fields = ('cart__user__username',)
