from django.db import models
from django.utils import timezone
from products.models import SaleProduct, SaleCategory

class Promotion(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Porcentaje de descuento (ej. 10.00 para 10%)")
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    # A qué aplica
    products = models.ManyToManyField(SaleProduct, blank=True, related_name='promotions')
    categories = models.ManyToManyField(SaleCategory, blank=True, related_name='promotions')

    def __str__(self):
        return f"{self.name} ({self.discount_percentage}%)"

    @property
    def is_valid(self):
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Monto fijo de descuento")
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Porcentaje de descuento")
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    usage_limit = models.PositiveIntegerField(default=100)
    used_count = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.code

    def is_valid(self):
        now = timezone.now()
        return (self.active and 
                self.valid_from <= now <= self.valid_to and 
                self.used_count < self.usage_limit)

class Campaign(models.Model):
    subject = models.CharField(max_length=255)
    content = models.TextField(help_text="Contenido HTML del correo")
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    RECIPIENT_CHOICES = (
        ('ALL', 'Todos los usuarios'),
        ('SUBSCRIBERS', 'Suscriptores'),
    )
    recipients = models.CharField(max_length=20, choices=RECIPIENT_CHOICES, default='ALL')

    def __str__(self):
        return self.subject

class Banner(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='banners/')
    link_url = models.URLField(blank=True)
    position = models.CharField(max_length=50, default='HOME_TOP')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
