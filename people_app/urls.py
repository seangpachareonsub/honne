from django.urls import path, include
from .views import SuperView, UserPreferences, Messages, IndividualMessages, QuestionChoices, UserQuestions, IndividualPictures
from .views import RegisterView, LoginView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('users', SuperView, basename='users')
router.register('userpreferences', UserPreferences, basename='userpreferenes')
router.register('messages', Messages, basename='messages')
router.register('individualmessages', IndividualMessages, basename='individualmessages')
router.register('questionchoices', QuestionChoices, basename='questionchoices')
router.register('userquestions', UserQuestions, basename='userquestions')
router.register('individualpictures', IndividualPictures, basename='individualpictures')

urlpatterns = [
    path('', include(router.urls)),
    # sending requests to '/register' to the register view(controller)
    path('register', RegisterView.as_view()), 
    # and the same for login
    path('login', LoginView.as_view()), 
]