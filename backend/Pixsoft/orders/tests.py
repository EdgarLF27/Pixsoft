from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Order, OrderItem, Cart
from products.models import SaleProduct, Category as SaleCategory
from leasing.models import RentalProduct, Category as RentalCategory, RentalPlan

User = get_user_model()

class OrderCreationTests(APITestCase):
    """
    Pruebas para el proceso de creación de un pedido desde el carrito.
    """

    def setUp(self):
        # --- Crear Usuario ---
        self.user = User.objects.create_user(username='testuser', password='testpassword')

        # --- Crear Productos ---
        sale_cat = SaleCategory.objects.create(name='Venta General')
        self.sale_product = SaleProduct.objects.create(
            name='Producto de Venta', 
            description='Un producto para comprar',
            price=100.00,
            stock=10,
            category=sale_cat
        )

        rental_cat = RentalCategory.objects.create(name='Alquiler General')
        self.rental_product = RentalProduct.objects.create(
            name='Producto de Alquiler',
            description='Un producto para alquilar',
            category=rental_cat
        )
        self.rental_plan = RentalPlan.objects.create(
            product=self.rental_product,
            plan_type='daily',
            base_price=25.00
        )

        # --- Crear Carrito y añadir items ---
        self.cart = Cart.objects.create(user=self.user)
        self.cart.items.create(
            product=self.sale_product,
            quantity=2
        )
        self.cart.items.create(
            product=self.rental_product,
            quantity=1,
            rental_plan=self.rental_plan
        )
        
        # --- Autenticar Cliente ---
        self.client.login(username='testuser', password='testpassword')

    def test_create_order_from_cart(self):
        """
        Verifica que un POST a /api/v1/orders/ crea un pedido correctamente.
        """
        # URL para crear un pedido
        url = '/api/v1/orders/'
        
        # Realizar la petición para crear el pedido
        response = self.client.post(url, {}, format='json')
        
        # --- Aserciones ---

        # 1. El estado de la respuesta debe ser 201 CREATED
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 2. Se debe haber creado un solo pedido para el usuario
        self.assertEqual(Order.objects.count(), 1)
        order = Order.objects.first()
        self.assertEqual(order.user, self.user)

        # 3. El pedido debe contener 2 ítems
        self.assertEqual(order.items.count(), 2)

        # 4. Verificar el precio total del pedido
        # (2 * 100.00) + (1 * 25.00) = 225.00
        self.assertEqual(order.total_price, 225.00)

        # 5. Verificar los datos de los ítems del pedido
        sale_order_item = order.items.get(object_id=self.sale_product.id)
        self.assertEqual(sale_order_item.price_at_purchase, self.sale_product.price)
        self.assertEqual(sale_order_item.quantity, 2)

        rental_order_item = order.items.get(object_id=self.rental_product.id)
        self.assertEqual(rental_order_item.price_at_purchase, self.rental_plan.base_price)
        self.assertEqual(rental_order_item.rental_plan, self.rental_plan)

        # 6. El carrito del usuario debe estar vacío
        self.cart.refresh_from_db()
        self.assertEqual(self.cart.items.count(), 0)

    def test_create_order_with_empty_cart(self):
        """
        Verifica que no se puede crear un pedido con un carrito vacío.
        """
        # Vaciar el carrito primero
        self.cart.items.all().delete()
        
        url = '/api/v1/orders/'
        response = self.client.post(url, {}, format='json')
        
        # La respuesta debe ser un 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # No se debe haber creado ningún pedido
        self.assertEqual(Order.objects.count(), 0)
