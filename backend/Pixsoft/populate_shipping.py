import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pixsoft.settings')
django.setup()

from shipping.models import ShippingMethod

def populate_shipping():
    methods = [
        {'name': 'Estándar Nacional', 'type': 'NATIONAL', 'base_cost': 150.00, 'estimated_delivery_days': 5},
        {'name': 'Express Nacional', 'type': 'NATIONAL', 'base_cost': 300.00, 'estimated_delivery_days': 2},
        {'name': 'Internacional Básico', 'type': 'INTERNATIONAL', 'base_cost': 800.00, 'estimated_delivery_days': 15},
        {'name': 'Entrega Local (Arrendamiento)', 'type': 'LOCAL', 'base_cost': 0.00, 'estimated_delivery_days': 1},
    ]

    for m in methods:
        obj, created = ShippingMethod.objects.get_or_create(name=m['name'], defaults=m)
        if created:
            print(f"Creado método: {obj.name}")
        else:
            print(f"Ya existe: {obj.name}")

if __name__ == '__main__':
    populate_shipping()
