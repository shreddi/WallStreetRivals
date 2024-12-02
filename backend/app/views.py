from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, status
from .models import *
from .serializers import *
import requests
import os
from app.services.alpaca_service import fetch_and_update_stock_prices


class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer

    def retrieve(self, request, pk=None):
        #Use helper function to update stock trade prices from this portfolio.
        portfolio = self.get_object()
        self.update_portfolio_stock_prices(portfolio)

        #Serialize and return data with updated query
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(portfolio)
        return Response(serializer.data)
    
    # When a portfolio is retrieved, update the stock trade prices from this portfolio in the database and then get these. This should probably be changed, since GET requests shouldn't have side-effects.
    def update_portfolio_stock_prices(self, portfolio):
        #Get the tickers for the stocks in this portfolio
        tickers = Stock.objects.filter(holdings__portfolio=portfolio).distinct().values_list('ticker', flat=True)
        
        #Find the updated trade price for these tickers and update the database
        fetch_and_update_stock_prices(self, tickers)
        

class HoldingViewSet(viewsets.ModelViewSet):
    queryset = Holding.objects.all()
    serializer_class = HoldingSerializer

    def destroy(self, request, *args, **kwargs):
        holding = self.get_object()  #Get the holding to be deleted
        portfolio = holding.portfolio  #Get the associated portfolio

        #Calculate the total value of the holding
        if holding.stock and holding.stock.trade_price:
            total_value = holding.shares * holding.stock.trade_price
        else:
            total_value = 0

        #Add the value back to the portfolio's cash
        portfolio.cash += total_value
        portfolio.save()

        #Proceed with the deletion
        response = super().destroy(request, *args, **kwargs)

        return Response({
            "message": f"Holding deleted. ${total_value} added back to portfolio cash.",
            "portfolio_cash": portfolio.cash
        }, status=status.HTTP_200_OK)


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

    def list(self, request, *args, **kwargs):
        #Fetch updated stock prices from Alpaca API
        try:
            #Get tickers of all stocks in the database
            tickers = list(Stock.objects.values_list('ticker', flat=True))
            #Find the most recent trade price for each ticker and update it in database
            fetch_and_update_stock_prices(self, tickers)
        except Exception as e:
            return Response({"error": f"Failed to update stock prices: {e}"}, status=500)

        #Retrieve the updated queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        #Serialize and return the data
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)