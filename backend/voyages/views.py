from datetime import date
from django.db.models import Count, Q
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsStaffOrReadOnly
from .models import Voyage
from .serializers import VoyageSerializer


class VoyageViewSet(viewsets.ModelViewSet):
       
            
                                                       
                                                              
                                                                                                   
       
    serializer_class = VoyageSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = Voyage.objects.all()
        p = self.request.query_params

        if p.get("search"):
            s = p["search"]
            queryset = queryset.filter(
                Q(titre__icontains=s) | Q(destination__icontains=s)
                | Q(pays__icontains=s) | Q(ville__icontains=s)
            )
        if p.get("categorie"):
            queryset = queryset.filter(categorie=p["categorie"])
        if p.get("statut"):
            queryset = queryset.filter(statut=p["statut"])
        if p.get("prix_min"):
            queryset = queryset.filter(prix__gte=p["prix_min"])
        if p.get("prix_max"):
            queryset = queryset.filter(prix__lte=p["prix_max"])
        if p.get("date"):
            queryset = queryset.filter(date_depart__gte=p["date"])                                           
        if p.get("disponible") == "true":
            queryset = queryset.filter(places_disponibles__gt=0, date_retour__gte=date.today())
        return queryset

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def populaires(self, request):
                                                                                    
        voyages = (
            Voyage.objects
            .annotate(nb_reservations=Count("reservations", filter=~Q(reservations__statut="annulee")))
            .order_by("-nb_reservations", "date_depart")[:6]
        )
        return Response(VoyageSerializer(voyages, many=True).data)
