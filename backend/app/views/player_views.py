from rest_framework import viewsets
from ..models import *
from ..serializers.player_serializers import PlayerSerializer
from rest_framework.filters import SearchFilter

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    filter_backends = [SearchFilter]
    search_fields = ['username', 'first_name', 'last_name']  # Add searchable fields