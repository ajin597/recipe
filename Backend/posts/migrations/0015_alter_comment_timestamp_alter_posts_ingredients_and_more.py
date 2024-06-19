# Generated by Django 5.0.2 on 2024-06-10 15:00

import datetime
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0014_posts_difficulty_alter_comment_timestamp_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2024, 6, 10, 20, 30, 3, 657640)),
        ),
        migrations.AlterField(
            model_name='posts',
            name='ingredients',
            field=models.TextField(blank=True, default='[]'),
        ),
        migrations.AlterField(
            model_name='posts',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime.now),
        ),
        migrations.CreateModel(
            name='Step',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('image', models.ImageField(blank=True, null=True, upload_to='step_images/')),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='steps', to='posts.posts')),
            ],
        ),
    ]
