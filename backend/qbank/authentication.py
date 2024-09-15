from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication
from rest_framework.authentication import get_authorization_header
from .models import User
import jwt, datetime

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = get_authorization_header(request).split()

        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')
            id = decode_access_token(token)

            user = User.objects.get(pk=id)

            return (user, None) 

        raise exceptions.AuthenticationFailed('Unauthenticated')

def create_access_token(id):
    return jwt.encode({
        "user_id": id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=15),  # Increased to 15 minutes
        "iat": datetime.datetime.utcnow()
    }, "access_secret", algorithm="HS256")

def decode_access_token(token):
    try:
        payload = jwt.decode(token, "access_secret", algorithms=["HS256"])

        return payload['user_id']
    
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed('Token has expired')
    except jwt.InvalidTokenError:
        raise exceptions.AuthenticationFailed('Invalid token')

def create_refresh_token(id):
    return jwt.encode({
        "user_id": id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
        "iat": datetime.datetime.utcnow()
    }, "refresh_secret", algorithm="HS256")

def decode_refresh_token(token):
    try:
        payload = jwt.decode(token, "refresh_secret", algorithms=["HS256"])
        
        return payload['user_id']
    
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed('Refresh token has expired')
    except jwt.InvalidTokenError:
        raise exceptions.AuthenticationFailed('Invalid refresh token')