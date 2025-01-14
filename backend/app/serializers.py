from rest_framework import serializers
from .models import * 
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password

class AlertPreferencesSerializer(serializers.ModelSerializer):

    class Meta:
        model = AlertPreferences
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    alert_preferences = AlertPreferencesSerializer(required=False)
    profile_picture = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Player
        fields = ['alert_preferences', 'username', 'id', 'email', 'first_name', 'last_name', 'profile_picture', 'password']
        extra_kwargs = {
            "password": {"write_only": True}, 
        }
    
    def validate_username(self, value):
        """
        Check if the username is already taken by another user.
        """
        if(value.strip()==''):
            raise serializers.ValidationError("Username is required.")
        user = self.instance  # The current user instance
        if(user):
            if Player.objects.exclude(pk=user.pk).filter(username=value).exists():
                raise serializers.ValidationError("This username is already taken.")
        return value
    
    def validate(self, data):
         # Check username uniqueness
        
        if data['first_name'].strip() == '':
            raise serializers.ValidationError({"first_name": "First name is required."})
        
        if len(data['first_name']) > 25:
            raise serializers.ValidationError({"first_name": "Name must be fewer than 25 characters."})
        
        if data['last_name'].strip() == '':
            raise serializers.ValidationError({"last_name": "Last name is required."})
        
        if len(data['last_name']) > 25:
            raise serializers.ValidationError({"last_name": "Name must be fewer than 25 characters."})
        
        try:
            validate_email(data['email'])
        except DjangoValidationError:
            raise serializers.ValidationError({"email": "Invalid email format."})
        
        # Check username uniqueness
        if Player.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "An user with that email already exists."})
            
        return super().validate(data)

    def create(self, validated_data):
        # Extract nested data
        alert_preferences_data = validated_data.pop('alert_preferences', None)

        # Create alert preferences object based on if data was included in request, or default if not.
        if(alert_preferences_data):
            alert_preferences = AlertPreferences.objects.create(**alert_preferences_data)
        else:
            alert_preferences = AlertPreferences.objects.create() #Create default

        # Create the player instance using the alert preference object
        player = Player.objects.create_user(alert_preferences=alert_preferences, **validated_data)

        return player

    def update(self, instance, validated_data):
        # Extract nested data
        alert_preferences_data = validated_data.pop('alert_preferences', None)

        # Update the player instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle the nested alert preferences
        if alert_preferences_data:
            alert_preferences, created = AlertPreferences.objects.get_or_create(player=instance)
            for attr, value in alert_preferences_data.items():
                setattr(alert_preferences, attr, value)
            alert_preferences.save()

        return instance
    
    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None
    

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
    player = PlayerSerializer(read_only=True)
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
    

class ContestSerializer(serializers.ModelSerializer):
    portfolios = PortfolioSerializer(many=True, read_only=True)
    players = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Player.objects.all(), write_only=True
    )

    class Meta:
        model = Contest
        fields = [
            'id',
            'owner',
            'picture',
            'is_tournament',
            'league_type',
            'cash_interest_rate',
            'duration',
            'start_date',
            'player_limit',
            'nyse',
            'nasdaq',
            'crypto',
            'portfolios',  
            'players',  
        ]
    
    def create(self, validated_data):
        # Extract player IDs from the input data
        players = validated_data.pop('players', [])
        contest = Contest.objects.create(**validated_data)

        # Create a portfolio for each player and associate with the contest
        for player in players:
            Portfolio.objects.create(player=player, contest=contest)

        return contest
    
    def to_representation(self, instance):
        """Customize the representation to include players as IDs."""
        representation = super().to_representation(instance)
        representation['players'] = [portfolio.player.id for portfolio in instance.portfolios.all()]
        return representation

    
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

        return data

    def create(self, validated_data):
        # Remove password2 from validated data since it's not needed for user creation
        validated_data.pop('password2')
        print(validated_data)
        user_serializer = PlayerSerializer(data=validated_data)
        if(user_serializer.is_valid()):
            user = user_serializer.save()
            return user
        else:
            raise serializers.ValidationError(user_serializer.errors)
