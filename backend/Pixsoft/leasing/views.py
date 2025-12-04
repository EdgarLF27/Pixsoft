from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny # Importar AllowAny
from .models import RentalProduct, RentalPlan, RentalContract
from .serializers import RentalQuoteSerializer, RentalProductSerializer, RentalContractSerializer
from decimal import Decimal
import datetime
from django.utils import timezone

# --- Lógica Auxiliar de Cálculo ---
# NOTA: Esta es una función simplificada para calcular la duración.
def calculate_duration_in_units(start_date, end_date, period_type):
    """Calcula la duración en la unidad del periodo (días, semanas, meses, años)."""
    
    if start_date >= end_date:
        return 0

    duration = end_date - start_date
    
    if period_type == 'DAILY':
        return duration.days
    elif period_type == 'WEEKLY':
        # Calcula semanas redondeando hacia arriba
        return (duration.days + 6) // 7
    elif period_type == 'MONTHLY':
        # Cálculo simple de meses. Mejor usar una librería para precisión.
        return (duration.days / 30)
    elif period_type == 'ANNUAL':
        return (duration.days / 365)
    
    return 1 # Fallback

# -----------------------------------------------------------------------------------
# --- Vistas para Listar Productos y Cotizaciones (Mantienes tu estructura APIView) ---
# -----------------------------------------------------------------------------------

class ProductListView(APIView):
    """Lista todos los productos disponibles para arrendamiento."""
    permission_classes = [AllowAny]
    def get(self, request):
        products = RentalProduct.objects.filter(stock_quantity__gt=0)
        serializer = RentalProductSerializer(products, many=True)
        return Response(serializer.data)

class RentalQuoteView(APIView):
    """Endpoint para calcular la cotización de un arrendamiento."""
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RentalQuoteSerializer(data=request.data)
        
        if serializer.is_valid():
            data = serializer.validated_data
            
            product = data['product']
            plan = data['plan']
            duration = data['duration']
            include_maintenance = data['include_maintenance']
            
            # --- Lógica de Cálculo de Cotización ---
            base_cost = plan.base_price * Decimal(duration)
            
            maintenance_cost = Decimal(0.00)
            if include_maintenance:
                maintenance_cost = plan.maintenance_price * Decimal(duration)
            
            total_cost = base_cost + maintenance_cost
            
            # --- Respuesta de Cotización ---
            response_data = {
                "product_id": product.id,
                "product_name": product.name,
                "period": plan.get_period_display(),
                "duration": duration,
                "base_price_per_unit": plan.base_price,
                "maintenance_price_per_unit": plan.maintenance_price,
                "total_base_cost": base_cost,
                "maintenance_cost": maintenance_cost,
                "total_cost": total_cost,
                "message": "Cotización calculada exitosamente."
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -----------------------------------------------------------------------------------
# --- ViewSet para Contratos (Implementa la lógica del requisito final) ---
# -----------------------------------------------------------------------------------

class RentalContractViewSet(viewsets.ModelViewSet):
    """
    Permite crear, ver y actualizar Contratos de Arrendamiento.
    Implementa la lógica de: 1. Cálculo de total_cost, 2. Llenado de contract_document.
    """
    queryset = RentalContract.objects.all().select_related('product', 'plan', 'customer')
    serializer_class = RentalContractSerializer
    permission_classes = [AllowAny] # Temporalmente AllowAny para Postman
    
    # Sobrescribimos el método de creación
    def perform_create(self, serializer):
        
        plan = serializer.validated_data['plan']
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']
        
        # 1. CÁLCULO DEL COSTO TOTAL BASADO EN LA DURACIÓN
        
        # Obtener el número de unidades de periodo (ej: 12 meses)
        # Esto usará la función auxiliar. Usamos el campo period del plan.
        duration_units = calculate_duration_in_units(start_date, end_date, plan.period)
        
        if duration_units <= 0:
             # Este es un error que debería capturar el Serializer
             raise serializers.ValidationError({"end_date": "La fecha de finalización debe ser posterior a la de inicio."})

        # Costo total (Base + Mantenimiento) * Duración
        total_cost_calculated = (plan.base_price + plan.maintenance_price) * Decimal(duration_units)

        # 2. LLENADO DEL DOCUMENTO DE TÉRMINOS Y CONDICIONES
        
        # Creamos una plantilla de contrato con los datos dinámicos
        contract_terms = f"""
        CONTRATO DE ARRENDAMIENTO PIXSOFT

        FECHA DE INICIO: {start_date}
        FECHA DE FINALIZACIÓN: {end_date}
        DURACIÓN ESTIMADA: {duration_units} {plan.get_period_display().lower()}s.

        EQUIPO: {plan.product.name} ({plan.product.sku})
        ESPECIFICACIONES PRINCIPALES: {plan.product.specifications}

        TARIFA BASE POR PERIODO: ${plan.base_price}
        TARIFA MANTENIMIENTO/SEGURO: ${plan.maintenance_price}
        ------------------------------------------
        COSTO TOTAL DEL CONTRATO: ${total_cost_calculated}

        TÉRMINOS LEGALES: El presente contrato establece un compromiso de arrendamiento
        no cancelable y está sujeto a las cláusulas estándar de Pixsoft disponibles en nuestro sitio web.
        """
        
        # 3. Guardar el objeto, inyectando los valores calculados
        serializer.save(
            total_cost=total_cost_calculated,
            contract_document=contract_terms,
            status='PENDING', # El estado por defecto es Pendiente de firma/pago
            is_signed=False # Por defecto, no está firmado
        )