from django.contrib import admin
from .models import UserPreferences, Messages
from django.contrib.auth import get_user_model
User = get_user_model()

# registering our model gives us CRUD ability of our model within the admin panel
admin.site.register(User)
admin.site.register(UserPreferences)
admin.site.register(Messages)
