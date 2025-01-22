from rest_framework.response import Response
from rest_framework import viewsets
from ..models import *
from ..serializers.contest_serializers import ContestSerializer
from rest_framework.decorators import action

class ContestViewSet(viewsets.ModelViewSet):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer

    @action(detail=False, methods=["get"], name="Open Contests")
    def open(self, request):
        public_contests = self.queryset.filter(league_type="public")
        serializer = self.get_serializer(public_contests, many=True)
        return Response(serializer.data)