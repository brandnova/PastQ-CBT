# import os
import datetime
import random
import string
import requests
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import exceptions, status
from .authentication import JWTAuthentication, create_refresh_token, create_access_token, decode_refresh_token
from .serializers import UserSerializer, GlobalSettingsSerializer
from .models import User, UserToken, Reset, GlobalSettings
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
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        data = request.data

        # Check if 'trial_calls' is in the request data
        if 'trial_calls' in data:
            try:
                trial_calls = int(data['trial_calls'])
                if trial_calls < 0:
                    return Response({'error': 'trial_calls must be a non-negative integer'}, status=status.HTTP_400_BAD_REQUEST)
                user.trial_calls = trial_calls
            except ValueError:
                return Response({'error': 'Invalid value for trial_calls'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if 'trial_complete' is in the request data
        if 'trial_complete' in data:
            try:
                trial_complete = bool(data['trial_complete'])
                user.trial_complete = trial_complete
            except ValueError:
                return Response({'error': 'Invalid value for trial_complete'}, status=status.HTTP_400_BAD_REQUEST)

        # Save the user object if any changes were made
        if 'trial_calls' in data or 'trial_complete' in data:
            user.save()

        # Return the updated user data
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
        UserToken.objects.filter(token = refresh_token).delete()

        response = Response()
        response.delete_cookie(key='refresh_token')
        response.data = {
            "message": "Logged out successfully"
    
        }
        return response


class ForgotAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        token = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(10))

        Reset.objects.create(
            email=email,
            token=token
        )

        url = f'http://localhost:5173/PastQ-CBT/#/reset/{token}'

        send_mail(
            subject='Reset your password',
            message='',
            html_message=f'Click <a href="{url}">here</a> to reset your password',
            from_email='from@eg.com',
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({
            "message": "Reset password email sent successfully. Please check your inbox."
        })
    

class ResetAPIView(APIView):
    def post(self, request):
        data = request.data

        if data['password'] != data['password_confirm']:
            raise exceptions.APIException('Paswords do not match')
        
        reset_password = Reset.objects.filter(token = data['token']).first()

        if not reset_password:
            raise exceptions.APIException('Invalid link!')
        
        user = User.objects.filter(email = reset_password.email).first()

        if not user:
            raise exceptions.APIException('User not found')
        
        user.set_password(data['password'])
        user.save()

        return Response({
            "message": "Password reset successfully"
        })
    

class PaystackRedirectView(APIView):
    """
    Handles the Paystack redirect after payment and verifies the transaction.
    Updates user's subscription status and payment reference if the payment is successful.
    """
    def get(self, request):
        # Check if the referrer is Paystack
        referer = request.META.get('HTTP_REFERER', '')
        if not referer.startswith('https://paystack.com'):
            return Response({'error': 'Unauthorized access'}, status=status.HTTP_403_FORBIDDEN)

        # Ensure user is authenticated
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        # Get the payment reference from the query string
        payment_reference = request.GET.get('reference', None)
        if not payment_reference:
            return Response({'error': 'No payment reference provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify payment using Paystack API
        verification_status = self.verify_payment(payment_reference)

        if verification_status:
            # Payment was successful, update user's subscription status and payment reference
            user.is_subscribed = True
            user.payment_reference = payment_reference
            user.save()

            # Redirect to your frontend homepage or success page
            return redirect(f'https://brandnova.github.io/PastQ-CBT/#/payment-redirect?status=success&reference={payment_reference}')
        else:
            # Payment failed or could not be verified
            return redirect(f'https://brandnova.github.io/PastQ-CBT/#/payment-redirect?status=failed&reference={payment_reference}')

    def verify_payment(self, reference):
        """Verify payment using Paystack API"""
        url = f"https://api.paystack.co/transaction/verify/{reference}"
        PAYSTACK_TEST_SECRET_KEY = PAYSTACK_SECRET_KEY
        headers = {
            "Authorization": f"Bearer {PAYSTACK_TEST_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            response_data = response.json()
            return response_data['status'] and response_data['data']['status'] == 'success'
        return False
        
        

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