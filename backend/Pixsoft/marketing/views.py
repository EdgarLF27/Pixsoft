from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.utils import timezone
from .models import Promotion, Coupon, Campaign, Banner
from .serializers import PromotionSerializer, CouponSerializer, CampaignSerializer, BannerSerializer

class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = [IsAdminUser] # Solo admins crean promos

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def validate(self, request):
        code = request.data.get('code')
        try:
            coupon = Coupon.objects.get(code=code)
            if coupon.is_valid():
                return Response({
                    'valid': True,
                    'discount_amount': coupon.discount_amount,
                    'discount_percentage': coupon.discount_percentage,
                    'message': 'Cupón aplicado correctamente'
                })
            else:
                return Response({'valid': False, 'message': 'Cupón vencido o agotado'}, status=status.HTTP_400_BAD_REQUEST)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'message': 'Cupón no válido'}, status=status.HTTP_404_NOT_FOUND)

class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        campaign = self.get_object()
        # Lógica simulada de envío de correos
        print(f"Enviando campaña '{campaign.subject}' a {campaign.recipients}...")
        campaign.sent_at = timezone.now()
        campaign.save()
        return Response({'status': 'Campaña enviada (simulada)'})

class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.filter(is_active=True)
    serializer_class = BannerSerializer
    permission_classes = [AllowAny] # Público puede ver banners
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions

class PromotionActiveListView(generics.ListAPIView):
    """List only active promotions"""
    queryset = Promotion.objects.filter(is_active=True)
    serializer_class = PromotionSerializer
    permission_classes = [permissions.AllowAny]

class CouponApplyView(APIView):
    """Validate and return discount info for a coupon code"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        try:
            coupon = Coupon.objects.get(code=code)
            if coupon.is_valid():
                return Response({
                    'valid': True,
                    'discount_amount': coupon.discount_amount,
                    'discount_percentage': coupon.discount_percentage,
                    'message': 'Cupón válido'
                })
            else:
                return Response({'valid': False, 'message': 'Cupón vencido o agotado'}, status=400)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'message': 'Cupón no encontrado'}, status=404)
