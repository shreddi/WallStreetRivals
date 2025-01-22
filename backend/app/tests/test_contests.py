from datetime import date, timedelta
from django.test import TestCase
from ..models import Player, Contest, Portfolio
from ..serializers.misc_serializers import ContestSerializer

class ContestSerializerTestCase(TestCase):
    def setUp(self):
        # Set up test data
        self.owner = Player.objects.create_user(username="owner", password="password")
        self.player1 = Player.objects.create_user(username="player1", password="password")
        self.player2 = Player.objects.create_user(username="player2", password="password")
        self.player3 = Player.objects.create_user(username="player3", password="password")

        # Dynamically calculate a valid start date within the next year
        self.start_date = (date.today() + timedelta(days=30)).isoformat()  # 30 days from today

        # Use IDs instead of Player objects for the players field
        self.valid_data = {
            "owner": self.owner.id,
            "picture": None,
            "is_tournament": False,
            "league_type": "private",
            "cash_interest_rate": 0,
            "duration": "week",
            "start_date": self.start_date,
            "player_limit": 10,
            "nyse": True,
            "nasdaq": False,
            "crypto": False,
            "players": [self.player1.id, self.player2.id, self.player3.id],
        }

    def test_serializer_create(self):
        serializer = ContestSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        contest = serializer.save()

        # Assert the contest is created successfully
        self.assertEqual(contest.owner, self.owner)
        self.assertEqual(contest.league_type, "private")
        self.assertEqual(contest.cash_interest_rate, 0)
        self.assertEqual(contest.start_date.strftime('%Y-%m-%d'), self.start_date)

        portfolios = Portfolio.objects.filter(contest=contest)
        self.assertEqual(portfolios.count(), 3)

        player_ids = [portfolio.player.id for portfolio in portfolios]
        self.assertListEqual(player_ids, [self.player1.id, self.player2.id, self.player3.id])

    def test_serializer_invalid_past_start_date(self):
        invalid_data = self.valid_data.copy()
        invalid_data['start_date'] = (date.today() - timedelta(days=1)).isoformat()  # Yesterday

        serializer = ContestSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("The start date must be at least one day in the future.", serializer.errors['start_date'])

    def test_serializer_invalid_far_future_start_date(self):
        invalid_data = self.valid_data.copy()
        invalid_data['start_date'] = (date.today() + timedelta(days=366)).isoformat()  # More than 1 year

        serializer = ContestSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("The start date cannot be more than one year from today.", serializer.errors['start_date'])

    def test_serializer_invalid_player_limit_exceeded(self):
        invalid_data = self.valid_data.copy()
        invalid_data['players'] = [
            self.player1.id,
            self.player2.id,
            self.player3.id,
            Player.objects.create_user(username="player4", password="password").id,
        ]  # 4 players, exceeding player_limit of 3

        invalid_data['player_limit'] = 3

        serializer = ContestSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("The number of players exceeds the player limit.", serializer.errors['players'])

    def test_serializer_invalid_no_marketplace_enabled(self):
        invalid_data = self.valid_data.copy()
        invalid_data['nyse'] = False
        invalid_data['nasdaq'] = False
        invalid_data['crypto'] = False  # No marketplaces enabled

        serializer = ContestSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("At least one marketplace (NYSE, NASDAQ, or Crypto) must be enabled.", serializer.errors['marketplaces'])
