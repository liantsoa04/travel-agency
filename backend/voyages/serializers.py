from rest_framework import serializers
from .models import Voyage


class VoyageSerializer(serializers.ModelSerializer):
    nb_reservations = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Voyage
        fields = [
            "id", "titre", "destination", "pays", "ville", "description",
            "date_depart", "date_retour", "prix", "nombre_places",
            "places_disponibles", "categorie", "image", "statut",
            "date_creation", "nb_reservations",
        ]
        # Ces champs sont calculés automatiquement, on ne les envoie pas depuis React
        read_only_fields = ["places_disponibles", "statut", "date_creation"]

    def validate_prix(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix doit être positif.")
        return value

    def validate_nombre_places(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le nombre de places doit être positif.")
        return value

    def validate(self, data):
        # En modification partielle, on reprend les anciennes valeurs si besoin
        depart = data.get("date_depart", getattr(self.instance, "date_depart", None))
        retour = data.get("date_retour", getattr(self.instance, "date_retour", None))
        if depart and retour and retour <= depart:
            raise serializers.ValidationError(
                {"date_retour": "La date de retour doit être après la date de départ."}
            )
        # On ne peut pas réduire les places en dessous du nombre déjà réservé
        if self.instance and "nombre_places" in data:
            deja_reserve = self.instance.nombre_places - self.instance.places_disponibles
            if data["nombre_places"] < deja_reserve:
                raise serializers.ValidationError(
                    {"nombre_places": f"{deja_reserve} places sont déjà réservées."}
                )
        return data

    def update(self, instance, validated_data):
        # Si l'admin change le nombre de places, on ajuste les places disponibles
        if "nombre_places" in validated_data:
            difference = validated_data["nombre_places"] - instance.nombre_places
            instance.places_disponibles = max(0, instance.places_disponibles + difference)
        return super().update(instance, validated_data)
