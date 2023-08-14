from django.contrib import admin
from .models import QuestionData


@admin.register(QuestionData)
class QuestionDataAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'source', 'category', 'date_updated', 'created_by', 'tags', 'last_edited_by']
    list_filter = ['category', 'date_updated']
    search_fields = ['title', 'explanation']

