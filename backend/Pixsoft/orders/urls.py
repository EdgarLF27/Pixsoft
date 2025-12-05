from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OrderViewSet

router = DefaultRouter()
# El basename es importante para 'cart' porque no estamos usando un queryset en el ViewSet
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = router.urls
