from rest_framework import serializers
from .portfolio_serializers import PortfolioSerializer
from ..models import Contest, Player, Portfolio, Notification
from datetime import date, datetime, timedelta, time
import pytz


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
            Notification.objects.create(player=player, contest=contest, type="contest_invite")

        return contest

    def validate_start_date(self, value):
        today = date.today()
        one_year_from_now = today + timedelta(days=365)

        if value <= today:
            raise serializers.ValidationError("Please include a start date. The start date must be at least one day in the future.")
        if value > one_year_from_now:
            raise serializers.ValidationError("The start date cannot be more than one year from today.")

        return value

    def validate_name(self, value):
        # Validate the name is not taken
        if Contest.objects.filter(name=value).exists():
            raise serializers.ValidationError("This contest name is already taken. Please choose another name.")
        # Validate the name has a minimum length
        if len(value) < 3:
            raise serializers.ValidationError("The name must be at least 3 characters long.")
        # Validate the name has a maximum length
        if len(value) > 50:  # Adjust the limit as needed
            raise serializers.ValidationError("The name must not exceed 50 characters.")
        
        return value

    def validate(self, data):
        # Validate player count does not exceed player_limit
        if "players" in data and "player_limit" in data:
            if len(data["players"]) > data["player_limit"]:
                raise serializers.ValidationError({"players": "The number of players exceeds the player limit."})

        # Validate that at least one marketplace is enabled
        if not (data.get("nyse") or data.get("nasdaq") or data.get("crypto")):
            raise serializers.ValidationError({"marketplaces": "At least one marketplace (NYSE, NASDAQ, or Crypto) must be enabled."})

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
