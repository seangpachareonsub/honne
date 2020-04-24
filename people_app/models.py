from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import UserManager
# from django.contrib.auth import get_user_model
# User = get_user_model()
# for each preference and conversation, the primary leys will match that of the user 

class User(AbstractBaseUser):
  USERNAME_FIELD = 'email'
  email = models.EmailField(max_length=100, unique=True)
  username = models.CharField(max_length=1, unique=False)
  first_name = models.CharField(max_length=30, unique=False)
  date_of_birth = models.DateField(null=True)
  sex = models.CharField(max_length=7)
  preferences = models.ForeignKey('UserPreferences', db_index=True, related_name='user', blank=True, null=True, on_delete=models.SET_NULL)
  star_sign = models.CharField(max_length=20)
  conversations = models.ManyToManyField('Messages', db_index=True, related_name='user', blank=True)
  questions = models.ForeignKey('UserQuestions', related_name='user', null=True, on_delete=models.SET_NULL)
  matches = models.ManyToManyField('self', db_index=True, related_name='matches', blank=True)
  rejected =  models.ManyToManyField('self', db_index=True, related_name='rejects', blank=True)
  latitude = models.CharField(max_length=40)
  longitude = models.CharField(max_length=40)
  occupation = models.CharField(max_length=50)
  bio = models.CharField(max_length=200)
  images = models.ManyToManyField('IndividualPictures', db_index=True, related_name='user', blank=True)  

  objects = UserManager()

  def __str__(self):
    return self.first_name


class IndividualPictures(models.Model):
  owner = models.ForeignKey(User, related_name='pictures', null=True, on_delete=models.CASCADE)
  picture = models.ImageField(upload_to='images')

  def __str__(self):
    return str(self.owner)

class UserPreferences(models.Model):
  owner = models.ForeignKey(User, related_name='userpreferences', null=True, on_delete=models.CASCADE)
  distance = models.IntegerField()
  min_age = models.IntegerField()
  max_age = models.IntegerField()
  sex = models.CharField(max_length=7)

  def __str__(self):
    return str(self.owner)

class IndividualMessages(models.Model):
  sent_from = models.ForeignKey(User, related_name='messages', on_delete=models.CASCADE)
  sent_to = models.ForeignKey(User, related_name='texts', on_delete=models.CASCADE)
  string = models.CharField(max_length=1000)
  created_at = models.DateTimeField(auto_now_add=True)
  def __str__(self):
    return f'{self.sent_from} & {self.sent_to}'

class Messages(models.Model):
  user_one = models.ForeignKey(User, related_name='number_one', on_delete=models.CASCADE)
  user_two = models.ForeignKey(User, related_name='number_two', on_delete=models.CASCADE)
  messages = models.ManyToManyField(IndividualMessages, related_name='individuals', db_index=True, blank=True)
  def __str__(self):
    return f'{self.user_one} & {self.user_two}'

class QuestionChoices(models.Model):
  choice = models.CharField(max_length=1000)
  category = models.CharField(null=True, max_length=30)
  options = models.CharField(null=True, max_length=100)
  def __str__(self):
    return self.choice

class UserQuestions(models.Model):
  owner = models.ForeignKey(User, null=True, related_name='choices', on_delete=models.CASCADE)
  questions = models.ManyToManyField(QuestionChoices, related_name='userquestions', db_index=True, blank=True)
  answers = models.CharField(max_length=1000, blank=True)

  def __str__(self):
    return str(self.owner)

