# serializer job is to save data in a format we can transfer, in this case JSON
from rest_framework import serializers
from .models import UserPreferences, Messages, IndividualMessages, QuestionChoices, UserQuestions, IndividualPictures
from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework import serializers
import django.contrib.auth.password_validation as validations
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError



# REGISTRATION SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):

    # These fields are only for writing/posting
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)

    def validate(self, data):

        # Check the password and confirmation are the same
        password = data.pop('password')
        password_confirmation = data.pop('password_confirmation')
        if password != password_confirmation:
            raise serializers.ValidationError({'password_confirmation': 'Passwords do not match'})

        # Check the password is sensible
        try:
            validations.validate_password(password=password)
        except ValidationError as err:
            raise serializers.ValidationError({'password': err.messages})

        # Encrypt the password
        data['password'] = make_password(password)
        return data

    class Meta:
        model = User
        fields = ('first_name', 'email', 'password', 'password_confirmation',)






# EACH AND EVERY INDIVIDUAL PICTURE
class IndividualPicturesSerializer(serializers.ModelSerializer):
  class Meta:
    model = IndividualPictures
    fields = ('id', 'owner', 'picture')

# USER SERIALIZER FOR CONVERSATION DISPLAYING NAME
class ConversationUserSerializer(serializers.ModelSerializer):
  images = IndividualPicturesSerializer(many=True)
  class Meta:
    model = User
    fields = ('id', 'first_name', 'images')


# CONVO PER PERSON
class ConversationsSerializer(serializers.ModelSerializer):
  class Meta:
    model = Messages
    fields = '__all__'

# EACH AND EVERY INDIVIDUAL MESSAGE
class IndividualMessagesSerializer(serializers.ModelSerializer):
  class Meta:
    model = IndividualMessages
    fields = ('id', 'string', 'sent_from', 'sent_to', 'created_at')


# POPULATED CONVO
class PopulateConversationsSerializer(serializers.ModelSerializer):
  messages = IndividualMessagesSerializer(many=True)
  user_one = ConversationUserSerializer()
  user_two = ConversationUserSerializer()
  class Meta:
    model = Messages
    fields = ('id', 'user_one', 'user_two', 'messages')

# PREFERENCES
class UserPreferencesSerializer(serializers.ModelSerializer):
  class Meta:
    model = UserPreferences
    fields = '__all__'


# MATCHES
class MatchSerializer(serializers.ModelSerializer):
  images = IndividualPicturesSerializer(many=True)
  class Meta:
    model = User
    fields = ('id', 'first_name', 'date_of_birth', 'star_sign', 'longitude', 'latitude', 'images')

# REJECTED
class RejectSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ('id', 'first_name', 'date_of_birth', 'star_sign', 'longitude', 'latitude')

# ALL QUESTIONS
class QuestionChoicesSerializer(serializers.ModelSerializer):
  class Meta:
    model = QuestionChoices
    fields = '__all__'

# USER QUESTIONS NON POPULATED
class UserQuestionsSerializer(serializers.ModelSerializer):
  class Meta:
    model = UserQuestions
    fields = ('id', 'owner', 'questions', 'answers')  

# POPULATED USER QUESTIONS
class PopulatedUserQuestionsSerializer(serializers.ModelSerializer):
  questions = QuestionChoicesSerializer(many=True)
  class Meta:
    model = UserQuestions
    fields = ('id', 'owner', 'questions', 'answers')  



 # USER NON POPULATED FOR POST AND PUT
class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ('id', 'first_name','last_login','date_of_birth', 'sex', 'preferences', 'star_sign', 'conversations',
    'questions', 'matches', 'rejected', 'longitude', 'latitude', 'images', 'occupation', 'bio')




# POPULATED USER FOR GET 
class PopulateUserSerializer(serializers.ModelSerializer):
# add the serializer nested inside people to populate the fields
  questions = PopulatedUserQuestionsSerializer()
  preferences = UserPreferencesSerializer()
  conversations = PopulateConversationsSerializer(many=True)
  matches = MatchSerializer(many=True)
  rejected = RejectSerializer(many=True)
  images = IndividualPicturesSerializer(many=True)
  # class Meta is to specify which fields from the model we want to serialize and send back
  class Meta:
    model = User
    fields = ('id', 'last_login','first_name', 'date_of_birth', 'sex', 'preferences', 'star_sign', 'conversations',
    'questions', 'matches', 'rejected', 'longitude', 'latitude', 'images', 'occupation', 'bio')




