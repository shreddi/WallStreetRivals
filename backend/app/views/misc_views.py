from ..serializers.misc_serializers import NotificationSerializer
from ..models import Notification
from rest_framework import viewsets

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
