from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'portfolios', PortfolioViewSet, basename='portfolio') 
router.register(r'stocks', StockViewSet, basename='stock') 
router.register(r'holdings', HoldingViewSet, basename='holding') 


urlpatterns = [
    path('', include(router.urls)), 
]
