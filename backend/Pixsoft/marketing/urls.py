from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PromotionViewSet, CouponViewSet, CampaignViewSet, BannerViewSet, PromotionActiveListView, CouponApplyView

router = DefaultRouter()
router.register(r'promotions', PromotionViewSet)
router.register(r'coupons', CouponViewSet)
router.register(r'campaigns', CampaignViewSet)
router.register(r'banners', BannerViewSet)
# Removed router registration for PromotionActiveListView (generic view)


urlpatterns = [
    path('apply-coupon/', CouponApplyView.as_view(), name='apply-coupon'),
    path('active-promotions/', PromotionActiveListView.as_view(), name='active-promotions'),
    path('', include(router.urls)),
]
