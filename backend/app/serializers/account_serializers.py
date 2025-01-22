from rest_framework import serializers
from ..models import Player
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from datetime import date

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
            "weekly_summary",
            "daily_summary",
            "contest_rank_change",
        ]
    
    def validate_birthday(self, value):
        if value >= date.today():
            raise serializers.ValidationError("Birthday must be in the past.")
        return value

    def validate_username(self, value):
        """Check if the username is already taken by another user."""
        if self.instance and self.instance.username == value:
            return value
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
        if self.instance and self.instance.email == value:
            return value
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