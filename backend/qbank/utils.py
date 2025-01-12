from django.utils import timezone
from dateutil.relativedelta import relativedelta
from .models import GlobalSettings, PaymentTransaction

def get_global_settings():
    """
    Utility function to get global settings in the backend
    """
    return GlobalSettings.objects.first()

def update_subscription_status(user, payment_transaction=None):
    """
    Update user's subscription status based on subscription expiry date.
    If payment_transaction is provided, updates the expiry date accordingly.
    
    Args:
        user: User object
        payment_transaction: Optional PaymentTransaction object for new payments
        
    Returns:
        bool: Current subscription status
    """
    current_time = timezone.now()
    
    if payment_transaction and payment_transaction.status == 'success':
        # Handle new payment
        if user.subscription_expires_at and user.subscription_expires_at > current_time:
            # Extend existing active subscription
            user.subscription_expires_at = user.subscription_expires_at + relativedelta(months=1)
        else:
            # Start new subscription period
            user.subscription_expires_at = current_time + relativedelta(months=1)
    
    # Check and update subscription status
    was_subscribed = user.is_subscribed
    user.is_subscribed = user.is_subscription_active()
    
    # Only save if there's been a change to avoid unnecessary database writes
    if was_subscribed != user.is_subscribed:
        user.save()
    
    return user.is_subscribed