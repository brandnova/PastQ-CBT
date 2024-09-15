from django.contrib import admin
from .models import User, UserToken, Reset, GlobalSettings

# Register your models here.

admin.site.register(User)
admin.site.register(UserToken)
admin.site.register(Reset)


class GlobalSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'frontend_base_url', 'backend_base_url', 'contact_email')
    search_fields = ('backend_base_url', 'frontend_base_url','site_name', 'contact_email')


    def has_add_permission(self, request):
        # Disable the add button if there's already an instance of GlobalSettings
        # This will prevent creating a new GlobalSettings instance.
        if GlobalSettings.objects.exists():
            return False
        return True

    def has_delete_permission(self, request, obj=None):
        # Optional: Disable the delete button to prevent deleting the instance
        return False

    def has_change_permission(self, request, obj=None):
        # Allow changing the existing instance
        return True

# Register the GlobalSettings model with the customized admin class
admin.site.register(GlobalSettings, GlobalSettingsAdmin)