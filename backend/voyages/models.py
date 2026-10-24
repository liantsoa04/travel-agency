from datetime import date
from django.db import models


class Voyage(models.Model):
    CATEGORIES = [
        ("plage", "Plage"),
        ("aventure", "Aventure"),
        ("culture", "Culture"),
        ("famille", "Famille"),
        ("luxe", "Luxe"),
    ]
    STATUTS = [
        ("disponible", "Disponible"),
        ("presque_complet", "Presque complet"),
        ("complet", "Complet"),
        ("termine", "Terminé"),
    ]

    titre = models.CharField(max_length=150)
    destination = models.CharField(max_length=150)
    pays = models.CharField(max_length=100)
    ville = models.CharField(max_length=100)
    description = models.TextField()
    date_depart = models.DateField()
    date_retour = models.DateField()
    prix = models.DecimalField(max_digits=10, decimal_places=2)                             
    nombre_places = models.PositiveIntegerField()
    places_disponibles = models.PositiveIntegerField(null=True, blank=True)
    categorie = models.CharField(max_length=20, choices=CATEGORIES)
    image = models.URLField(max_length=500, blank=True)                                       
    statut = models.CharField(max_length=20, choices=STATUTS, default="disponible")
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date_depart"]

    def calculer_statut(self):
           
                            
                                                         
                                              
                                                              
                                  
           
        if self.date_retour < date.today():
            return "termine"
        if self.places_disponibles == 0:
            return "complet"
        if self.places_disponibles <= self.nombre_places * 0.2:
            return "presque_complet"
        return "disponible"

    def save(self, *args, **kwargs):
                                                           
        if self.places_disponibles is None:
            self.places_disponibles = self.nombre_places
        self.statut = self.calculer_statut()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.titre} ({self.destination})"
