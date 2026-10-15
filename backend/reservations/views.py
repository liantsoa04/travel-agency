from django.db.models import Q
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from accounts.permissions import IsAdminOrEmployee
from clients.models import Client
from .models import Reservation, ReservationError
from .serializers import ReservationSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    """
    Réservations.
    - Client : voit et crée uniquement SES réservations, peut les annuler
    - Admin / employé : voient tout, peuvent confirmer et annuler
    """
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head", "options"]   # pas de PUT/PATCH

    def get_permissions(self):
        if self.action in ("destroy", "confirmer"):
            return [IsAdminOrEmployee()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        queryset = Reservation.objects.select_related("client", "voyage")

        if user.role == "client":
            queryset = queryset.filter(client__user=user)     # seulement les siennes

        p = self.request.query_params
        if p.get("statut"):
            queryset = queryset.filter(statut=p["statut"])
        if p.get("voyage"):
            queryset = queryset.filter(voyage_id=p["voyage"])
        if p.get("search"):
            s = p["search"]
            queryset = queryset.filter(
                Q(client__nom__icontains=s) | Q(client__prenom__icontains=s)
                | Q(voyage__titre__icontains=s) | Q(voyage__destination__icontains=s)
            )
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "client":
            client = Client.objects.get(user=user)
            serializer.save(client=client)
        else:
            if "client" not in serializer.validated_data:
                raise ValidationError({"client": "Le client est obligatoire."})
            serializer.save()

    def perform_destroy(self, instance):
        if instance.statut == "confirmee":
            instance.annuler()          # rend les places avant de supprimer
        instance.delete()

    @action(detail=True, methods=["post"])
    def confirmer(self, request, pk=None):
        reservation = self.get_object()
        try:
            reservation.confirmer()
        except ReservationError as erreur:
            raise ValidationError(str(erreur))
        return Response(ReservationSerializer(reservation).data)

    @action(detail=True, methods=["post"])
    def annuler(self, request, pk=None):
        reservation = self.get_object()   # un client ne trouve que ses propres réservations
        try:
            reservation.annuler()
        except ReservationError as erreur:
            raise ValidationError(str(erreur))
        return Response(ReservationSerializer(reservation).data)
