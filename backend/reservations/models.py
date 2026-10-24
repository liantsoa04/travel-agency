from django.db import models, transaction

from clients.models import Client
from voyages.models import Voyage


class ReservationError(Exception):
    pass                                            


class Reservation(models.Model):
    STATUTS = [
        ("en_attente", "En attente"),
        ("confirmee", "Confirmée"),
        ("annulee", "Annulée"),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="reservations")
    voyage = models.ForeignKey(Voyage, on_delete=models.CASCADE, related_name="reservations")
    date_reservation = models.DateTimeField(auto_now_add=True)
    nombre_personnes = models.PositiveIntegerField()
    prix_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    statut = models.CharField(max_length=20, choices=STATUTS, default="en_attente")

    class Meta:
        ordering = ["-date_reservation"]

    def save(self, *args, **kwargs):

        self.prix_total = self.voyage.prix * self.nombre_personnes
        super().save(*args, **kwargs)

    def confirmer(self):
                                                                     
        if self.statut == "confirmee":
            raise ReservationError("Cette réservation est déjà confirmée.")
        if self.statut == "annulee":
            raise ReservationError("Une réservation annulée ne peut pas être confirmée.")

        with transaction.atomic():

            voyage = Voyage.objects.select_for_update().get(pk=self.voyage_id)
            if voyage.places_disponibles < self.nombre_personnes:
                raise ReservationError("Nombre de places disponibles insuffisant.")
            voyage.places_disponibles -= self.nombre_personnes
            voyage.save()
            self.statut = "confirmee"
            self.save()

    def annuler(self):
                                                                                      
        if self.statut == "annulee":
            raise ReservationError("Cette réservation est déjà annulée.")

        with transaction.atomic():
            if self.statut == "confirmee":
                voyage = Voyage.objects.select_for_update().get(pk=self.voyage_id)
                voyage.places_disponibles += self.nombre_personnes
                voyage.save()
            self.statut = "annulee"
            self.save()

    def __str__(self):
        return f"{self.client} - {self.voyage.titre} ({self.statut})"
