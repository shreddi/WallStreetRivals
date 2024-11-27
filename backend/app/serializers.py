from rest_framework import serializers
from .models import * 
from django.core.exceptions import ValidationError as DjangoValidationError

class WSRUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = WSRUser
        fields = "__all__"

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = "__all__"

class HoldingSerializer(serializers.ModelSerializer):
    stock = serializers.PrimaryKeyRelatedField(queryset=Stock.objects.all(), required=False)
    stock_data = StockSerializer(read_only=True, source='stock')
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = Holding
        fields = "__all__"

    def get_total_value(self, obj):
        # Calculate the total value as shares * trade_price of the stock
        return obj.shares * obj.stock.trade_price if obj.stock and obj.stock.trade_price else 0
    
    def create(self, validated_data):
        # Extract portfolio and stock information
        portfolio = validated_data.get('portfolio')
        stock = validated_data.get('stock')
        shares = validated_data.get('shares', 0)

        if not portfolio or not stock:
            raise serializers.ValidationError("Portfolio and Stock must be provided.")

        # Check if the stock already exists in the portfolio's holdings
        existing_holding = portfolio.holdings.filter(stock=stock).first()

        if existing_holding: #If a holding exists for the requested stock, add to the existing holding's shares and stock price, and deduct from the portfolio's cash
            existing_holding.shares += shares

            #Calculate the total value of the additional shares
            additional_value = shares * stock.trade_price

            #Deduct the cost of the additional shares from the portfolio's cash
            if portfolio.cash < additional_value:
                raise serializers.ValidationError("Insufficient cash in the portfolio to buy additional shares.")
            portfolio.cash -= additional_value
            portfolio.save()

            #Save the updated holding
            existing_holding.save()
            return existing_holding
        else: #Create a new holding if no existing holding is found
            holding = super().create(validated_data)

            # Deduct the cost of the new holding from the portfolio's cash
            total_value = self.get_total_value(holding)
            if portfolio.cash < total_value:
                raise serializers.ValidationError("Insufficient cash in the portfolio to buy this holding.")
            portfolio.cash -= total_value
            portfolio.save()

            return holding


class PortfolioSerializer(serializers.ModelSerializer):
    holdings = HoldingSerializer(many=True, read_only=True)
    holdings_total = serializers.SerializerMethodField()

    class Meta:
        model = Portfolio
        fields = "__all__"

    def get_holdings_total(self, obj):
        # Sum up the total_value for all holdings
        return sum(
            holding.shares * holding.stock.trade_price
            for holding in obj.holdings.all()
            if holding.stock and holding.stock.trade_price
        )

    # def create(self, validated_data):
    #     holdings_data = validated_data.pop('holdings')
    #     portfolio = Portfolio.objects.create(**validated_data)
    #     for holding_data in holdings_data:
    #         Holding.objects.create(**holding_data)
    #     return portfolio
    
    # def update(self, instance, validated_data):
    #     # Extract holdings data from the validated data
    #     holdings_data = validated_data.pop('holdings', [])

    #     # Update the portfolio itself
    #     for attr, value in validated_data.items():
    #         setattr(instance, attr, value)
    #     instance.save()

    #     # Get existing holdings for this portfolio
    #     existing_holdings = {holding.id: holding for holding in instance.holdings.all()}
        
    #     # Process incoming holdings
    #     new_holdings = []
    #     for holding_data in holdings_data:
    #         holding_id = holding_data.get('id')  # Extract the ID if provided
    #         if holding_id and holding_id in existing_holdings:
    #             # Update the existing holding
    #             holding = existing_holdings.pop(holding_id)
    #             for attr, value in holding_data.items():
    #                 if attr != 'id':  # Do not update the ID
    #                     setattr(holding, attr, value)
    #             holding.save()
    #         else:
    #             # Create a new holding
    #             new_holdings.append(Holding(**holding_data))

    #     # Bulk create new holdings
    #     if new_holdings:
    #         Holding.objects.bulk_create(new_holdings)

    #     # Delete any remaining holdings that were not included in the request
    #     for holding in existing_holdings.values():
    #         holding.delete()

    #     return instance



