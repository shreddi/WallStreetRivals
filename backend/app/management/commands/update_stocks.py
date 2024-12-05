# from alpaca_trade_api.rest import REST
from django.core.management.base import BaseCommand
from app.models import Stock
import requests
import os

class Command(BaseCommand):
    help = "Fetch the latest NYSE stock names, tickers, and trade prices from Alpaca and update the database"

    def handle(self, *args, **kwargs):
        """Fetch the latest stock prices for all stocks in the database and update their prices."""
        # Load API credentials
        print("woohoo")
        ALPACA_API_KEY = os.getenv('ALPACA_API_KEY')
        ALPACA_SECRET_KEY = os.getenv('ALPACA_SECRET_KEY')

        if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
            raise ValueError("Missing Alpaca API credentials in environment variables.")

        # Fetch all tickers from the database
        stocks = Stock.objects.values_list('ticker', flat=True)
        tickers = list(stocks)

        if not tickers:
            print("No stocks found in the database.")
            return

        # Split the tickers into batches (Alpaca API may have limits on symbols per request)
        batch_size = 200  # Adjust based on Alpaca API limits
        ticker_batches = [tickers[i:i + batch_size] for i in range(0, len(tickers), batch_size)]

        url = "https://data.alpaca.markets/v2/stocks/trades/latest"
        headers = {
            "APCA-API-KEY-ID": ALPACA_API_KEY,
            "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY
        }

        # Fetch prices batch by batch
        for batch in ticker_batches:
            params = {"symbols": ",".join(batch)}

            try:
                response = requests.get(url, headers=headers, params=params)
                response.raise_for_status()  # Raise an exception for HTTP errors
                data = response.json()
            except Exception as e:
                print(f"Failed to fetch trade prices for batch {batch}: {e}")
                continue

            # Update the database
            for symbol, trade_data in data.get('trades', {}).items():
                try:
                    Stock.objects.update_or_create(
                        ticker=symbol,
                        defaults={
                            "trade_price": trade_data.get("p", 0),  # Default to 0 if no price is provided
                        }
                    )
                except Exception as e:
                    print(f"Error updating stock {symbol}: {e}")
