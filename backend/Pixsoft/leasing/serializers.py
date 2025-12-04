from rest_framework import serializers
from .models import RentalProduct, RentalPlan, RentalContract, RentalCategory, User # Importar RentalContract y User

# --- Serializador de Producto ---
class RentalCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalCategory
        fields = '__all__'

class RentalProductSerializer(serializers.ModelSerializer):
    """Serializador para mostrar la información del producto de arrendamiento."""
    
    # Usamos SerializerMethodField para mostrar las especificaciones de manera bonita
    # specs_list = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = RentalProduct
        fields = ['id', 'name', 'category_name', 'specifications', 'sku', 'stock_quantity', 'is_available']
        
    # def get_specs_list(self, obj):
    #     # Devuelve las especificaciones como una lista de pares clave: valor
    #     return [{'key': k, 'value': v} for k, v in obj.specifications.items()]

# --- Serializador de Cotización (Input) ---
class RentalQuoteSerializer(serializers.Serializer):
    """Serializador para manejar los datos de entrada para la cotización."""
    
    product_id = serializers.IntegerField()
    period = serializers.ChoiceField(choices=RentalPlan.RENTAL_PERIOD_CHOICES)
    duration = serializers.IntegerField(min_value=1, help_text="Número de periodos (e.g., 5 días, 3 meses)")
    include_maintenance = serializers.BooleanField(default=False)

    def validate_product_id(self, value):
        """Verifica si el producto de arrendamiento existe."""
        try:
            # Usamos is_available como método
            self.product = RentalProduct.objects.get(pk=value, stock_quantity__gt=0)
        except RentalProduct.DoesNotExist:
            raise serializers.ValidationError("Producto de arrendamiento no válido o no disponible.")
        return value

    def validate(self, data):
        """Verifica si existe un plan de arrendamiento para el periodo seleccionado."""
        try:
            self.plan = RentalPlan.objects.get(product=self.product, period=data['period'])
        except RentalPlan.DoesNotExist:
            raise serializers.ValidationError(
                f"No hay un plan de arrendamiento de tipo '{data['period']}' para este producto."
            )
        data['product'] = self.product
        data['plan'] = self.plan
        return data

# --- Serializador de Contrato (Input/Output) ---
class RentalContractSerializer(serializers.ModelSerializer):
    """Serializador para crear y mostrar contratos de arrendamiento."""
    
    # Estos campos son de solo lectura y se muestran en la respuesta (GET)
    customer_username = serializers.CharField(source='customer.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    plan_period = serializers.CharField(source='plan.get_period_display', read_only=True)

    class Meta:
        model = RentalContract
        # Listado de campos para la creación (POST)
        fields = [
            'id', 'customer', 'product', 'plan', 'start_date', 'end_date',
            'total_cost', 'is_signed', 'contract_document', 'status',
            'customer_username', 'product_name', 'plan_period'
        ]
        # total_cost y contract_document serán calculados por la vista, no ingresados por el usuario
        read_only_fields = ['total_cost', 'contract_document']