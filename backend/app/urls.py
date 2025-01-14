from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from django.contrib.auth import views as auth_views

router = DefaultRouter()
router.register(r'portfolios', PortfolioViewSet, basename='portfolio') 
router.register(r'stocks', StockViewSet, basename='stock') 
router.register(r'holdings', HoldingViewSet, basename='holding') 
router.register(r'players', PlayerViewSet, basename='player')
router.register(r'contests', ContestViewSet, basename='contest')


urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('password_reset/', 
         PasswordResetRequestAPIView.as_view(),
         name='password_reset'),
    path('password_reset_confirm/<uidb64>/<token>/',
         PasswordResetConfirmAPIView.as_view(),
         name='password_reset_confirm'),
]