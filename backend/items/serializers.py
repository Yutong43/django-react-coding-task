from rest_framework import serializers
from .models import Item


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'group', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

        # Check duplicates here so the API can return a useful error.
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=Item.objects.all(),
                fields=['group', 'name'],
                message='An item with this name already exists in this group.',
            ),
        ]