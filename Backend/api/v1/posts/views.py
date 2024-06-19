from django.db.models import Q

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from posts.models import Posts, Comment
from .serializer import PostSerializer, PostIdSerializer, CommentsSerializer
from posts.models import Posts, PostImages


from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from posts.models import Posts
from .serializer import PostSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_posts(request):
    # Get the logged-in user's author instance
    logged_in_user = request.user.author

    # Get posts from users the authenticated user is following
    following_users = logged_in_user.following.all()
    following_posts = Posts.objects.filter(author__in=following_users)
    
    # Get all posts from the database excluding the logged-in user's posts
    all_posts = Posts.objects.exclude(author=logged_in_user)
    
    # Combine both querysets and remove duplicates
    posts = following_posts | all_posts
    posts = posts.distinct().order_by('-timestamp')

    # Serialize the posts
    post_instances = PostSerializer(posts, many=True, context={'request': request})

    # Return the serialized data
    return Response(post_instances.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    author = request.user.author

    if Posts.objects.filter(id=post_id).exists():
        post = Posts.objects.get(id=post_id)

        if author.liked_posts.filter(id=post_id).exists():
            post.likes.remove(author)
            like_count = post.likes.count()
            response_obj = {
                'status': 'success',
                'liked': False,
                'count': like_count
            }
            return Response(response_obj)
        else:
            post.likes.add(author)
            like_count = post.likes.count()
            response_obj = {
                'status': 'success',
                'liked': True,
                'count': like_count
            }
            return Response(response_obj)
    else:
        response_obj = {
            'statusCode': 6001,
            'message': 'Post Not Found',
        }
        return Response(response_obj)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def save_post(request, post_id):
    author = request.user.author
    post = Posts.objects.get(id=post_id)

    if author.saved_posts.filter(id=post_id).exists():
        author.saved_posts.remove(post)

        response_obj = {
            'status': 'success',
            'saved': False
        }

        return Response(response_obj)

    else:
        author.saved_posts.add(post)
        response_obj = {
            'status': 'success',
            'saved': True
        }

        return Response(response_obj)


import json
from posts.models import Step
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    images = request.data.getlist('images')
    steps = json.loads(request.data.get('steps', '[]'))
    step_images = request.data.getlist('stepImages')
    ingredients = json.loads(request.data.get('ingredients', '[]'))

    new_post = Posts.objects.create(
        author=request.user.author,
        description=request.data['description'],
        location=request.data['location'],
        difficulty=request.data.get('difficulty', 'Easy'),
        ingredients=json.dumps(ingredients)
    )

    for image in images:
        PostImages.objects.create(post=new_post, image=image)

    for i, step in enumerate(steps):
        step_image = step_images[i] if i < len(step_images) else None
        Step.objects.create(post=new_post, text=step, image=step_image)

    post = PostSerializer(new_post, context={'request': request})
    response_obj = {
        'statusCode': 6000,
        'data': post.data,
        'difficulty': new_post.difficulty,
        'ingredients': new_post.get_ingredients()
    }

    return Response(response_obj)







@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_post(request, post_id):
    if Posts.objects.filter(Q(id=post_id) | Q(is_deleted=False)).exists():
        post = Posts.objects.get(id=post_id)
        post_instance = PostSerializer(post, context={'request': request})

        response_data = {
            'statusCode': 6000,
            'data': post_instance.data
        }
        return Response(response_data)
    else:
        response_data = {
            'statusCode': 6001,
            'message': 'Post not found'
        }
        return Response(response_data)
 # views.py

from django.http import JsonResponse
from posts.models import Posts
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_post1(request, post_id):
    try:
        post = Posts.objects.get(id=post_id)
        data = {
            'id': post.id,
            'author': post.author.name,
            'likes': post.likes.count(),
            'location': post.location,
            'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'description': post.description,
            'difficulty': post.difficulty,
            'ingredients': post.ingredients,
            'images': [image.image.url for image in post.images.all()] if post.images.exists() else [],
            'is_deleted': post.is_deleted
        }
        return JsonResponse(data)
    except Posts.DoesNotExist:
        return JsonResponse({'error': 'Post not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_posts(request):
    print('saved posts')
    posts = request.user.author.saved_posts.all()
    posts = posts.filter(is_deleted=False)
    posts_instance = PostIdSerializer(
        posts, many=True, context={'request': request})

    response_data = {
        'statusCode': '6000',
        'data': posts_instance.data
    }
    return Response(response_data)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from posts.models import Posts

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):
    try:
        post = Posts.objects.get(id=post_id)
        post.delete()
        response_data = {
            'statusCode': 6000,
            'message': f'post with id {post_id} is deleted successfully'
        }
        return Response(response_data, status=status.HTTP_200_OK)
    except Posts.DoesNotExist:
        response_data = {
            'statusCode': 6001,
            'message': f'post with id {post_id} does not exist'
        }
        return Response(response_data, status=status.HTTP_404_NOT_FOUND)


from django.shortcuts import get_object_or_404

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_post(request, post_id):
    post = get_object_or_404(Posts, id=post_id)
    
    post.description = request.data.get('description', post.description)
    post.location = request.data.get('location', post.location)
    post.ingredients = request.data.get('ingredients', post.ingredients)
    post.difficulty = request.data.get('difficulty', post.difficulty)
    post.save()

    # Handle image upload
    if 'image' in request.FILES:
        # Delete existing images if needed
        PostImages.objects.filter(post=post).delete()
        
        # Save the new image
        image = request.FILES['image']
        PostImages.objects.create(post=post, image=image)

    response_data = {
        'statusCode': 6000,
        'message': 'Post updated successfully'
    }
    return Response(response_data)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, post_id):
    message = request.data.get('message')
    if message is not None:
        author = request.user.author
        post = Posts.objects.get(id=post_id)
        new_comment = Comment.objects.create(
            author=author,
            message=message,
            post=post
        )
        serialized_data = CommentsSerializer(
            new_comment, context={'request': request})

        response_data = {
            'statusCode': 6000,
            'data': serialized_data.data
        }
        return Response(response_data)
    else:
        response_data = {
            'statusCode': 6001,
            'message': 'Comment message cannot be blank'
        }
        return Response(response_data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    comment = Comment.objects.get(id=comment_id)
    if request.user.author == comment.author:
        comment.delete()
        response_data = {
            'statusCode': 6000,
            'deleted': True
        }
        return Response(response_data)
    else:
        response_data = {
            'statusCode': 6001,
            'deleted': False
        }
        return Response(response_data)


