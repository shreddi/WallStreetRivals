from django.test import TestCase
from ..models import Player, Contest, Portfolio
from ..serializers import ContestSerializer

class ContestSerializerTestCase(TestCase):
    def setUp(self):
        # Set up test data
        self.owner = Player.objects.create_user(username="owner", password="password")
        self.player1 = Player.objects.create_user(username="player1", password="password")
        self.player2 = Player.objects.create_user(username="player2", password="password")
        self.player3 = Player.objects.create_user(username="player3", password="password")

        # Use IDs instead of Player objects for the players field
        self.valid_data = {
            "owner": self.owner.id,
            "picture": None,
            "is_tournament": False,
            "league_type": "private",
            "cash_interest_rate": 0,
            "duration": "week",
            "start_date": "2045-01-20",
            "player_limit": 10,
            "nyse": False,
            "nasdaq": False,
            "crypto": False,
            "players": [self.player1.id, self.player2.id, self.player3.id],  # Use IDs here
        }

        
    def test_serializer_create(self):
        # Initialize the serializer with the test data
        serializer = ContestSerializer(data=self.valid_data)

        # Ensure the data is valid
        self.assertTrue(serializer.is_valid(), serializer.errors)

        # Save the contest using the serializer
        contest = serializer.save()

        # Validate the contest instance
        self.assertEqual(contest.owner, self.owner)
        self.assertEqual(contest.league_type, "private")
        self.assertEqual(contest.cash_interest_rate, 0)
        self.assertEqual(contest.start_date.strftime('%Y-%m-%d'), "2045-01-20")
        self.assertEqual(contest.end_date.strftime('%Y-%m-%d'), "2045-01-27")

        # Validate portfolios
        portfolios = Portfolio.objects.filter(contest=contest)
        self.assertEqual(portfolios.count(), 3)

        # Validate that the portfolios are associated with the correct players
        player_ids = [portfolio.player.id for portfolio in portfolios]
        self.assertListEqual(player_ids, [self.player1.id, self.player2.id, self.player3.id])


    def test_serializer_invalid_data(self):
        # Test with missing required fields
        invalid_data = self.valid_data.copy()
        invalid_data.pop("start_date")  # Remove start_date to simulate invalid input

        # Initialize the serializer with invalid data
        serializer = ContestSerializer(data=invalid_data)

        # Ensure the data is not valid
        self.assertFalse(serializer.is_valid())

        # Check that the error messages are as expected
        self.assertIn("start_date", serializer.errors)
