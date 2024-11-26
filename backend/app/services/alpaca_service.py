import requests
import os
from app.models import Stock

def fetch_and_update_stock_prices():
    """Fetch the latest stock prices from Alpaca API and update the database."""
    # Load API credentials
    ALPACA_API_KEY = os.getenv('ALPACA_API_KEY')
    ALPACA_SECRET_KEY = os.getenv('ALPACA_SECRET_KEY')

    if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        raise ValueError("Missing Alpaca API credentials in environment variables.")

    # List of stock tickers
    tickers = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 
        'NVDA', 'ORCL', 'IBM', 'AMD', 'INTC', 'CRM', 'ADOBE', 'SHOP', 'PYPL', 'SQ',
        'JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'BMY', 'AMGN', 'GILD', 'BIIB', 'REGN',
        'JPM', 'BAC', 'C', 'WFC', 'GS', 'MS', 'V', 'MA', 'AXP', 'COIN',
        'WMT', 'HD', 'COST', 'NKE', 'TGT', 'PG', 'KO', 'PEP', 'SBUX', 'MCD',
        'XOM', 'CVX', 'BP', 'SHEL', 'SLB', 'OXY', 'ENB', 'EOG', 'MPC', 'CTRA'
    ]

    # URL and headers for query from Alpaca API
    tickers_query = ",".join(tickers)
    url = f"https://data.alpaca.markets/v2/stocks/trades/latest?symbols={tickers_query}&feed=iex"
    headers = {
        "accept": "application/json",
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
    }

    # Fetch latest trades
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise ValueError(f"Failed to fetch data from Alpaca API: {response.text}")

    data = response.json()

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
