import datetime
import random
import string
import requests
import hmac
import hashlib
import json
import logging
from decimal import Decimal
from django.utils import timezone
from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import exceptions, status

from .utils import update_subscription_status
from .authentication import JWTAuthentication, create_refresh_token, create_access_token, decode_refresh_token
from .serializers import UserSerializer, GlobalSettingsSerializer
from .models import User, UserToken, Reset, GlobalSettings, PaymentTransaction
from backend.settings import PAYSTACK_SECRET_KEY
from django.core.mail import send_mail

class RegisterAPIView(APIView):
    def post(self, request):
        data = request.data
        if data['password'] != data['password_confirm']:
            raise exceptions.APIException('Passwords do not match')  
        serializer = UserSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


class LoginAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Check if email exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found. Please review login credentials')

        # Check if password is correct
        if not user.check_password(password):
            raise exceptions.AuthenticationFailed('Incorrect password. Please review login credentials')
        
        # Update subscription status
        update_subscription_status(user)
        
        # Create tokens
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        # Store refresh token
        UserToken.objects.create(
            user_id=user.id,
            token=refresh_token,
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=7)
        )

        response = Response()
        response.set_cookie(key='refresh_token', value=refresh_token, httponly=True)
        response.data = {
            'token': access_token
        }
        return response


class UserAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        # Update subscription status before returning user data
        update_subscription_status(request.user)
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        data = request.data

        # Update subscription status
        update_subscription_status(user)

        # Handle trial-related updates
        if 'trial_calls' in data:
            try:
                trial_calls = int(data['trial_calls'])
                if trial_calls < 0:
                    return Response(
                        {'error': 'trial_calls must be a non-negative integer'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.trial_calls = trial_calls
            except ValueError:
                return Response(
                    {'error': 'Invalid value for trial_calls'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if 'trial_complete' in data:
            try:
                trial_complete = bool(data['trial_complete'])
                user.trial_complete = trial_complete
            except ValueError:
                return Response(
                    {'error': 'Invalid value for trial_complete'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if 'trial_calls' in data or 'trial_complete' in data:
            user.save()

        return Response(UserSerializer(user).data)


class RefreshAPIView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({
                "error": "Refresh token not found"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode the refresh token
            id = decode_refresh_token(refresh_token)

            # Check if the token exists in the database
            if not UserToken.objects.filter(
                user_id=id,  
                token=refresh_token,
                expires_at__gt=datetime.datetime.now(tz=datetime.timezone.utc)
            ).exists():
                raise exceptions.AuthenticationFailed('Invalid or expired refresh token')

            # Create new access token
            access_token = create_access_token(id)

            return Response({
                "token": access_token
            }, status=status.HTTP_200_OK)

        except exceptions.AuthenticationFailed as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({
                "error": "An error occurred while refreshing the token"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class LogoutAPIView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        UserToken.objects.filter(token=refresh_token).delete()

        response = Response()
        response.delete_cookie(key='refresh_token')
        response.data = {
            "message": "Logged out successfully"
        }
        return response


class ForgotAPIView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            token = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(10))

            # Get global settings
            global_settings = GlobalSettings.objects.first()
            if not global_settings:
                return Response(
                    {"error": "System configuration not found"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            Reset.objects.create(
                email=email,
                token=token
            )

            # Construct reset URL using frontend base URL from global settings
            reset_url = f"{global_settings.frontend_base_url.rstrip('/')}/reset/{token}"

            send_mail(
                subject='Reset your password',
                message='',
                html_message=f'Click <a href="{reset_url}">here</a> to reset your password',
                from_email=global_settings.contact_email,  
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({
                "message": "Reset password email sent successfully. Please check your inbox."
            })
        except Exception as e:
            logger.exception("Error in password reset email sending")
            return Response(
                {"error": "Failed to send reset email"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResetAPIView(APIView):
    def post(self, request):
        data = request.data

        if data['password'] != data['password_confirm']:
            raise exceptions.APIException('Passwords do not match')
        
        reset_password = Reset.objects.filter(token=data['token']).first()

        if not reset_password:
            raise exceptions.APIException('Invalid link!')
        
        user = User.objects.filter(email=reset_password.email).first()

        if not user:
            raise exceptions.APIException('User not found')
        
        user.set_password(data['password'])
        user.save()

        return Response({
            "message": "Password reset successfully"
        })


class GlobalSettingsView(APIView):
    """
    Returns the global settings for the frontend to use.
    """
    def get(self, request):
        try:
            global_settings = GlobalSettings.objects.first()
            if global_settings:
                serializer = GlobalSettingsSerializer(global_settings)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response({"error": "Global settings not configured"}, status=status.HTTP_404_NOT_FOUND)
        except GlobalSettings.DoesNotExist:
            return Response({"error": "Global settings not found"}, status=status.HTTP_404_NOT_FOUND)


logger = logging.getLogger(__name__)

class PaymentInitializationView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        
        if user.is_subscribed:
            return Response(
                {"error": "User is already subscribed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            global_settings = GlobalSettings.objects.first()
            if not global_settings:
                return Response(
                    {"error": "Subscription price not configured"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            amount = int(global_settings.subscription_price * 100)  # Convert to kobo
            reference = f"sub_{user.id}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"

            # Create payment transaction record
            transaction = PaymentTransaction.objects.create(
                user=user,
                reference=reference,
                amount=global_settings.subscription_price
            )

            # Build URLs for callbacks and webhooks
            callback_url = f"{global_settings.backend_base_url.rstrip('/')}/api/payments/callback/"
            webhook_url = f"{global_settings.backend_base_url.rstrip('/')}/api/payments/webhook/"

            # Initialize payment with Paystack
            url = "https://api.paystack.co/transaction/initialize"
            headers = {
                "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "email": user.email,
                "amount": amount,
                "reference": reference,
                "callback_url": callback_url,
                "webhook_url": webhook_url,
                "metadata": {
                    "user_id": user.id,
                    "transaction_id": transaction.id,
                    "custom_fields": [
                        {
                            "display_name": "User Email",
                            "variable_name": "user_email",
                            "value": user.email
                        }
                    ]
                },
                "channels": ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"]
            }

            response = requests.post(url, headers=headers, json=payload)
            response_data = response.json()
            
            if response.status_code == 200 and response_data["status"]:
                transaction.payment_url = response_data["data"]["authorization_url"]
                transaction.metadata.update({
                    'access_code': response_data["data"]["access_code"],
                    'initialization_response': response_data
                })
                transaction.save()
                
                return Response({
                    "authorization_url": response_data["data"]["authorization_url"],
                    "reference": reference,
                    "access_code": response_data["data"]["access_code"]
                })
            
            logger.error(f"Payment initialization failed for user {user.id}: {response_data}")
            transaction.status = "failed"
            transaction.metadata.update({'initialization_error': response_data})
            transaction.save()
            
            return Response(
                {"error": "Failed to initialize payment"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except Exception as e:
            logger.exception(f"Error in payment initialization for user {user.id}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentCallbackView(APIView):
    authentication_classes = []

    def get(self, request):
        reference = request.GET.get('reference')
        if not reference:
            logger.warning("Received callback without reference")
            return redirect(f"{GlobalSettings.objects.first().frontend_base_url}/payment-redirect?status=failed")

        try:
            transaction = PaymentTransaction.objects.select_related('user').get(reference=reference)
            
            if transaction.status != 'success':
                verification_status = self.verify_payment(reference)

                if verification_status:
                    # Update subscription status with new payment
                    update_subscription_status(transaction.user, transaction)
                    
                    transaction.status = 'success'
                    transaction.metadata.update({
                        'verification_method': 'callback',
                        'verified_at': timezone.now().isoformat()
                    })
                    transaction.save()
                    
                    logger.info(f"Successfully verified payment via callback for user {transaction.user.id}")

            status_param = 'success' if transaction.status == 'success' else 'failed'
            return redirect(
                f"{GlobalSettings.objects.first().frontend_base_url}/payment-redirect?status={status_param}&reference={reference}"
            )

        except PaymentTransaction.DoesNotExist:
            logger.error(f"Transaction not found for reference: {reference}")
            return redirect(f"{GlobalSettings.objects.first().frontend_base_url}/payment-redirect?status=failed")
        except Exception as e:
            logger.exception("Error processing callback")
            return redirect(f"{GlobalSettings.objects.first().frontend_base_url}/payment-redirect?status=failed")


# Modified PaymentWebhookView
class PaymentWebhookView(APIView):
    authentication_classes = []

    def post(self, request):
        try:
            # Verify webhook signature
            paystack_signature = request.META.get('HTTP_X_PAYSTACK_SIGNATURE')
            if not paystack_signature:
                logger.warning("Received webhook without Paystack signature")
                return Response(status=status.HTTP_400_BAD_REQUEST)

            computed_signature = hmac.new(
                settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
                request.body,
                hashlib.sha512
            ).hexdigest()

            if paystack_signature != computed_signature:
                logger.warning("Invalid webhook signature received")
                return Response(status=status.HTTP_400_BAD_REQUEST)

            payload = json.loads(request.body)
            event = payload.get('event')
            data = payload.get('data', {})
            reference = data.get('reference')

            if event == 'charge.success':
                transaction = PaymentTransaction.objects.select_related('user').get(reference=reference)
                
                # Update subscription status with new payment
                update_subscription_status(transaction.user, transaction)
                
                transaction.status = 'success'
                transaction.metadata.update({
                    'paystack_response': data,
                    'verification_method': 'webhook',
                    'verified_at': timezone.now().isoformat()
                })
                transaction.save()
                
                logger.info(f"Successfully updated subscription status for user {transaction.user.id}")

            return Response(status=status.HTTP_200_OK)

        except PaymentTransaction.DoesNotExist:
            logger.error(f"Transaction not found for reference: {reference}")
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("Error processing webhook")
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)