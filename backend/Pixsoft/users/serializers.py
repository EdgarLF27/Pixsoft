from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    ap_p = serializers.CharField(source='father_last_name', allow_blank=True, required=False)
    ap_m = serializers.CharField(source='mother_last_name', allow_blank=True, required=False)

    class Meta:
        model = Profile
        fields = ['ap_p', 'ap_m', 'shipping_address', 'billing_address', 'phone_number']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)
    name = serializers.CharField(source='first_name', required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'name', 'profile']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '')
        )
        
        # The post_save signal creates the profile. We just update it.
        # This handles the case where profile_data is empty.
        Profile.objects.filter(user=user).update(**profile_data)
        
        return user


