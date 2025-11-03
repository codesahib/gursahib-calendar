from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

    # Always store in UTC
    def validate(self, data):
        from django.utils.timezone import make_aware
        import pytz

        utc = pytz.UTC
        if data['start_time'].tzinfo is None:
            data['start_time'] = make_aware(data['start_time'], utc)
        if data['end_time'].tzinfo is None:
            data['end_time'] = make_aware(data['end_time'], utc)
        return data
