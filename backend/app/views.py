from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from .models import *
from .serializers import *
import requests
import os
from app.services.alpaca_service import fetch_and_update_stock_prices

class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer

    def retrieve(self, request, pk=None):
        portfolio = self.get_object()
        self.update_portfolio_stock_prices(portfolio)
        serializer = self.get_serializer(portfolio)
        return Response(serializer.data)
    
    # When a portfolio is retrieved, update the stock trade prices from this portfolio in the database and then get these. This should probably be changed
    def update_portfolio_stock_prices(self, portfolio):
        # Get the stocks in this portfolio
        stocks = Stock.objects.filter(holdings__portfolio=portfolio).distinct()

        # Build the Alpaca API request
        tickers = ",".join(stock.ticker for stock in stocks)
        url = f"https://data.alpaca.markets/v2/stocks/trades/latest?symbols={tickers}&feed=iex"
        headers = {
            "APCA-API-KEY-ID": os.getenv("ALPACA_API_KEY"),
            "APCA-API-SECRET-KEY": os.getenv("ALPACA_SECRET_KEY"),
        }  

        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json().get("trades", {})
            for ticker, trade_data in data.items():
                stock = stocks.filter(ticker=ticker).first()
                if stock:
                    stock.trade_price = trade_data["p"]  # Update the trade price
                    stock.save()


class HoldingViewSet(viewsets.ModelViewSet):
    queryset = Holding.objects.all()
    serializer_class = HoldingSerializer

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

    def list(self, request, *args, **kwargs):
        # Fetch updated stock prices from Alpaca API
        try:
            fetch_and_update_stock_prices()
        except Exception as e:
            return Response({"error": f"Failed to update stock prices: {e}"}, status=500)

        # Retrieve the updated queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        # Serialize and return the data
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    

