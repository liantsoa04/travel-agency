from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("client", "voyage", "nombre_personnes", "prix_total", "statut", "date_reservation")
    list_filter = ("statut",)
    search_fields = ("client__nom", "client__prenom", "voyage__titre")
