from datetime import date, datetime

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminOrEmployee
from clients.models import Client
from reservations.models import Reservation
from reservations.serializers import ReservationSerializer
from voyages.models import Voyage

MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]


def debut_du_mois(aujourdhui, retour):
                                                                          
    annee, mois = aujourdhui.year, aujourdhui.month - retour
    while mois <= 0:
        mois += 12
        annee -= 1
    return date(annee, mois, 1)


def variation(actuel, precedent):
                                                               
    if precedent == 0:
        return 100 if actuel > 0 else 0
    return round((actuel - precedent) / precedent * 100)


def construire_alertes():
                                                                           
    alertes = []
    en_attente = Reservation.objects.filter(statut="en_attente").count()
    if en_attente:
        alertes.append({"type": "info", "message": f"{en_attente} réservation(s) en attente de confirmation."})
    for voyage in Voyage.objects.filter(statut="presque_complet"):
        alertes.append({"type": "warning", "message": f"{voyage.titre} : plus que {voyage.places_disponibles} place(s)."})
    for voyage in Voyage.objects.filter(statut="complet", date_retour__gte=date.today()):
        alertes.append({"type": "danger", "message": f"{voyage.titre} est complet."})
    return alertes


class AlertesView(APIView):
    permission_classes = [IsAdminOrEmployee]

    def get(self, request):
        return Response(construire_alertes())


class StatsView(APIView):
                                                                           
    permission_classes = [IsAdminOrEmployee]

    def get(self, request):
        aujourdhui = date.today()


        mois_liste = [debut_du_mois(aujourdhui, i) for i in range(5, -1, -1)]
        par_mois = {(m.year, m.month): {"mois": MOIS[m.month - 1], "reservations": 0, "revenus": 0.0} for m in mois_liste}

        for r in Reservation.objects.all():
            jour = timezone.localtime(r.date_reservation).date()
            cle = (jour.year, jour.month)
            if cle not in par_mois:
                continue
            if r.statut != "annulee":
                par_mois[cle]["reservations"] += 1
            if r.statut == "confirmee":
                par_mois[cle]["revenus"] += float(r.prix_total)
        mensuel = list(par_mois.values())

        ce_mois, mois_prec = mensuel[-1], mensuel[-2]


        debut_mois = timezone.make_aware(datetime(aujourdhui.year, aujourdhui.month, 1))
        debut_prec_date = debut_du_mois(aujourdhui, 1)
        debut_prec = timezone.make_aware(datetime(debut_prec_date.year, debut_prec_date.month, 1))

        voyages_ce_mois = Voyage.objects.filter(date_creation__gte=debut_mois).count()
        voyages_prec = Voyage.objects.filter(date_creation__gte=debut_prec, date_creation__lt=debut_mois).count()
        clients_ce_mois = Client.objects.filter(date_creation__gte=debut_mois).count()
        clients_prec = Client.objects.filter(date_creation__gte=debut_prec, date_creation__lt=debut_mois).count()

        total_revenus = Reservation.objects.filter(statut="confirmee").aggregate(t=Sum("prix_total"))["t"] or 0

        cartes = {
            "voyages": {"total": Voyage.objects.count(), "variation": variation(voyages_ce_mois, voyages_prec)},
            "clients": {"total": Client.objects.count(), "variation": variation(clients_ce_mois, clients_prec)},
            "reservations": {"total": Reservation.objects.count(), "variation": variation(ce_mois["reservations"], mois_prec["reservations"])},
            "revenus": {"total": float(total_revenus), "variation": variation(ce_mois["revenus"], mois_prec["revenus"])},
        }


        populaires = (
            Voyage.objects
            .annotate(nb_reservations=Count("reservations", filter=~Q(reservations__statut="annulee")))
            .order_by("-nb_reservations")[:5]
        )
        populaires_data = [
            {"id": v.id, "titre": v.titre, "destination": v.destination, "nb_reservations": v.nb_reservations}
            for v in populaires
        ]


        occupation = []
        for v in Voyage.objects.filter(date_retour__gte=aujourdhui).order_by("places_disponibles"):
            taux = round((v.nombre_places - v.places_disponibles) / v.nombre_places * 100)
            if v.statut in ("presque_complet", "complet"):
                occupation.append({
                    "id": v.id, "titre": v.titre, "statut": v.statut,
                    "places_disponibles": v.places_disponibles,
                    "nombre_places": v.nombre_places, "taux": taux,
                })

        recentes = Reservation.objects.select_related("client", "voyage").order_by("-date_reservation")[:5]

        return Response({
            "cartes": cartes,
            "mensuel": mensuel,
            "voyages_populaires": populaires_data,
            "occupation": occupation,
            "reservations_recentes": ReservationSerializer(recentes, many=True).data,
            "alertes": construire_alertes(),
        })
