# from alpaca_trade_api.rest import REST
from django.core.management.base import BaseCommand
from app.models import Stock
import requests
import os

class Command(BaseCommand):
    help = "Fetch the latest stock prices from Alpaca and update the database"

    def handle(self, *args, **kwargs):
        #Load API credentials
        ALPACA_API_KEY = os.getenv('ALPACA_API_KEY')
        ALPACA_SECRET_KEY = os.getenv('ALPACA_SECRET_KEY')

        if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
            self.stderr.write("Missing Alpaca API credentials in environment variables.")
            return

        #List of stock tickers fetched from API
        tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']

        #URL and headers for query from Alpaca API
        tickers_query = ",".join(tickers)  # Combine tickers into a comma-separated string
        url = f"https://data.alpaca.markets/v2/stocks/trades/latest?symbols={tickers_query}&feed=iex"
        headers = {
            "accept": "application/json",
            "APCA-API-KEY-ID": ALPACA_API_KEY,
            "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
        }

        #Fetch latest trades
        response = requests.get(url, headers=headers)
        data = response.json()

        #Iterate through each stock received from API, and create it in the backend or update it. 
        for symbol, trade_data in data.get('trades', {}).items():
            try:
                stock, created = Stock.objects.update_or_create(
                    ticker=symbol,
                    defaults={
                        "trade_price": trade_data["p"],
                    }
                )
                if created:
                    self.stdout.write(f"Created stock {symbol} with trade price {trade_data['p']}")
                else:
                    self.stdout.write(f"Updated stock {symbol} with trade price {trade_data['p']}")
            except Exception as e:
                self.stderr.write(f"Error updating stock {symbol}: {e}")


# p (Price): 349.98
# The price of the most recent trade for Tesla.
# s (Size): 5
# The number of shares traded in the most recent Tesla transaction (5 shares in this case).
# t (Timestamp): "2024-11-25T20:59:56.064273459Z"
# The UTC timestamp of the Tesla trade.
# x (Exchange): "V"
# The exchange where the trade occurred.
# c (Conditions): ["T"]
# Market conditions for this trade. "T" could signify a specific condition (e.g., regular trade).
# z (Tape): "C"
# The tape where the trade was reported.
