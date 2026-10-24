from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
       
                                 
                                                                          
                                       
       
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("employe", "Employé"),
        ("client", "Client"),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="client")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def save(self, *args, **kwargs):

        if self.is_superuser:
            self.role = "admin"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.role})"
