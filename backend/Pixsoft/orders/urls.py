from rest_framework.routers import DefaultRouter
from .views import CartViewSet

router = DefaultRouter()
# El basename es importante porque no estamos usando un queryset en el ViewSet
router.register(r'cart', CartViewSet, basename='cart')

urlpatterns = router.urls
