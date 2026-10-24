   
                                                    
                                                                                           
                                                                                                      
   
from datetime import date, datetime, time, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from clients.models import Client
from reservations.models import Reservation
from voyages.models import Voyage


def img(photo_id):
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=1000&q=70"


def mois_en_arriere(aujourdhui, retour):
    annee, mois = aujourdhui.year, aujourdhui.month - retour
    while mois <= 0:
        mois += 12
        annee -= 1
    return date(annee, mois, 1)


class Command(BaseCommand):
    help = "Crée des utilisateurs, clients, voyages et réservations de démonstration"

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Efface les données avant de recréer")

    def handle(self, *args, **options):
        if options["reset"]:
            Reservation.objects.all().delete()
            Voyage.objects.all().delete()
            Client.objects.all().delete()
            User.objects.filter(email__endswith="@agence.com").delete()
            self.stdout.write("Anciennes données supprimées.")
        elif Voyage.objects.exists():
            self.stdout.write(self.style.WARNING("Des voyages existent déjà. Utilisez --reset pour tout recréer."))
            return

        aujourdhui = date.today()


        def creer_user(email, mot_de_passe, prenom, nom, role, **extra):
            return User.objects.create_user(
                username=email, email=email, password=mot_de_passe,
                first_name=prenom, last_name=nom, role=role, **extra,
            )

        creer_user("admin@agence.com", "Admin123!", "Hery", "Rakoto", "admin", is_staff=True, is_superuser=True)
        creer_user("employe@agence.com", "Employe123!", "Miora", "Randria", "employe", is_staff=True)


        donnees_clients = [
            ("client@agence.com", "Sarah", "Rasoanaivo", "034 12 345 67", "Lot II A 12, Antananarivo"),
            ("tiana@agence.com", "Tiana", "Andrianina", "032 45 678 90", "Ambohimanarina, Antananarivo"),
            ("fidy@agence.com", "Fidy", "Rakotomalala", "033 98 765 43", "Mahamasina, Antananarivo"),
            ("lalao@agence.com", "Lalao", "Ravelo", "034 56 789 01", "Tamatave Centre"),
            ("hanta@agence.com", "Hanta", "Razafindrakoto", "032 11 223 34", "Antsirabe"),
            ("jean.dupont@example.com", "Jean", "Dupont", "+33 6 12 34 56 78", "12 rue des Lilas, Lyon"),
        ]
        clients = []
        for email, prenom, nom, tel, adresse in donnees_clients:
            user = None
            if email.endswith("@agence.com"):
                user = creer_user(email, "Client123!", prenom, nom, "client")
            clients.append(Client.objects.create(user=user, nom=nom, prenom=prenom, email=email, telephone=tel, adresse=adresse))


        def j(jours):
            return aujourdhui + timedelta(days=jours)

        donnees_voyages = [
            ("Nosy Be, l'île aux parfums", "Nosy Be", "Madagascar", "Nosy Be", "Sable blanc, eaux turquoise et couchers de soleil sur l'archipel. Excursion à Nosy Komba et Nosy Tanikely, snorkeling avec les tortues.", j(30), j(37), 890, 20, "plage", "1507525428034-b723cf961d3e"),
            ("Sainte-Marie, île des pirates", "Sainte-Marie", "Madagascar", "Ambodifotatra", "Observation des baleines à bosse, cimetière des pirates et plages sauvages bordées de cocotiers.", j(45), j(51), 750, 10, "plage", "1519046904884-53103b34b206"),
            ("Paris, la ville lumière", "Paris", "France", "Paris", "Tour Eiffel, Louvre, croisière sur la Seine et balade à Montmartre. Hôtel au cœur du Quartier latin.", j(60), j(67), 1200, 25, "culture", "1499856871958-5b9627545d1a"),
            ("Rome, l'histoire à ciel ouvert", "Rome", "Italie", "Rome", "Colisée, Forum romain, Vatican et fontaines. Dégustation de cuisine italienne chaque soir.", j(75), j(81), 1100, 18, "culture", "1552832230-c0197dd311b5"),
            ("Cape Town et la route des vins", "Cape Town", "Afrique du Sud", "Le Cap", "Montée de Table Mountain, cap de Bonne-Espérance, pingouins de Boulders Beach et vignobles de Stellenbosch.", j(90), j(99), 1650, 12, "aventure", "1469854523086-cc02fe5d8800"),
            ("Trek dans le massif de l'Isalo", "Isalo", "Madagascar", "Ranohira", "Canyons, piscines naturelles et lémuriens. Trois jours de randonnée avec guide et bivouac sous les étoiles.", j(20), j(24), 480, 15, "aventure", "1476514525535-07fb3b4ae5f1"),
            ("Maldives, escapade de luxe", "Maldives", "Maldives", "Malé", "Villa sur pilotis, dîners en bord de lagon, spa et sortie en mer privée.", j(120), j(127), 3200, 6, "luxe", "1506929562872-bb421503ef21"),
            ("Île Maurice en famille", "Île Maurice", "Maurice", "Grand Baie", "Hôtel club avec activités pour enfants, catamaran, visite de la réserve de Casela et plages sécurisées.", j(50), j(57), 1350, 16, "famille", "1519046904884-53103b34b206"),
            ("Marrakech, médina et désert", "Marrakech", "Maroc", "Marrakech", "Souks, jardins Majorelle et nuit dans le désert d'Agafay. Voyage déjà réalisé.", j(-40), j(-34), 680, 14, "culture", "1488646953014-85cb44e25828"),
        ]
        voyages = []
        for titre, destination, pays, ville, desc, depart, retour, prix, places, cat, photo in donnees_voyages:
            voyages.append(Voyage.objects.create(
                titre=titre, destination=destination, pays=pays, ville=ville, description=desc,
                date_depart=depart, date_retour=retour, prix=prix, nombre_places=places,
                categorie=cat, image=img(photo),
            ))


        reservations = [
            (0, 0, 2, "confirmee", 0), (1, 0, 3, "confirmee", 1), (2, 0, 4, "confirmee", 2),
            (3, 1, 4, "confirmee", 1), (4, 1, 3, "confirmee", 0), (5, 1, 2, "confirmee", 3),
            (0, 2, 2, "confirmee", 0), (1, 2, 4, "confirmee", 4), (2, 2, 3, "confirmee", 1),
            (3, 3, 2, "confirmee", 2), (4, 3, 3, "confirmee", 0), (5, 3, 2, "confirmee", 5),
            (0, 4, 4, "confirmee", 1), (1, 4, 2, "confirmee", 3),
            (2, 5, 3, "confirmee", 0), (3, 5, 2, "confirmee", 2),
            (4, 6, 3, "confirmee", 1), (5, 6, 3, "confirmee", 0),
            (0, 7, 2, "confirmee", 0), (1, 7, 3, "confirmee", 4),
            (2, 8, 2, "confirmee", 5), (3, 8, 4, "confirmee", 5),
            (4, 0, 2, "en_attente", 0), (5, 2, 2, "en_attente", 0), (0, 3, 3, "en_attente", 0),
            (1, 5, 2, "annulee", 2), (2, 7, 1, "annulee", 1),
        ]
        maintenant = timezone.now()
        for i, (c, v, nb, statut, retour) in enumerate(reservations):
            r = Reservation.objects.create(client=clients[c], voyage=voyages[v], nombre_personnes=nb)
            if statut == "confirmee":
                r.confirmer()
            elif statut == "annulee":
                r.annuler()

            debut = mois_en_arriere(aujourdhui, retour)
            decalage = i % 27
            if retour == 0:
                decalage = min(decalage, aujourdhui.day - 1)
            jour = debut + timedelta(days=decalage)
            moment = timezone.make_aware(datetime.combine(jour, time(10, 0)))
            Reservation.objects.filter(pk=r.pk).update(date_reservation=min(moment, maintenant))

        self.stdout.write(self.style.SUCCESS("Données de démonstration créées."))
        self.stdout.write("Admin    : admin@agence.com / Admin123!")
        self.stdout.write("Employé  : employe@agence.com / Employe123!")
        self.stdout.write("Client   : client@agence.com / Client123!")

