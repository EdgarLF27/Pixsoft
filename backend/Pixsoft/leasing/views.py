# leasing/views.py
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import RentalProduct, RentalContract, RentalPlan, RentalCategory
from .serializers import RentalProductSerializer, RentalContractSerializer, RentalPlanSerializer
from decimal import Decimal
import datetime
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from datetime import datetime as dt

# Vista para productos
class ProductListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        products = RentalProduct.objects.all()
        serializer = RentalProductSerializer(products, many=True)
        return Response(serializer.data)

# Vista para contratos
class ContractViewSet(viewsets.ModelViewSet):
    queryset = RentalContract.objects.all()
    serializer_class = RentalContractSerializer
    permission_classes = [AllowAny]

# Vista para planes
class PlanListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        plans = RentalPlan.objects.all()
        serializer = RentalPlanSerializer(plans, many=True)
        return Response(serializer.data)

# VISTA DE COTIZACIÓN - ¡ESTA ES LA QUE FALTABA!
@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_quote(request):
    try:
        data = request.data
        
        # Obtener datos de la solicitud
        product_id = data.get('product_id')
        period = data.get('period', 'MONTHLY')
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')
        
        # Validaciones básicas
        if not all([product_id, start_date_str, end_date_str]):
            return Response(
                {'error': 'Faltan campos requeridos: product_id, start_date, end_date'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener el producto
        try:
            product = RentalProduct.objects.get(id=product_id)
        except RentalProduct.DoesNotExist:
            return Response(
                {'error': 'Producto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener el plan correspondiente
        try:
            plan = RentalPlan.objects.get(product=product, period=period)
        except RentalPlan.DoesNotExist:
            # Listar los planes disponibles para este producto
            available_plans = RentalPlan.objects.filter(product=product)
            available_periods = [p.get_period_display() for p in available_plans]
            
            return Response({
                'error': f'No hay un plan {period} para este producto',
                'available_plans': available_periods,
                'product_name': product.name
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calcular duración
        start_date = dt.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = dt.strptime(end_date_str, '%Y-%m-%d').date()
        duration_days = (end_date - start_date).days
        
        if duration_days <= 0:
            return Response(
                {'error': 'La fecha de fin debe ser posterior a la fecha de inicio'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calcular cantidad de periodos
        period_multiplier = {
            'DAILY': 1,
            'WEEKLY': 7,
            'MONTHLY': 30,  # Simplificado
            'ANNUAL': 365   # Simplificado
        }
        
        duration_units = max(1, duration_days // period_multiplier.get(period, 30))
        
        # Calcular costo total
        base_cost = plan.base_price * Decimal(duration_units)
        maintenance_cost = plan.maintenance_price * Decimal(duration_units)
        total_cost = base_cost + maintenance_cost
        
        # Generar documento de contrato
        contract_document = f"""CONTRATO DE ARRENDAMIENTO - {product.name}

DETALLES DEL CONTRATO:
• Producto: {product.name}
• SKU: {product.sku}
• Plan: {plan.get_period_display()}
• Periodo: {start_date_str} a {end_date_str}
• Duración: {duration_days} días ({duration_units} {plan.get_period_display().lower()}(s))

DETALLES DE COSTO:
• Precio base por {plan.get_period_display().lower()}: ${float(plan.base_price):.2f}
• Mantenimiento/seguro por {plan.get_period_display().lower()}: ${float(plan.maintenance_price):.2f}
• Costo base: ${float(base_cost):.2f}
• Costo mantenimiento: ${float(maintenance_cost):.2f}
• TOTAL: ${float(total_cost):.2f}

TÉRMINOS Y CONDICIONES:
1. El equipo debe ser devuelto en las mismas condiciones.
2. Cualquier daño será responsabilidad del arrendatario.
3. El pago debe realizarse al inicio del contrato.
4. Cancelaciones con menos de 24h de anticipación incurren en penalización.

FIRMA DEL CLIENTE: _________________________
FECHA: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"""
        
        return Response({
            'product_id': product.id,
            'product_name': product.name,
            'plan_id': plan.id,
            'plan_period': plan.get_period_display(),
            'start_date': start_date_str,
            'end_date': end_date_str,
            'duration_days': duration_days,
            'duration_units': duration_units,
            'base_price_per_unit': float(plan.base_price),
            'maintenance_price_per_unit': float(plan.maintenance_price),
            'total_cost': float(total_cost),
            'contract_document': contract_document
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error interno: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )