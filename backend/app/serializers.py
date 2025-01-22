from rest_framework import serializers
from .models import *
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from datetime import date, timedelta, time
import pytz

class PlayerSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Player
        fields = [
            "username",
            "id",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "location",
        ]

    def get_profile_picture(self, obj):
        request = self.context.get("request")
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None

class AccountSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField(read_only=True)
    birthday = serializers.DateField(
        required=True,
        error_messages={
            "invalid": "Please select a birthday.",
            "blank": "Please select a birthday.",
            "null": "Please select a birthday.",
        },
    )
    education = serializers.CharField(
        required=True,
        error_messages={"blank": "Please select an education level.", "null": "Please select an education level."},
    )
    gender = serializers.CharField(
        required=True,
        error_messages={"blank": "Please select a gender.", "null": "Please select a gender."},
    )
    location = serializers.CharField(
        required=True,
        error_messages={"blank": "Please select a location.", "null": "Please select a location."},
    )
    here_for_the = serializers.CharField(
        required=True,
        error_messages={"blank": "Please select a reason.", "null": "Please select a reason."},
    )

    class Meta:
        model = Player
        fields = [
            "username",
            "id",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "here_for_the",
            "education",
            "gender",
            "birthday",
            "location",
        ]
    
    def validate_birthday(self, value):
        if value >= date.today():
            raise serializers.ValidationError("Birthday must be in the past.")
        return value

    def validate_username(self, value):
        """Check if the username is already taken by another user."""
        if value.strip() == "":
            raise serializers.ValidationError("Username is required.")
        user = self.instance
        if user:
            if Player.objects.exclude(pk=user.pk).filter(username=value).exists():
                raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_first_name(self, value):
        if value.strip() == "":
            raise serializers.ValidationError("First name is required.")
        if len(value) > 25:
            raise serializers.ValidationError("First name must be fewer than 25 characters.")
        return value

    def validate_last_name(self, value):
        if value.strip() == "":
            raise serializers.ValidationError("Last name is required.")
        if len(value) > 25:
            raise serializers.ValidationError("Last name must be fewer than 25 characters.")
        return value

    def validate_email(self, value):
        if Player.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        try:
            validate_email(value)
        except:
            raise serializers.ValidationError("Invalid email format.")
        return value

    def get_profile_picture(self, obj):
        request = self.context.get("request")
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None


class RegisterSerializer(AccountSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    # Inherit fields and extra_kwargs from AccountSerializer.Meta
    class Meta(AccountSerializer.Meta):
        fields = AccountSerializer.Meta.fields + ["password", "password2"]

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password2": "The two passwords must match."})
        data = super().validate(data)
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        player = Player.objects.create_user(**validated_data)
        return player


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = "__all__"


class HoldingSerializer(serializers.ModelSerializer):
    stock = serializers.PrimaryKeyRelatedField(queryset=Stock.objects.all(), required=False)
    stock_data = StockSerializer(read_only=True, source="stock")
    total_value = serializers.SerializerMethodField()
    # portfolio_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Holding
        fields = "__all__"

    def get_total_value(self, obj):
        # Calculate the total value as shares * trade_price of the stock
        return obj.shares * obj.stock.trade_price if obj.stock and obj.stock.trade_price else 0

    def get_portfolio_percentage(self, obj):
        return (obj.portfolio.total / self.get_total_value(obj)) * 100

    def create(self, validated_data):
        # Extract portfolio and stock information
        portfolio = validated_data.get("portfolio")
        stock = validated_data.get("stock")
        shares = validated_data.get("shares", 0)

        if not portfolio or not stock:
            raise serializers.ValidationError("Portfolio and Stock must be provided.")

        # Check if the stock already exists in the portfolio's holdings
        existing_holding = portfolio.holdings.filter(stock=stock).first()

        if (
            existing_holding
        ):  # If a holding exists for the requested stock, add to the existing holding's shares and stock price, and deduct from the portfolio's cash
            existing_holding.shares += shares

            # Calculate the total value of the additional shares
            additional_value = shares * stock.trade_price

            # Deduct the cost of the additional shares from the portfolio's cash
            if portfolio.cash < additional_value:
                raise serializers.ValidationError("Insufficient cash in the portfolio to buy additional shares.")
            portfolio.cash -= additional_value
            portfolio.save()

            # Save the updated holding
            existing_holding.save()
            return existing_holding
        else:  # Create a new holding if no existing holding is found
            holding = super().create(validated_data)

            # Deduct the cost of the new holding from the portfolio's cash
            total_value = self.get_total_value(holding)
            if portfolio.cash < total_value:
                raise serializers.ValidationError("Insufficient cash in the portfolio to buy this holding.")
            portfolio.cash -= total_value
            portfolio.save()

            return holding


class PortfolioSerializer(serializers.ModelSerializer):
    player = AccountSerializer(read_only=True)
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
    # portfolios = PortfolioSerializer(many=True, read_only=True)
    portfolios = serializers.SerializerMethodField()
    time_left = serializers.SerializerMethodField(read_only=True)
    players = serializers.PrimaryKeyRelatedField(many=True, queryset=Player.objects.all(), write_only=True)
    num_active_players = serializers.SerializerMethodField(read_only=True)
    rank = serializers.SerializerMethodField(read_only=True)
    balance = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Contest
        fields = [
            "id",
            "name",
            "owner",
            "picture",
            "is_tournament",
            "league_type",
            "cash_interest_rate",
            "duration",
            "start_date",
            "end_date",
            "player_limit",
            "nyse",
            "nasdaq",
            "crypto",
            "portfolios",
            "players",
            "time_left",
            "num_active_players",
            "rank",
            "balance",
            "state",
        ]
        extra_kwargs = {"end_date": {"read_only": True}}

    def create(self, validated_data):
        # Extract player IDs from the input data
        players = validated_data.pop("players", [])
        contest = Contest.objects.create(**validated_data)

        # Create a portfolio for each player and associate with the contest
        for player in players:
            Portfolio.objects.create(player=player, contest=contest)

        return contest

    def validate(self, data):
        today = date.today()
        one_year_from_now = today + timedelta(days=365)

        # Ensure the start date is at least one day in the future
        if "start_date" in data:
            if data["start_date"] <= today:
                raise serializers.ValidationError(
                    {
                        "start_date": "Please include a start date. The start date must be at least one day in the future."
                    }
                )
            if data["start_date"] > one_year_from_now:
                raise serializers.ValidationError(
                    {"start_date": "The start date cannot be more than one year from today."}
                )

        # Validate the name is not taken
        if "name" in data:
            if Contest.objects.filter(name=data["name"]).exists():
                raise serializers.ValidationError(
                    {"name": "This contest name is already taken. Please choose another name."}
                )

            # Validate the name has a minimum length
            if len(data["name"]) < 3:
                raise serializers.ValidationError({"name": "The name must be at least 3 characters long."})

            # Validate the name has a maximum length
            if len(data["name"]) > 50:  # Adjust the limit as needed
                raise serializers.ValidationError({"name": "The name must not exceed 50 characters."})

        # Validate player count does not exceed player_limit
        if "players" in data and "player_limit" in data:
            if len(data["players"]) > data["player_limit"]:
                raise serializers.ValidationError({"players": "The number of players exceeds the player limit."})

        # Validate that at least one marketplace is enabled
        if not (data.get("nyse") or data.get("nasdaq") or data.get("crypto")):
            raise serializers.ValidationError(
                {"marketplaces": "At least one marketplace (NYSE, NASDAQ, or Crypto) must be enabled."}
            )

        return data

    def to_representation(self, instance):
        """Customize the representation to include players as IDs."""
        representation = super().to_representation(instance)
        representation["players"] = [portfolio.player.id for portfolio in instance.portfolios.all()]
        return representation

    def get_time_left(self, obj):
        now = datetime.now(pytz.utc)
        print(obj.state)
        till_date = obj.end_date if obj.state == "active" else obj.start_date
        till_time = time(16, 30)
        till_datetime = datetime.combine(till_date, till_time)
        eastern = pytz.timezone("US/Eastern")
        localized_datetime = eastern.localize(till_datetime)

        # Calculate the time difference
        diff = localized_datetime - now
        return diff

    def get_num_active_players(self, obj):
        portfolios = obj.portfolios.all()
        count = sum(1 for portfolio in portfolios if portfolio.active)
        return count

    def get_rank(self, obj):
        request = self.context.get("request", None)
        user_id = request.user.id

        serialized_portfolios = PortfolioSerializer(obj.portfolios.all(), many=True, context=self.context).data

        rank = 1
        sorted_portfolios = sorted(serialized_portfolios, key=lambda p: p.get("total", 0), reverse=True)

        for portfolio in sorted_portfolios:
            if portfolio.get("player").get("id") == user_id:
                if portfolio.get("active"):
                    return rank
            if not portfolio.get("active"):
                continue
            rank += 1

        return -1  # player is not in this contest

    def get_portfolios(self, obj):
        # Order the portfolios by total_value
        serialized_portfolios = PortfolioSerializer(obj.portfolios.all(), many=True, context=self.context).data
        sorted_portfolios = sorted(serialized_portfolios, key=lambda p: p.get("total", 0), reverse=True)
        return sorted_portfolios

    def get_balance(self, obj):
        request = self.context.get("request", None)
        user = request.user
        for portfolio in obj.portfolios.all():
            print(portfolio.player)
            if portfolio.player == user:
                serialized_portfolio = PortfolioSerializer(portfolio).data
                return serialized_portfolio.get("total")
        return -1
