import os
import django
import sys

# Configurar el entorno de Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pixsoft.settings')
django.setup()

from products.models import SaleCategory, SaleProduct

def populate():
    print("Creando categorías y subcategorías...")
    
    # Computadoras
    cat_computers, _ = SaleCategory.objects.get_or_create(name="Computadoras")
    SaleCategory.objects.get_or_create(name="Laptops", parent=cat_computers)
    SaleCategory.objects.get_or_create(name="Desktops", parent=cat_computers)
    SaleCategory.objects.get_or_create(name="Servidores", parent=cat_computers)

    # Componentes
    cat_components, _ = SaleCategory.objects.get_or_create(name="Componentes")
    SaleCategory.objects.get_or_create(name="Procesadores", parent=cat_components)
    SaleCategory.objects.get_or_create(name="Tarjetas Madre", parent=cat_components)
    SaleCategory.objects.get_or_create(name="Memorias RAM", parent=cat_components)
    SaleCategory.objects.get_or_create(name="Discos Duros", parent=cat_components)

    # Cables
    cat_cables, _ = SaleCategory.objects.get_or_create(name="Cables y Adaptadores")
    SaleCategory.objects.get_or_create(name="HDMI", parent=cat_cables)
    SaleCategory.objects.get_or_create(name="USB", parent=cat_cables)
    SaleCategory.objects.get_or_create(name="Ethernet", parent=cat_cables)

    # Periféricos
    cat_peripherals, _ = SaleCategory.objects.get_or_create(name="Periféricos")
    SaleCategory.objects.get_or_create(name="Monitores", parent=cat_peripherals)
    SaleCategory.objects.get_or_create(name="Teclados", parent=cat_peripherals)
    SaleCategory.objects.get_or_create(name="Mouse", parent=cat_peripherals)

    print("Creando productos...")
    
    # Laptop
    laptops_cat = SaleCategory.objects.get(name="Laptops")
    SaleProduct.objects.get_or_create(
        sku="LAP-HP-001",
        defaults={
            "name": "Laptop HP Pavilion 15",
            "brand": "HP",
            "model": "Pavilion 15-eg0000",
            "description": "Laptop ideal para trabajo y entretenimiento.",
            "category": laptops_cat,
            "price": 15499.00,
            "stock_quantity": 12,
            "custom_attributes": {
                "Procesador": "Intel Core i5",
                "RAM": "8GB",
                "Almacenamiento": "512GB SSD"
            }
        }
    )

    # Cable HDMI
    hdmi_cat = SaleCategory.objects.get(name="HDMI")
    SaleProduct.objects.get_or_create(
        sku="CBL-HDMI-001",
        defaults={
            "name": "Cable HDMI 2.1 8K",
            "brand": "Ugreen",
            "model": "HD140",
            "description": "Cable de alta velocidad para transmisión de video 8K.",
            "category": hdmi_cat,
            "price": 299.00,
            "stock_quantity": 45,
            "custom_attributes": {
                "Longitud": "2m",
                "Conector A": "HDMI Macho",
                "Conector B": "HDMI Macho",
                "Velocidad": "48Gbps"
            }
        }
    )

    # Procesador
    cpu_cat = SaleCategory.objects.get(name="Procesadores")
    SaleProduct.objects.get_or_create(
        sku="CPU-AMD-001",
        defaults={
            "name": "Procesador AMD Ryzen 5 5600X",
            "brand": "AMD",
            "model": "Ryzen 5 5600X",
            "description": "Procesador de 6 núcleos para gaming.",
            "category": cpu_cat,
            "price": 3200.00,
            "stock_quantity": 3,
            "custom_attributes": {
                "Socket": "AM4",
                "Núcleos": "6",
                "Hilos": "12",
                "Frecuencia Base": "3.7GHz"
            }
        }
    )

    print("¡Datos de productos poblados exitosamente!")

if __name__ == '__main__':
    populate()
