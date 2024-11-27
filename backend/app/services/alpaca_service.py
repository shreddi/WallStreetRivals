import requests
import os
from app.models import Stock

def fetch_and_update_stock_prices(self, tickers):
    """Fetch the latest stock prices from Alpaca API and update the database, given a list of tickers."""
    # Load API credentials
    ALPACA_API_KEY = os.getenv('ALPACA_API_KEY')
    ALPACA_SECRET_KEY = os.getenv('ALPACA_SECRET_KEY')

    if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        raise ValueError("Missing Alpaca API credentials in environment variables.")

    #Fetch trade prices from Alpaca Latest Trades api using tickers.
    #https://docs.alpaca.markets/reference/stocklatesttrades-1
    url = "https://data.alpaca.markets/v2/stocks/trades/latest?"
    params = {"symbols": ",".join(tickers)}  
    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY
    }
    try:
        response = requests.get(url, headers=headers, params=params)
        data = response.json()
    except Exception as e:
        self.stderr.write(f"Failed to fetch trade prices: {e}")
        return

    # Update the database
    for symbol, trade_data in data.get('trades', {}).items():
        try:
            Stock.objects.update_or_create(
                ticker=symbol,
                defaults={
                    "trade_price": trade_data["p"],
                }
            )
        except Exception as e:
            raise Exception(f"Error updating stock {symbol}: {e}")
