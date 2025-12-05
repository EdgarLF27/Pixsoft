# leasing/serializers.py
from rest_framework import serializers
from .models import RentalProduct, RentalContract, RentalPlan, RentalCategory

class RentalCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalCategory
        fields = ['id', 'name']

class RentalPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalPlan
        fields = ['id', 'product', 'period', 'base_price', 'maintenance_price']

class RentalProductSerializer(serializers.ModelSerializer):
    category = RentalCategorySerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    plans = RentalPlanSerializer(many=True, read_only=True)
    
    class Meta:
        model = RentalProduct
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'specifications', 'sku', 'stock_quantity',
            'is_available', 'plans'
        ]

class RentalContractSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    plan_period = serializers.CharField(source='plan.get_period_display', read_only=True)
    customer_username = serializers.CharField(source='customer.username', read_only=True)
    
    class Meta:
        model = RentalContract
        fields = [
            'id', 'customer', 'product', 'plan',
            'product_name', 'plan_period', 'customer_username',
            'start_date', 'end_date', 'total_cost',
            'is_signed', 'contract_document', 'status'
        ]
        extra_kwargs = {
            'customer': {'read_only': True}
        }