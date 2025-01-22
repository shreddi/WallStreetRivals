from datetime import date, timedelta
from django.test import TestCase
from rest_framework.exceptions import ValidationError
from backend.app.serializers.misc_serializers import AccountSerializer
from app.models import Player


class AccountSerializerTests(TestCase):
    def setUp(self):
        self.user = Player.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            first_name="Test",
            last_name="User",
            birthday=date.today() - timedelta(days=365 * 20),
            location="New York, NY",
            password="StrongPassword123",
        )

    def test_update_valid_data(self):
        """Test updating account with valid data."""
        data = {
            "username": "updateduser",
            "email": "updateduser@example.com",
            "first_name": "Updated",
            "last_name": "Name",
            "birthday": (date.today() - timedelta(days=365 * 25)).isoformat(),
            "location": "Los Angeles, CA",
        }

        serializer = AccountSerializer(instance=self.user, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_user = serializer.save()

        self.assertEqual(updated_user.username, data["username"])
        self.assertEqual(updated_user.email, data["email"])
        self.assertEqual(updated_user.first_name, data["first_name"])
        self.assertEqual(updated_user.last_name, data["last_name"])
        self.assertEqual(updated_user.birthday, date.fromisoformat(data["birthday"]))
        self.assertEqual(updated_user.location, data["location"])

    def test_update_with_duplicate_email(self):
        """Test updating account with an email already taken."""
        Player.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="AnotherPassword123",
        )

        data = {"email": "otheruser@example.com"}
        serializer = AccountSerializer(instance=self.user, data=data, partial=True)

        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertIn("email", context.exception.detail)
        self.assertEqual(
            context.exception.detail["email"][0], "A user with that email already exists."
        )

    def test_update_with_invalid_birthday(self):
        """Test updating account with a future birthday."""
        data = {"birthday": (date.today() + timedelta(days=1)).isoformat()}
        serializer = AccountSerializer(instance=self.user, data=data, partial=True)

        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertIn("birthday", context.exception.detail)
        self.assertEqual(context.exception.detail["birthday"][0], "Birthday must be in the past.")

    def test_update_with_blank_first_name(self):
        """Test updating account with a blank first name."""
        data = {"first_name": ""}
        serializer = AccountSerializer(instance=self.user, data=data, partial=True)

        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertIn("first_name", context.exception.detail)
        self.assertEqual(context.exception.detail["first_name"][0], "First name is required.")

    def test_update_with_long_last_name(self):
        """Test updating account with a last name exceeding max length."""
        data = {"last_name": "A" * 26}  # 26 characters
        serializer = AccountSerializer(instance=self.user, data=data, partial=True)

        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertIn("last_name", context.exception.detail)
        self.assertEqual(
            context.exception.detail["last_name"][0], "Last name must be fewer than 25 characters."
        )
