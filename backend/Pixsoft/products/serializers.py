from rest_framework import serializers
from .models import SaleCategory, SaleProduct

# --- Serializadores de Categoría ---

class SaleCategorySerializer(serializers.ModelSerializer):
    # Campo para manejar la jerarquía de subcategorías
    subcategories = serializers.SerializerMethodField()
    
    class Meta:
        model = SaleCategory
        fields = ['id', 'name', 'parent', 'subcategories']
        
    def get_subcategories(self, obj):
        # Recursivamente serializa las subcategorías hijas
        # Usamos context=self.context para permitir la serialización recursiva
        return SaleCategorySerializer(obj.subcategories.all(), many=True, context=self.context).data

# --- Serializador de Producto ---

class SaleProductSerializer(serializers.ModelSerializer):
    """Serializador para mostrar la información detallada del producto."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = SaleProduct
        fields = [
            'id', 'name', 'brand', 'model', 'description', 
            'category', 'category_name', 'price', 
            'stock_quantity', 'is_available', 'custom_attributes', 'sku'
        ]
        read_only_fields = ['is_available']