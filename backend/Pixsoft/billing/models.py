from django.db import models
from django.contrib.auth import get_user_model
from orders.models import Order
from leasing.models import RentalContract

User = get_user_model()

class Invoice(models.Model):
    """
    Representa una factura generada por una compra (Order) o un arrendamiento (RentalContract).
    """
    STATUS_CHOICES = (
        ('PENDING', 'Pendiente'),
        ('PAID', 'Pagada'),
        ('CANCELLED', 'Cancelada'),
        ('OVERDUE', 'Vencida'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices')
    
    # Relaciones opcionales: una factura puede ser de una Orden O de un Contrato
    order = models.OneToOneField(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoice')
    rental_contract = models.OneToOneField(RentalContract, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoice')
    
    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    issued_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    pdf_file = models.FileField(upload_to='invoices/', null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Generar número de factura simple: INV-TIMESTAMP-USERID
            import time
            self.invoice_number = f"INV-{int(time.time())}-{self.user.id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Factura {self.invoice_number} - {self.user.username} - ${self.amount}"

class Payment(models.Model):
    """
    Representa un intento de pago o transacción para una factura.
    """
    METHOD_CHOICES = (
        ('STRIPE', 'Stripe'),
        ('PAYPAL', 'PayPal'),
        ('CARD', 'Tarjeta de Crédito/Débito'),
        ('TRANSFER', 'Transferencia'),
    )
    
    STATUS_CHOICES = (
        ('PENDING', 'Procesando'),
        ('COMPLETED', 'Completado'),
        ('FAILED', 'Fallido'),
        ('REFUNDED', 'Reembolsado'),
    )

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='CARD')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pago {self.id} - {self.invoice.invoice_number} - {self.status}"
