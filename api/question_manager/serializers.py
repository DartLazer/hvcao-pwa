from rest_framework import serializers
from .models import QuestionData


class QuestionDataSerializer(serializers.ModelSerializer):
    tags = serializers.CharField(required=True)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        tags = representation['tags']
        tag_list = [tag.strip() for tag in tags.split(',')] if tags else []
        representation['tags'] = tag_list
        return representation

    class Meta:
        model = QuestionData
        fields = ['id', 'title', 'explanation', 'source', 'category', 'tags', 'last_edited_by']


class QuestionDataGetSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField())
    created_by = serializers.StringRelatedField()
    last_edited_by = serializers.StringRelatedField()

    class Meta:
        model = QuestionData
        fields = ['id', 'title', 'explanation', 'source', 'category', 'tags', 'created_by', 'date_updated', 'last_edited_by']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        tags = representation.get('tags')

        if isinstance(tags, list):
            tags_string = ''.join(tags)
            representation['tags'] = [tag.strip() for tag in tags_string.split(',')]

        return representation

