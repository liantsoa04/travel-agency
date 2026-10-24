from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
                                          
    nombre_reservations = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Client
        fields = ["id", "nom", "prenom", "email", "telephone", "adresse", "date_creation", "nombre_reservations"]
        read_only_fields = ["date_creation"]


class ClientProfileSerializer(serializers.ModelSerializer):
                                                                                    
    class Meta:
        model = Client
        fields = ["id", "nom", "prenom", "email", "telephone", "adresse"]
        read_only_fields = ["email"]
