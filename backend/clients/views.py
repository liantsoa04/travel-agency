from django.db.models import Count, Q
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdminOrEmployee
from .models import Client
from .serializers import ClientSerializer, ClientProfileSerializer


class ClientViewSet(viewsets.ModelViewSet):
    """
    CRUD des clients (admin / employé).
    + /api/clients/me/            : profil du client connecté
    + /api/clients/<id>/reservations/ : réservations d'un client
    """
    serializer_class = ClientSerializer
    permission_classes = [IsAdminOrEmployee]

    def get_permissions(self):
        if self.action == "me":
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        queryset = Client.objects.annotate(nombre_reservations=Count("reservations"))
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) | Q(prenom__icontains=search)
                | Q(email__icontains=search) | Q(telephone__icontains=search)
            )
        return queryset

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        """Le client voit et modifie sa propre fiche."""
        user = request.user
        if user.role != "client":
            return Response({"detail": "Cette page est réservée aux clients."}, status=403)

        # Si la fiche n'existe pas encore, on la crée à partir du compte
        client, _ = Client.objects.get_or_create(
            user=user,
            defaults={"nom": user.last_name, "prenom": user.first_name, "email": user.email},
        )

        if request.method == "PATCH":
            serializer = ClientProfileSerializer(client, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            # on garde le nom du compte synchronisé avec la fiche
            user.first_name = client.prenom
            user.last_name = client.nom
            user.save()
            return Response(serializer.data)

        return Response(ClientProfileSerializer(client).data)

    @action(detail=True, methods=["get"])
    def reservations(self, request, pk=None):
        from reservations.serializers import ReservationSerializer  # import ici pour éviter une boucle
        client = self.get_object()
        serializer = ReservationSerializer(client.reservations.all().order_by("-date_reservation"), many=True)
        return Response(serializer.data)
