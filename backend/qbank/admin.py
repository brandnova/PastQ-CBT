from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserToken, Reset, GlobalSettings, PaymentTransaction

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'is_staff', 
                   'is_subscribed', 'trial_calls', 'trial_complete')
    list_filter = ('is_active', 'is_staff', 'is_subscribed', 'trial_complete')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Subscription', {'fields': ('is_subscribed', 'payment_reference', 
                                   'trial_calls', 'trial_complete')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser',
                                  'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

@admin.register(UserToken)
class UserTokenAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'token', 'created_at', 'expires_at')
    list_filter = ('created_at', 'expires_at')
    search_fields = ('user_id', 'token')
    ordering = ('-created_at',)

@admin.register(Reset)
class ResetAdmin(admin.ModelAdmin):
    list_display = ('email', 'token')
    search_fields = ('email', 'token')

@admin.register(GlobalSettings)
class GlobalSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'backend_base_url', 'frontend_base_url', 
                   'subscription_price', 'contact_email')
    
    def has_add_permission(self, request):
        # Prevent creating multiple instances
        return not GlobalSettings.objects.exists()

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'reference', 'amount', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('user__email', 'reference')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Transaction Information', {
            'fields': ('user', 'reference', 'amount', 'status', 'payment_url')
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )