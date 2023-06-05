from django.db import models
from django.contrib.auth.models import User


class QuestionData(models.Model):
    title = models.CharField(max_length=255)
    explanation = models.TextField()
    source = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    date_created = models.DateField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    tags = models.CharField(max_length=255)

    def __str__(self):
        return self.title
