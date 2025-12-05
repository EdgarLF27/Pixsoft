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
            'password': {'write_only': True, 'required': False},
            'username': {'required': False}
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
        Profile.objects.filter(user=user).update(**profile_data)
        
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})

        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        
        instance.save()

        if profile_data:
            # profile is a OneToOneField, so we access it directly
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


