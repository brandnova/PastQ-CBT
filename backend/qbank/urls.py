from django.urls import path
from .views import RegisterAPIView, LoginAPIView, UserAPIView, RefreshAPIView, LogoutAPIView, ForgotAPIView, ResetAPIView, GlobalSettingsView, PaymentInitializationView, PaymentWebhookView, PaymentCallbackView

urlpatterns = [
    path('register', RegisterAPIView.as_view()),
    path('login', LoginAPIView.as_view()),
    path('user', UserAPIView.as_view()),
    path('refresh', RefreshAPIView.as_view()),
    path('logout', LogoutAPIView.as_view()),
    path('forgot', ForgotAPIView.as_view()),
    path('reset', ResetAPIView.as_view()),
    path('globalsettings', GlobalSettingsView.as_view(),),
    path('payments/initialize/', PaymentInitializationView.as_view(), name='payment-initialize'),
    path('payments/webhook/', PaymentWebhookView.as_view(), name='payment-webhook'),
    path('payments/callback/', PaymentCallbackView.as_view(), name='payment-callback'),
]
