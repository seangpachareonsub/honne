# SERIALIZERS
from .serializer import PopulateConversationsSerializer ,IndividualMessagesSerializer ,PopulateUserSerializer
from .serializer import UserSerializer, UserPreferencesSerializer, ConversationsSerializer, RegisterSerializer
from .serializer import QuestionChoicesSerializer, UserQuestionsSerializer, PopulatedUserQuestionsSerializer, IndividualPicturesSerializer

# MODELS
from .models import UserPreferences, Messages, IndividualMessages, QuestionChoices, UserQuestions, IndividualPictures

# OTHER CONFIGS
from django.conf import settings
import jwt

# USER ABSTRACT MODEL
from django.contrib.auth import get_user_model
User = get_user_model()

# DRF IMPORTS
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView
from rest_framework.exceptions import PermissionDenied
from rest_framework import viewsets, permissions
from rest_framework.status import HTTP_201_CREATED, HTTP_422_UNPROCESSABLE_ENTITY
from rest_framework.response import Response

###############################################################################################################



# REGISTRATION VIEW, USING REGISTER SERIALIZER
class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        # This will run our custom validation code
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Registration successful'})

        return Response(serializer.errors, status=422)


# LOGIN VIEW, NO SERIALIZER NEEDED, CREATING JWT USING THE USER.ID
class LoginView(APIView):

    # This is not an endpoint, its a helper function used when we POST
    def get_user(self, email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            raise PermissionDenied({'message': 'Invalid credentials'})

    def post(self, request):

        email = request.data.get('email')
        password = request.data.get('password')

        # Check if there's a user with this email.
        user = self.get_user(email)
        # If this password is not the same as the password saved for the user
        # check_password is given to us by django.
        if not user.check_password(password):
            raise PermissionDenied({'message': 'Invalid credentials'})

        # Create a JWT for the user, and send it back
        token = jwt.encode({'sub': user.id}, settings.SECRET_KEY, algorithm='HS256')
        return Response({'token': token, 'message': f'Welcome back {user.username}!'})





# OBJECT LEVEL AUTHENTICATION TO CHECK IF THE CURRENT USER MATCHES THE USER ON THE OBJECT
class IsOwnerOrReadOnly(permissions.BasePermission):
  def has_object_permission(self, request, view, obj):
    # This code will make it work for read-only endpoints.
    if request.method in permissions.SAFE_METHODS:
      return True
    return request.user == obj.owner

# INDEX OF ALL USERS
class SuperView(viewsets.ModelViewSet):
  serializer_class = UserSerializer
  queryset = User.objects.all()

  def get_serializer_class(self):
    serializer_class = self.serializer_class

    if self.request.method == 'GET':
      serializer_class = PopulateUserSerializer
    return serializer_class


# INDEX OF USER PREFERENCES
class UserPreferences(viewsets.ModelViewSet):
  serializer_class = UserPreferencesSerializer
  queryset = UserPreferences.objects.all()
  # permission_classes = (IsOwnerOrReadOnly,)


# CONVERSATION INDEX
class Messages(viewsets.ModelViewSet):
  serializer_class = ConversationsSerializer
  queryset = Messages.objects.all()
  # permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

  def get_serializer_class(self):
    serializer_class = self.serializer_class

    if self.request.method == 'GET':
      serializer_class = PopulateConversationsSerializer
    return serializer_class


# INDIVIDUAL MESSAGES ACROSS ENTIRE APP INDEX
class IndividualMessages(viewsets.ModelViewSet):
  serializer_class = IndividualMessagesSerializer
  queryset = IndividualMessages.objects.all()
  # permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class IndividualPictures(viewsets.ModelViewSet):
  serializer_class = IndividualPicturesSerializer
  queryset = IndividualPictures.objects.all()


# ALL QUESTIONS THAT A USER COULD CHOOSE FROM
class QuestionChoices(viewsets.ModelViewSet):
  serializer_class = QuestionChoicesSerializer
  queryset = QuestionChoices.objects.all()
  # permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

# EACH USER CAN SELECT UP TO 5 QUESTIONS
class UserQuestions(viewsets.ModelViewSet):
  serializer_class = PopulatedUserQuestionsSerializer
  queryset = UserQuestions.objects.all()

  def get_serializer_class(self):
    serializer_class = self.serializer_class

    if self.request.method == 'POST' or self.request.method == 'PUT':
      serializer_class = UserQuestionsSerializer
    return serializer_class
