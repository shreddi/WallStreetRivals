from rest_framework.response import Response
from rest_framework import viewsets, status
from ..models import *
from ..serializers.account_serializers import AccountSerializer, RegisterSerializer
import os
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from django.db import transaction
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.contrib.auth.password_validation import validate_password

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = AccountSerializer
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        # Override the default update to ensure the logged-in user can only update their own profile
        instance = self.request.user  # Ensure the user can only update their own profile
        data = request.data
        file = request.FILES.get('profile_picture') 

        # Delete old profile picture if a new one is uploaded
        serializer = self.get_serializer(instance, data=data, partial=True)
        if serializer.is_valid():
            if file:
                if instance.profile_picture:
                    try:
                        if instance.profile_picture and instance.profile_picture.path:
                            if os.path.isfile(instance.profile_picture.path):
                                os.remove(instance.profile_picture.path)
                    except ValueError:
                        # Handle case where no file is associated
                        pass
                instance.profile_picture = file  # Save the file to the model field
            serializer.save()  # Save the other fields
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken.for_user(user)
        serialized_user = AccountSerializer(user, context={'request': request}).data

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': serialized_user
        })
    
class PasswordResetRequestAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find users with the provided email
        users = Player.objects.filter(email=email)
        if not users.exists():
            return Response({'error': 'Invalid email address'}, status=status.HTTP_400_BAD_REQUEST)
        
        for user in users:
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reset_password_confirm/{uidb64}/{token}"

            # Prepare the email context
            context = {
                'email': user.email,
                'site_name': "Wall Street Rivals",
                'reset_url': reset_url,
            }

            # Render the email body
            subject = "Password Reset Requested"
            email_template_name = 'users/password_reset_email.txt'
            email_body = render_to_string(email_template_name, context)

            # Debugging: Print the email body to ensure correctness
            print(email_body)

            # Send email
            send_mail(
                subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        
        return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)


    
class PasswordResetConfirmAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({'error': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate the password against Django's validators
        try:
            validate_password(new_password)
        except DjangoValidationError as e:
            return Response({"error": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = Player.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid token or user ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successful, rerouting to login...'}, status=status.HTTP_200_OK)
