# Generated by Django 5.1.3 on 2024-11-26 02:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_rename_price_stock_trade_price_remove_stock_name'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='holding',
            unique_together=set(),
        ),
    ]