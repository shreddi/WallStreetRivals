# Generated by Django 5.1.4 on 2025-01-13 21:31

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_contest_portfolio_player_portfolio_contest'),
    ]

    operations = [
        migrations.AddField(
            model_name='contest',
            name='owner',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='contest', to=settings.AUTH_USER_MODEL),
        ),
    ]
