# Generated by Django 5.0.2 on 2024-06-10 16:37

import datetime
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0017_remove_posts_number_of_ratings_and_more'),
        ('users', '0004_remove_author_followings_author_following'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2024, 6, 10, 22, 7, 6, 931380)),
        ),
        migrations.CreateModel(
            name='Rating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.IntegerField()),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.author')),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ratings', to='posts.posts')),
            ],
            options={
                'unique_together': {('post', 'author')},
            },
        ),
    ]
