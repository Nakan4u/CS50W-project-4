from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField(max_length=140)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return '{author}: {message} ({timestamp})'.format(
            author=self.author,
            message=self.message,
            timestamp=self.timestamp
        )
