from rest_framework import serializers
from .models import * 
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['email', 'first_name', 'last_name']

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = "__all__"

class HoldingSerializer(serializers.ModelSerializer):
    stock = serializers.PrimaryKeyRelatedField(queryset=Stock.objects.all(), required=False)
    stock_data = StockSerializer(read_only=True, source='stock')
    total_value = serializers.SerializerMethodField()
    # portfolio_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Holding
        fields = "__all__"

    def get_total_value(self, obj):
        # Calculate the total value as shares * trade_price of the stock
        return obj.shares * obj.stock.trade_price if obj.stock and obj.stock.trade_price else 0
    
    def get_portfolio_percentage(self, obj):
        return (obj.portfolio.total / self.get_total_value(obj))*100
    
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
    total = serializers.SerializerMethodField()

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
    
    def get_total(self, obj):
        return self.get_holdings_total(obj) + obj.cash
    
class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)  # Add password2 field for confirmation

    class Meta:
        model = Player
        fields = ("username", "email", "password", "password2", "first_name", "last_name")
        extra_kwargs = {
            "password": {"write_only": True},  # Make password write-only
            "password2": {"write_only": True},  # Make password2 write-only
        }

    def validate(self, data):
        # Check that the two password entries match
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "The two passwords must match."})

        # Validate email format
        try:
            validate_email(data['email'])
        except DjangoValidationError:
            raise serializers.ValidationError({"email": "Invalid email format."})
        
        # Validate the password against Django's validators
        try:
            validate_password(data['password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        # Check username uniqueness
        if Player.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Username is already taken."})
        
        if data['first_name'] == '':
            raise serializers.ValidationError({"first_name": "First name is required."})
        
        if data['last_name'] == '':
            raise serializers.ValidationError({"last_name": "Last name is required."})

        # Additional validations can be added here
        return data

    def create(self, validated_data):
        # Remove password2 from validated data since it's not needed for user creation
        validated_data.pop('password2')

        # Create the user with the validated data
        user = Player.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        return user
