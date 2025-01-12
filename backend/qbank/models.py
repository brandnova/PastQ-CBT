from django.utils import timezone
from django.contrib.auth.models import BaseUserManager, AbstractUser
from django.db import models
from django.core.validators import MinValueValidator

# Define your custom UserManager here
class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name, last_name=last_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, first_name, last_name, password, **extra_fields)



class User(AbstractUser):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    username = None  
    is_subscribed = models.BooleanField(default=False)
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, null=True, blank=True) 
    trial_calls = models.PositiveSmallIntegerField(default=10)
    trial_complete = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()  

    
    def is_subscription_active(self):
        """Check if user has an active subscription"""
        if self.subscription_expires_at:
            return self.subscription_expires_at > timezone.now()
        return False

    def save(self, *args, **kwargs):
        self.is_subscribed = self.is_subscription_active()
        self.username = self.email
        super(User, self).save(*args, **kwargs)

    def _str_(self):
        return self.first_name + ' ' + self.last_name
    

class UserToken(models.Model):
    user_id = models.IntegerField() 
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f'{self.user_id} {self.token} Created at {self.created_at.strftime("%Y-%m-%d %H:%M:%S")}'
    

class Reset(models.Model):
    email = models.CharField(max_length=255)
    token = models.CharField(max_length=255, unique=True)


class GlobalSettings(models.Model):
    backend_base_url = models.URLField(max_length=255, verbose_name="Backend Base URL")
    frontend_base_url = models.URLField(max_length=255, verbose_name="Frontend Base URL")
    subscription_price = models.DecimalField(  # Changed from payment_page_url
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Subscription Price",
        help_text="Price in NGN",
        null = True
    )
    site_name = models.CharField(max_length=255, verbose_name="Site Name", default="My Website")
    cbt_api_token = models.CharField(max_length=255, verbose_name="CBT API Token", null=True, blank=True)
    contact_email = models.EmailField(verbose_name="Contact Email", default="support@example.com")

    def save(self, *args, **kwargs):
        if not self.pk and GlobalSettings.objects.exists():
            raise ValueError("Only one instance of GlobalSettings is allowed.")
        return super(GlobalSettings, self).save(*args, **kwargs)

    def __str__(self):
        return "Global Settings"

    class Meta:
        verbose_name = "Global Setting"
        verbose_name_plural = "Global Settings"


class PaymentTransaction(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed')
    )

    user = models.ForeignKey('User', on_delete=models.CASCADE)
    reference = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.reference} - {self.status}"
