from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime, timedelta


# Abstract model that tracks metadata. The other models used in this project extend MetadataModel
class MetadataModel(models.Model):
    time_created = models.DateTimeField(auto_now_add=True)
    time_updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class AccountSettings(models.Model):
    #User Info
    HERE_FOR_THE_CHOICES = [
        ("Competition", "Competition"),
        ("Cash Prizes", "Cash Prizes"),
        ("Learning", "Learning"),
        ("Strategy Testing", "Strategy Testing"),
        ("Just Checking It Out", "Just Checking It Out"),
    ]
    EDUCATION_CHOICES = [
        ("None", "None"),
        ("High School", "High School"),
        ("College", "College"),
        ("Post-Grad", "Post-Grad"),
    ]
    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
        ("Prefer not to say", "Prefer not to say"),
    ]
    INVESTING_KNOWLEDGE_CHOICES = [
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
        ("Professional", "Professional"),
    ]
    here_for_the = models.CharField(max_length = 127, choices=HERE_FOR_THE_CHOICES, default='Competition')
    education = models.CharField(max_length = 127, choices=EDUCATION_CHOICES, default='None')
    gender = models.CharField(max_length = 127, choices=GENDER_CHOICES, default='Male')
    investing_knowledge = models.CharField(max_length = 127, choices=INVESTING_KNOWLEDGE_CHOICES, default='Beginner')
    birthday = models.DateField()

    #Notifications
    weekly_summary = models.BooleanField(default=False)
    daily_summary = models.BooleanField(default=True)
    contest_rank_change = models.BooleanField(default=False)

# Player Model: Users for Wall Street Rivals.
class Player(AbstractUser):
    location = models.CharField(max_length = 255)
    profile_picture = models.ImageField(
        upload_to="profile_pictures/", null=True, blank=True
    )
    account_settings = models.ForeignKey(
        AccountSettings, null=True, on_delete=models.CASCADE, related_name="player"
    )


class Contest(MetadataModel):
    name = models.CharField(max_length=50)
    owner = models.ForeignKey(Player, null=True, on_delete=models.SET_NULL, related_name='contest')
    picture = models.ImageField(upload_to="contest_pictures/", null=True, blank=True)
    is_tournament = models.BooleanField(default=False)
    LEAGUE_TYPE_CHOICES = [
        ("public", "Public"),
        ("private", "Private"),
        ("self", "Self"),
    ]
    league_type = models.CharField(
        max_length=10, choices=LEAGUE_TYPE_CHOICES, default="public"
    )
    STATE_CHOICES = [
        ("upcoming", "Upcoming"),
        ("active", "Active"),
        ("completed", "Completed"),
    ]
    state = models.CharField(
        max_length=10,
        choices= STATE_CHOICES,
        default="upcoming",
    )
    DURATION_CHOICES = [
        ("day", "Day"),
        ("week", "Week"),
        ("month", "Month"),
    ]
    duration = models.CharField(max_length=10, choices=DURATION_CHOICES, default="day")
    cash_interest_rate = models.FloatField(default=1.0)
    start_date = models.DateField()
    end_date = models.DateField()
    player_limit = models.PositiveIntegerField(default=10)

    # Marketplaces
    nyse = models.BooleanField(default=True)
    nasdaq = models.BooleanField(default=True)
    crypto = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if self.start_date:
            if self.duration == "day":
                self.end_date = self.start_date + timedelta(days=1)
            elif self.duration == "week":
                self.end_date = self.start_date + timedelta(weeks=1)
            elif self.duration == "month":
                self.end_date = self.start_date + timedelta(days=30)  # Approximation for months
        super().save(*args, **kwargs)


# Portfolio Model
class Portfolio(MetadataModel):
    active = models.BooleanField(default=False)
    player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="portfolios"
    )
    contest = models.ForeignKey(
        Contest, on_delete=models.CASCADE, related_name="portfolios"
    )
    cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)


# Stock model: Represents stock in a holding in an user's portfolio. Many holdings refer to one stock.
class Stock(MetadataModel):
    ticker = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255, default="")
    trade_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)


# Holding model: every holding has a portfolio it is in, and a stock it has a certain quantity of.
class Holding(MetadataModel):
    portfolio = models.ForeignKey(
        Portfolio, on_delete=models.CASCADE, related_name="holdings"
    )
    shares = models.IntegerField(default=0)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="holdings")
