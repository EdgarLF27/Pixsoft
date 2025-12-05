import os
import django
import sys

# Configurar el entorno de Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pixsoft.settings')
django.setup()

from leasing.models import RentalCategory, RentalProduct, RentalPlan

def populate():
    print("Creando categorías...")
    cat_computers, _ = RentalCategory.objects.get_or_create(name="Computadoras Portátiles y de Escritorio")
    cat_servers, _ = RentalCategory.objects.get_or_create(name="Servidores y Equipos de Red")
    cat_printing, _ = RentalCategory.objects.get_or_create(name="Equipos de Impresión y Digitalización")

    print("Creando productos...")
    
    # --- Computadoras ---
    p1, _ = RentalProduct.objects.get_or_create(
        sku="LAP-DELL-001",
        defaults={
            "name": "Laptop Dell Latitude 5420",
            "description": "Laptop empresarial de alto rendimiento.",
            "category": cat_computers,
            "specifications": {
                "Procesador": "Intel Core i7-1185G7",
                "RAM": "16GB DDR4",
                "Almacenamiento": "512GB SSD NVMe",
                "Pantalla": "14 pulgadas FHD",
                "SO": "Windows 10 Pro"
            },
            "stock_quantity": 10
        }
    )
    
    p2, _ = RentalProduct.objects.get_or_create(
        sku="PC-HP-001",
        defaults={
            "name": "PC HP EliteDesk 800 G6",
            "description": "PC de escritorio formato SFF.",
            "category": cat_computers,
            "specifications": {
                "Procesador": "Intel Core i5-10500",
                "RAM": "8GB DDR4",
                "Almacenamiento": "256GB SSD",
                "Gráficos": "Integrados",
                "SO": "Windows 11 Pro"
            },
            "stock_quantity": 5
        }
    )

    # --- Servidores ---
    p3, _ = RentalProduct.objects.get_or_create(
        sku="SRV-DELL-001",
        defaults={
            "name": "Servidor Dell PowerEdge R740",
            "description": "Servidor en rack para virtualización.",
            "category": cat_servers,
            "specifications": {
                "Procesador": "2x Intel Xeon Gold 6248R",
                "RAM": "128GB ECC",
                "Almacenamiento": "4x 1.92TB SSD SAS",
                "Red": "4x 10GbE SFP+",
                "Fuente": "Redundante 1100W"
            },
            "stock_quantity": 2
        }
    )
    
    p4, _ = RentalProduct.objects.get_or_create(
        sku="SW-CISCO-001",
        defaults={
            "name": "Switch Cisco Catalyst 9200",
            "description": "Switch de acceso empresarial.",
            "category": cat_servers,
            "specifications": {
                "Puertos": "48x 1GbE PoE+",
                "Uplinks": "4x 10GbE SFP+",
                "Capacidad": "176 Gbps",
                "Stacking": "Soportado"
            },
            "stock_quantity": 4
        }
    )

    # --- Impresión ---
    p5, _ = RentalProduct.objects.get_or_create(
        sku="PRN-XEROX-001",
        defaults={
            "name": "Multifuncional Xerox VersaLink C405",
            "description": "Impresora multifuncional color.",
            "category": cat_printing,
            "specifications": {
                "Tipo": "Láser Color",
                "Velocidad": "36 ppm",
                "Funciones": "Impresión, Copia, Escaneo, Fax",
                "Conectividad": "Ethernet, USB, NFC",
                "Ciclo mensual": "Hasta 80,000 páginas"
            },
            "stock_quantity": 8
        }
    )

    print("Creando planes...")
    products = [p1, p2, p3, p4, p5]
    periods = ['DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL']
    
    for prod in products:
        base_price = 100.00 # Precio base dummy
        if prod.category == cat_servers: base_price = 500.00
        if prod.category == cat_printing: base_price = 200.00
        
        for period in periods:
            multiplier = 1
            if period == 'WEEKLY': multiplier = 5
            if period == 'MONTHLY': multiplier = 20
            if period == 'ANNUAL': multiplier = 200
            
            RentalPlan.objects.get_or_create(
                product=prod,
                period=period,
                defaults={
                    "base_price": base_price * multiplier,
                    "maintenance_price": (base_price * multiplier) * 0.10 # 10% mantenimiento
                }
            )

    print("¡Datos poblados exitosamente!")

if __name__ == '__main__':
    populate()
