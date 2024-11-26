from django.core.management.base import BaseCommand
from app.services.alpaca_service import fetch_and_update_stock_prices

class Command(BaseCommand):
    help = "Fetch the latest stock prices from Alpaca and update the database"

    def handle(self, *args, **kwargs):
        try:
            fetch_and_update_stock_prices()
            self.stdout.write("Successfully updated stock prices.")
        except Exception as e:
            self.stderr.write(f"Error: {e}")
