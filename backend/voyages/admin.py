from django.contrib import admin
from .models import Voyage


@admin.register(Voyage)
class VoyageAdmin(admin.ModelAdmin):
    list_display = ("titre", "destination", "categorie", "date_depart", "prix", "places_disponibles", "statut")
    list_filter = ("categorie", "statut")
    search_fields = ("titre", "destination", "pays", "ville")
