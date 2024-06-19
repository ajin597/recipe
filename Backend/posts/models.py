from datetime import datetime
from django.db import models
# from django.utils import timezone

from users.models import Author
import json




class Posts(models.Model):
    author = models.ForeignKey(Author, related_name='posts', on_delete=models.CASCADE)
    likes = models.ManyToManyField(Author, related_name='liked_posts')
    location = models.CharField(max_length=255, null=True, blank=True)
    timestamp = models.DateTimeField(default=datetime.now)
    description = models.TextField(null=True, blank=True)
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Easy')
    ingredients = models.TextField(blank=True, default='[]')
    is_deleted = models.BooleanField(default=False)
    
    def get_ingredients(self):
        return json.loads(self.ingredients)

    def set_ingredients(self, ingredients_list):
        self.ingredients = json.dumps(ingredients_list)

    def save(self, *args, **kwargs):
        if isinstance(self.ingredients, list):
            self.ingredients = json.dumps(self.ingredients)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.author.name
    
    class Meta:
        verbose_name = 'Posts'
        verbose_name_plural = 'Posts'

from django.db import models

class Step(models.Model):
    post = models.ForeignKey(Posts, related_name='steps', on_delete=models.CASCADE)
    text = models.TextField()
    image = models.ImageField(upload_to='step_images/', null=True, blank=True)


class PostImages(models.Model):
    image = models.FileField(upload_to='posts/')
    post = models.ForeignKey(Posts,related_name='images',on_delete=models.CASCADE)

    def __str__(self):
        return str(self.id)

    class Meta:
        verbose_name = 'Post Images'
        verbose_name_plural = 'Post Images'


class Comment(models.Model):
    message = models.CharField(max_length=255)
    author = models.ForeignKey(Author,related_name='comments',on_delete=models.CASCADE)
    post = models.ForeignKey(Posts, related_name='comments',on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=datetime.now())

    def __str__(self):
        return self.author.name

    class Meta:
        verbose_name = 'Posts'
        verbose_name_plural = 'Posts'