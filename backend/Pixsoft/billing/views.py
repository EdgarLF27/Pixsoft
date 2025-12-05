from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Invoice, Payment
from .serializers import InvoiceSerializer, PaymentSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Invoice.objects.all().order_by('-issued_at')
        return Invoice.objects.filter(user=user).order_by('-issued_at')

    @action(detail=True, methods=['get'])
    def generate_pdf(self, request, pk=None):
        """
        Simula la generación de un PDF.
        En producción, esto usaría ReportLab o WeasyPrint.
        """
        invoice = self.get_object()
        # Mock response
        return Response({
            "message": f"PDF generado para factura {invoice.invoice_number}",
            "url": "/static/mock_invoice.pdf" # Placeholder
        })

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-timestamp')
    serializer_class = PaymentSerializer

    def create(self, request, *args, **kwargs):
        """
        Procesa un pago simulado.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Simulación de procesamiento de pago
        payment = serializer.save()
        
        # Actualizar estado a COMPLETADO (Mock)
        payment.status = 'COMPLETED'
        payment.transaction_id = f"TXN-{payment.id}-MOCK"
        payment.save()
        
        # Actualizar factura si el pago cubre el monto
        invoice = payment.invoice
        if invoice.status != 'PAID':
            # Lógica simple: si hay un pago completado, marcar como pagada
            invoice.status = 'PAID'
            invoice.paid_at = timezone.now()
            invoice.save()
            
        return Response(serializer.data, status=status.HTTP_201_CREATED)
