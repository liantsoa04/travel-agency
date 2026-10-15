from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User
from clients.models import Client


class UserSerializer(serializers.ModelSerializer):
    """Utilisé pour afficher et gérer les utilisateurs (page Utilisateurs de l'admin)."""
    password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role", "is_active", "date_joined", "password"]
        read_only_fields = ["date_joined"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "Le mot de passe est obligatoire."})
        # On utilise l'e-mail comme username
        user = User.objects.create_user(
            username=validated_data["email"], password=password, **validated_data
        )
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for champ, valeur in validated_data.items():
            setattr(instance, champ, valeur)
        if password:
            instance.set_password(password)   # le mot de passe est toujours chiffré
        instance.save()
        return instance


class RegisterSerializer(serializers.Serializer):
    """Inscription d'un nouveau client : crée un User (role=client) et sa fiche Client."""
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    telephone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    adresse = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists() or Client.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cette adresse e-mail est déjà utilisée.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            role="client",
        )
        Client.objects.create(
            user=user,
            nom=validated_data["last_name"],
            prenom=validated_data["first_name"],
            email=validated_data["email"],
            telephone=validated_data.get("telephone", ""),
            adresse=validated_data.get("adresse", ""),
        )
        return user


class LoginSerializer(TokenObtainPairSerializer):
    """Login JWT : on ajoute les infos de l'utilisateur (dont le rôle) à la réponse."""
    def validate(self, attrs):
        data = super().validate(attrs)   # contient "access" et "refresh"
        data["user"] = {
            "id": self.user.id,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "role": self.user.role,
        }
        return data
