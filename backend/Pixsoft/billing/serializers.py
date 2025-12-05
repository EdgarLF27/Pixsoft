from rest_framework import serializers
from .models import Invoice, Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('status', 'transaction_id', 'timestamp')

class InvoiceSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ('invoice_number', 'issued_at', 'paid_at', 'pdf_file')
