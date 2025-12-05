from django.db.models.signals import post_save
from django.dispatch import receiver
from orders.models import Order
from leasing.models import RentalContract
from .models import Invoice

@receiver(post_save, sender=Order)
def create_invoice_for_order(sender, instance, created, **kwargs):
    """
    Genera automáticamente una factura cuando se crea una Orden.
    """
    if created:
        # Verificar si ya existe una factura para esta orden (por seguridad)
        if hasattr(instance, 'invoice'):
            return

        Invoice.objects.create(
            user=instance.user,
            order=instance,
            amount=instance.total_price,
            status='PENDING'
        )

@receiver(post_save, sender=RentalContract)
def create_invoice_for_rental(sender, instance, created, **kwargs):
    """
    Genera automáticamente una factura cuando se crea un Contrato de Arrendamiento.
    """
    if created:
        # Verificar si ya existe una factura para este contrato
        if hasattr(instance, 'invoice'):
            return

        Invoice.objects.create(
            user=instance.customer, # En RentalContract el usuario es 'customer'
            rental_contract=instance,
            amount=instance.total_cost,
            status='PENDING'
        )
