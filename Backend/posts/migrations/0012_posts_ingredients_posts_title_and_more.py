# Generated by Django 5.0.2 on 2024-06-02 04:27

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0011_alter_comment_timestamp_alter_posts_timestamp'),
    ]

    operations = [
        migrations.AddField(
            model_name='posts',
            name='ingredients',
            field=models.TextField(default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='posts',
            name='title',
            field=models.CharField(default=1, max_length=255),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='comment',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2024, 6, 2, 9, 56, 58, 940588)),
        ),
        migrations.AlterField(
            model_name='posts',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2024, 6, 2, 9, 56, 58, 938596)),
        ),
    ]
