# Generated by Django 5.0.2 on 2024-06-02 04:44

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0012_posts_ingredients_posts_title_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='posts',
            name='title',
        ),
        migrations.AlterField(
            model_name='comment',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2024, 6, 2, 10, 14, 54, 875771)),
        ),
        migrations.AlterField(
            model_name='posts',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2024, 6, 2, 10, 14, 54, 875771)),
        ),
    ]
