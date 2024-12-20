from django.db import models
from django.contrib.auth.models import AbstractUser

#Abstract model that tracks metadata. The other models used in this project extend MetadataModel
class MetadataModel(models.Model):
    time_created = models.DateTimeField(auto_now_add=True)
    time_updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


#Portfolio Model: Portfolio to WSRUser is one to one. Portfolio to holdings is many to one. 
class Portfolio(MetadataModel):
    cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)


# WSRUser Model: Users for Wall Street Rivals. WSRUser to Portfolio is one-to-one.
class WSRUser(AbstractUser):
    portfolio = models.OneToOneField(Portfolio, on_delete=models.CASCADE, related_name='user', null=True)


#Stock model: Represents stock in a holding in an user's portfolio. Many holdings refer to one stock. 
class Stock(MetadataModel):
    ticker = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255, default='')
    trade_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)


#Holding model: every holding has a portfolio it is in, and a stock it has a certain quantity of.
class Holding(MetadataModel):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='holdings')
    shares = models.IntegerField(default=0)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='holdings')

    # class Meta:
    #     unique_together = ('portfolio', 'stock')
