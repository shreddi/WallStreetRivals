# from alpaca_trade_api.rest import REST
from django.core.management.base import BaseCommand
from app.models import Stock
import requests
import os

class Command(BaseCommand):
    help = "Fetch the latest stock prices from Alpaca and update the database"

    def handle(self, *args, **kwargs):
        # Load API credentials
        ALPACA_API_KEY = os.environ.get('ALPACA_API_KEY')
        ALPACA_SECRET_KEY = os.environ.get('ALPACA_SECRET_KEY')

        print("ALPACA_API_KEY:", os.environ.get('ALPACA_API_KEY'))
        print("ALPACA_SECRET_KEY:", os.environ.get('ALPACA_SECRET_KEY'))
        
        if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
            self.stderr.write("Missing Alpaca API credentials in environment variables.")
            return

        # Define the stock tickers to fetch
        stock_tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']  # Example stocks

        url = "https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=AAPL%2CTSLA&feed=iex"

        headers = {
            "accept": "application/json",
            "APCA-API-KEY-ID": ALPACA_API_KEY,
            "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY
        }

        response = requests.get(url, headers=headers)

        print(response.text)


# ap (Ask Price): 349.98
# The lowest price a seller is willing to accept for one share of Tesla stock.
# as (Ask Size): 1
# The number of shares available at the ask price (1 share in this case).
# ax (Ask Exchange): "V"
# The exchange where this ask price is quoted. "V" typically refers to a specific exchange code (e.g., Cboe EDGA).
# bp (Bid Price): 337
# The highest price a buyer is willing to pay for one share of Tesla stock.
# bs (Bid Size): 1
# The number of shares buyers want to purchase at the bid price (1 share in this case).
# bx (Bid Exchange): "V"
# The exchange where this bid price is quoted.
# c (Conditions): ["R"]
# Market conditions for this quote. "R" might stand for a specific reporting condition (refer to Alpaca's documentation for more on condition codes).
# t (Timestamp): "2024-11-25T20:59:56.064273459Z"
# The UTC timestamp of the quote (20:59:56 on November 25, 2024).
# z (Tape): "C"
# The tape of the market center. "C" often represents the consolidated tape.