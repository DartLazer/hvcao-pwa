from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


class QuestionData(models.Model):
    title = models.CharField(max_length=255)
    explanation = models.TextField()
    source = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    date_created = models.DateField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_by_questions")
    last_edited_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True,
                                       related_name="last_edited_by_questions")
    tags = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class QuestionVersion(models.Model):
    version = models.IntegerField(default=0)

    @classmethod
    def increment(cls):
        if cls.objects.count() == 0:
            cls.objects.create(version=1)
        else:
            obj = cls.objects.first()
            obj.version += 1
            obj.save()


@receiver(post_save, sender=QuestionData)
def increment_version_on_save(sender, **kwargs):
    QuestionVersion.increment()


@receiver(post_delete, sender=QuestionData)
def increment_version_on_delete(sender, **kwargs):
    QuestionVersion.increment()
