from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, status
from .models import *
from .serializers import *
import requests
import os
from app.services.alpaca_service import update_stock_prices_by_ticker
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.views import APIView


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    
    def update(self, request, *args, **kwargs):
        # Override the default update to ensure the logged-in user can only update their own profile
        instance = self.request.user  # Ensure the user can only update their own profile
        data = request.data
        file = request.FILES.get('profile_picture') 

        # Delete old profile picture if a new one is uploaded
        if file and instance.profile_picture:
            # Check if the file actually exists
            try:
                if instance.profile_picture and instance.profile_picture.path:
                    if os.path.isfile(instance.profile_picture.path):
                        os.remove(instance.profile_picture.path)
            except ValueError:
                # Handle case where no file is associated
                pass

        serializer = self.get_serializer(instance, data=data, partial=True)
        if serializer.is_valid():
            if file:
                instance.profile_picture = file  # Save the file to the model field
            serializer.save()  # Save the other fields
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer

    def retrieve(self, request, pk=None):
        # Use helper function to update stock trade prices from this portfolio.
        portfolio = self.get_object()
        self.update_portfolio_stock_prices(portfolio)

        # Serialize and return data with updated query
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(portfolio)
        return Response(serializer.data)

    # When a portfolio is retrieved, update the stock trade prices from this portfolio in the database and then get these. This should probably be changed, since GET requests shouldn't have side-effects.
    def update_portfolio_stock_prices(self, portfolio):
        # Get the tickers for the stocks in this portfolio
        tickers = (
            Stock.objects.filter(holdings__portfolio=portfolio)
            .distinct()
            .values_list("ticker", flat=True)
        )

        # Find the updated trade price for these tickers and update the database
        update_stock_prices_by_ticker(self, tickers)


class HoldingViewSet(viewsets.ModelViewSet):
    queryset = Holding.objects.all()
    serializer_class = HoldingSerializer

    def destroy(self, request, *args, **kwargs):
        holding = self.get_object()  # Get the holding to be deleted
        portfolio = holding.portfolio  # Get the associated portfolio

        # Calculate the total value of the holding
        if holding.stock and holding.stock.trade_price:
            total_value = holding.shares * holding.stock.trade_price
        else:
            total_value = 0

        # Add the value back to the portfolio's cash
        portfolio.cash += total_value
        portfolio.save()

        # Proceed with the deletion
        response = super().destroy(request, *args, **kwargs)

        return Response(
            {
                "message": f"Holding deleted. ${total_value} added back to portfolio cash.",
                "portfolio_cash": portfolio.cash,
            },
            status=status.HTTP_200_OK,
        )


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            return Response({"user": serializer.data}, status=201)
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
        serialized_user = PlayerSerializer(user, context={'request': request}).data

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': serialized_user
        })