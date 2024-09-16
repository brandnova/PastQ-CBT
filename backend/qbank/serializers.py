from rest_framework import serializers
from .models import User, GlobalSettings

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'password', 'is_subscribed', 'payment_reference', 'trial_calls', 'trial_complete']
        extra_kwargs = {
            'password': {'write_only': True},  # Password is write-only (not returned in responses)
            'email': {'required': True}  # Ensure email is always required
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)

        # Set password with hashing
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        # Handle password update if password is provided
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
        instance.save()
        return instance


class GlobalSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalSettings
        fields = ['backend_base_url', 'frontend_base_url', 'payment_page_url', 'site_name', 'cbt_api_token', 'contact_email']