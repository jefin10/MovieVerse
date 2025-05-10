from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phNo = models.CharField(max_length=15, unique=True)
    dob = models.DateField()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phNo', 'dob']
    
    def __str__(self):
        return self.email
