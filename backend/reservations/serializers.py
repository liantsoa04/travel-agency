from rest_framework import serializers

from clients.models import Client
from voyages.models import Voyage
from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), required=False)
    voyage = serializers.PrimaryKeyRelatedField(queryset=Voyage.objects.all())

    # Champs en lecture seule pour afficher facilement les informations dans React
    client_nom = serializers.SerializerMethodField()
    client_email = serializers.CharField(source="client.email", read_only=True)
    voyage_titre = serializers.CharField(source="voyage.titre", read_only=True)
    voyage_destination = serializers.CharField(source="voyage.destination", read_only=True)
    voyage_image = serializers.CharField(source="voyage.image", read_only=True)
    voyage_prix = serializers.DecimalField(source="voyage.prix", max_digits=10, decimal_places=2, read_only=True)
    voyage_date_depart = serializers.DateField(source="voyage.date_depart", read_only=True)
    voyage_date_retour = serializers.DateField(source="voyage.date_retour", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "client", "voyage", "date_reservation", "nombre_personnes",
            "prix_total", "statut",
            "client_nom", "client_email", "voyage_titre", "voyage_destination",
            "voyage_image", "voyage_prix", "voyage_date_depart", "voyage_date_retour",
        ]
        read_only_fields = ["date_reservation", "prix_total", "statut"]

    def get_client_nom(self, obj):
        return f"{obj.client.prenom} {obj.client.nom}"

    def validate_nombre_personnes(self, value):
        if value < 1:
            raise serializers.ValidationError("Le nombre de personnes doit être supérieur à 0.")
        return value

    def validate(self, data):
        voyage = data["voyage"]
        if voyage.statut == "termine":
            raise serializers.ValidationError("Ce voyage est terminé, la réservation est impossible.")
        if voyage.statut == "complet" or voyage.places_disponibles == 0:
            raise serializers.ValidationError("Ce voyage est complet.")
        if data["nombre_personnes"] > voyage.places_disponibles:
            raise serializers.ValidationError("Nombre de places disponibles insuffisant.")
        return data
