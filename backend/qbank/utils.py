from .models import GlobalSettings

def get_global_settings():
    """
    Utility function to get global settings in the backend
    """
    return GlobalSettings.objects.first()