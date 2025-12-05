from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ShippingMethod, Shipment
from .serializers import ShippingMethodSerializer, ShipmentSerializer

class ShippingMethodViewSet(viewsets.ModelViewSet):
    queryset = ShippingMethod.objects.all()
    serializer_class = ShippingMethodSerializer

class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all().order_by('-created_at')
    serializer_class = ShipmentSerializer

    @action(detail=False, methods=['get'])
    def track(self, request):
        """Endpoint público para rastrear por número de seguimiento"""
        tracking_number = request.query_params.get('tracking_number')
        if not tracking_number:
            return Response({"error": "Número de seguimiento requerido"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            shipment = Shipment.objects.get(tracking_number=tracking_number)
            serializer = self.get_serializer(shipment)
            return Response(serializer.data)
        except Shipment.DoesNotExist:
            return Response({"error": "Envío no encontrado"}, status=status.HTTP_404_NOT_FOUND)
