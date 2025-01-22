from rest_framework import serializers
from ..models import Player

class PlayerSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Player
        fields = [
            "username",
            "id",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "location",
        ]

    def get_profile_picture(self, obj):
        request = self.context.get("request")
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None