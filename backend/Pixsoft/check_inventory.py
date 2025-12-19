import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pixsoft.settings')
django.setup()

from products.models import SaleProduct
from leasing.models import RentalProduct

print(f"Sale Products: {SaleProduct.objects.count()}")
print(f"Rental Products: {RentalProduct.objects.count()}")
