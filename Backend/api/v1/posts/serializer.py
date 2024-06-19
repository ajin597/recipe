from rest_framework import serializers
from posts.models import Posts,PostImages,Comment
from users.models import Author
from api.v1.users.serializer import SearchSerializer


class AuthorSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    class Meta:
        model = Author
        fields = ('id','username','image')

    def get_username(self,instance):
        return instance.user.username


class PostImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImages
        fields = ('image','id')

class PostIdSerializer(serializers.ModelSerializer):
    images = PostImagesSerializer(many=True)
    class Meta:
        model = Posts 
        fields = ('id','images')
        
class CommentsSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    isAuthor = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = ('id','message','author','timestamp','isAuthor')

    def get_author(self,instance):
        request = self.context.get('request', None)
        return SearchSerializer(instance.author.user,context={'request': request}).data

    def get_isAuthor(self,instance):
        request = self.context.get('request', None)
        if request.user.author == instance.author:
            return True
        else:
            return False
from posts.models import Step
class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = ('id', 'text', 'image')


class PostSerializer(serializers.ModelSerializer):
    images = PostImagesSerializer(many=True, read_only=True)
    steps = StepSerializer(many=True, read_only=True)
    images = PostImagesSerializer(many=True)
    comments = serializers.SerializerMethodField()
    author = AuthorSerializer(read_only=True)
    likes = serializers.SerializerMethodField()
    isLiked = serializers.SerializerMethodField()
    isSaved = serializers.SerializerMethodField()
    isAuthor = serializers.SerializerMethodField()
    difficulty = serializers.CharField(source='get_difficulty_display')  # Add difficulty field
    ingredients = serializers.CharField()  # Add ingredients field

    class Meta:
        model = Posts 
        fields = ('id','images','author','location','timestamp','description','likes','isLiked','isSaved','isAuthor','comments','difficulty','ingredients','images', 'steps')

    def get_comments(self,instance):
        request = self.context.get('request',None)
        return CommentsSerializer(instance.comments.all().order_by('timestamp'),many=True,context={'request': request}).data
    

    def get_likes(self,instance):
        return instance.likes.count()

    def get_isLiked(self,instance):
        request = self.context.get('request',None)
        if request:
            user = request.user.author 
            if user.liked_posts.filter(id=instance.id).exists():
                return True
            else:
                return False
        else:
            return False

    def get_isSaved(self, instance):
        request = self.context.get('request',None)
        if request:
            user = request.user.author 
            if user.saved_posts.filter(id=instance.id).exists():
                return True 
            else:
                return False 
        else:
            return False    

    def get_isAuthor(self, instance):
        request = self.context.get('request',None)
        if request:
            user = request.user.author 
            if user == instance.author:
                return True 
            else:
                return False 
        else:
            return False         
        
from rest_framework import serializers
from posts.models import Posts, PostImages


class PostsSerializer(serializers.ModelSerializer):
    images = PostImagesSerializer(many=True, read_only=True)

    class Meta:
        model = Posts
        fields = ('id', 'author', 'likes', 'location',  'description',  'ingredients',  'images')
