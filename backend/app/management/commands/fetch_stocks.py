# from alpaca_trade_api.rest import REST
from django.core.management.base import BaseCommand
from app.models import Stock
import requests
import os

class Command(BaseCommand):
    help = "Fetch the latest NYSE stock names, tickers, and trade prices from Alpaca and update the database"

    def handle(self, *args, **kwargs):
        #Retrieve Keys
        ALPACA_API_KEY = os.getenv('ALPACA_API_KEY')
        ALPACA_SECRET_KEY = os.getenv('ALPACA_SECRET_KEY')
        if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
            raise ValueError("Missing Alpaca API credentials in environment variables.")


        #Request asset information (Stock ticker, company name, etc) from Alpaca API.
        assets_url = "https://paper-api.alpaca.markets/v2/assets"
        assets_params = {
            "asset_class": "us_equity",
            "exchange": "NYSE",
            "status": "active"
        }
        assets_headers = {
            "APCA-API-KEY-ID": ALPACA_API_KEY,
            "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY
        }
        try:
            assets_response = requests.get(assets_url, headers=assets_headers, params=assets_params)
            assets_data = assets_response.json()
        except Exception as e:
            self.stderr.write(f"Failed to fetch assets: {e}")
            return
        
        
        #Extract tickers and company names from asset data
        #https://docs.alpaca.markets/reference/get-v2-assets-1#asset-entity
        stocks_data = {asset['symbol']: asset['name'] for asset in assets_data if asset.get('symbol') and asset.get('name')} #hash table to lookup stock name by ticker
        tickers = list(stocks_data.keys())
        if not tickers:
            self.stderr.write("No tickers found from assets endpoint")
            return
        
        #Fetch trade prices from Alpaca Latest Trades api using tickers.
        #https://docs.alpaca.markets/reference/stocklatesttrades-1
        prices_url = "https://data.alpaca.markets/v2/stocks/trades/latest?"
        prices_params = {"symbols": ",".join(tickers)}  
        prices_headers = {
            "APCA-API-KEY-ID": ALPACA_API_KEY,
            "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY
        }
        try:
            prices_response = requests.get(prices_url, headers=prices_headers, params=prices_params) 
            print(prices_response.text)
            prices_data = prices_response.json().get('trades', {}) #hash table to look up trade price by ticker
        except Exception as e:
            self.stderr.write(f"Failed to fetch trade prices: {e}")
            return
        
        print(prices_data)



        # Update the database with stock names, Tickers, and trade prices
        for ticker, name in stocks_data.items():
            trade_price = prices_data.get(ticker, {}).get("p", None)  # "p" is the price field
            if trade_price is not None:
                try:
                    stock, created = Stock.objects.update_or_create(
                        ticker=ticker,
                        defaults={
                            "name": name,
                            "trade_price": trade_price
                        }
                    )
                    action = "Created" if created else "Updated"
                    self.stdout.write(f"{action} stock: {ticker} - {name} (${trade_price})")
                except Exception as e:
                    self.stderr.write(f"Error saving stock {ticker}: {e}")
            else:
                # self.stderr.write(f"No trade price found for ticker: {ticker}")
                pass



