from datetime import date, timedelta
from django.test import TestCase
from rest_framework.exceptions import ValidationError
from ..serializers.misc_serializers import RegisterSerializer
from ..models import Player


class RegisterSerializerTests(TestCase):
    def setUp(self):
        self.valid_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "StrongPassword123",
            "password2": "StrongPassword123",
            "first_name": "Test",
            "last_name": "User",
            "here_for_the": "Competition",
            "education": "None",
            "gender": "Male",
            "location": "Denver, CO",
            "birthday": (date.today() - timedelta(days=365 * 20)).isoformat(),
        }

    def test_register_with_valid_data(self):
        """Test successful registration with valid data."""
        serializer = RegisterSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertIsInstance(user, Player)
        self.assertEqual(user.username, self.valid_data["username"])
        self.assertEqual(user.email, self.valid_data["email"])
        self.assertTrue(user.check_password(self.valid_data["password"]))

    def test_register_with_missing_password(self):
        """Test registration fails if password is missing."""
        invalid_data = self.valid_data.copy()
        invalid_data.pop("password")

        serializer = RegisterSerializer(data=invalid_data)
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertIn("password", context.exception.detail)

    def test_register_with_mismatched_passwords(self):
        """Test registration fails if password and password2 do not match."""
        invalid_data = self.valid_data.copy()
        invalid_data["password2"] = "DifferentPassword123"

        serializer = RegisterSerializer(data=invalid_data)
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertIn("password2", context.exception.detail)
        self.assertEqual(context.exception.detail["password2"][0], "The two passwords must match.")

    def test_register_with_existing_email(self):
        """Test registration fails if the email already exists."""
        Player.objects.create_user(
            username="existinguser",
            email=self.valid_data["email"],
            password="SomePassword123",
            birthday=(date.today() - timedelta(days=365 * 20)).isoformat(),
        )

        serializer = RegisterSerializer(data=self.valid_data)
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertIn("email", context.exception.detail)
        self.assertEqual(context.exception.detail["email"][0], "A user with that email already exists.")

    def test_register_with_invalid_email_format(self):
        """Test registration fails if the email format is invalid."""
        invalid_data = self.valid_data.copy()
        invalid_data["email"] = "invalid-email"

        serializer = RegisterSerializer(data=invalid_data)
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertIn("email", context.exception.detail)
        self.assertEqual(context.exception.detail["email"][0], "Enter a valid email address.")

    def test_register_with_future_birthday(self):
        """Test registration fails if the birthday is in the future."""
        invalid_data = self.valid_data.copy()
        invalid_data["birthday"] = (date.today() + timedelta(days=1)).isoformat()

        serializer = RegisterSerializer(data=invalid_data)
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertIn("birthday", context.exception.detail)
        self.assertEqual(context.exception.detail["birthday"][0], "Birthday must be in the past.")

    def test_register_with_blank_username(self):
        """Test registration fails if the username is blank."""
        invalid_data = self.valid_data.copy()
        invalid_data["username"] = ""

        serializer = RegisterSerializer(data=invalid_data)
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertIn("username", context.exception.detail)

    def test_register_with_long_first_name(self):
        """Test registration fails if the first name is too long."""
        invalid_data = self.valid_data.copy()
        invalid_data["first_name"] = "A" * 50

        serializer = RegisterSerializer(data=invalid_data)
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)

        self.assertIn("first_name", context.exception.detail)
        self.assertEqual(
            context.exception.detail["first_name"][0],
            "First name must be fewer than 25 characters.",
        )
