from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Utilisateur de l'application.
    On ajoute un champ "role" qui décide de ce que la personne peut faire.
    La connexion se fait avec l'e-mail.
    """
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("employe", "Employé"),
        ("client", "Client"),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="client")

    USERNAME_FIELD = "email"          # on se connecte avec l'e-mail
    REQUIRED_FIELDS = ["username"]    # demandé par createsuperuser

    def save(self, *args, **kwargs):
        # Un superutilisateur créé avec "createsuperuser" devient automatiquement admin
        if self.is_superuser:
            self.role = "admin"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.role})"
