from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    """Utilisé par l'admin / l'employé."""
    nombre_reservations = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Client
        fields = ["id", "nom", "prenom", "email", "telephone", "adresse", "date_creation", "nombre_reservations"]
        read_only_fields = ["date_creation"]


class ClientProfileSerializer(serializers.ModelSerializer):
    """Utilisé par le client pour son profil (l'e-mail ne peut pas être modifié)."""
    class Meta:
        model = Client
        fields = ["id", "nom", "prenom", "email", "telephone", "adresse"]
        read_only_fields = ["email"]
