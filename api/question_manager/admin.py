from django.contrib import admin
from .models import QuestionData


@admin.register(QuestionData)
class QuestionDataAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'source', 'category', 'date_created', 'created_by', 'tags']
    list_filter = ['category', 'date_created']
    search_fields = ['title', 'explanation']

