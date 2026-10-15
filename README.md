# 🌴 Horizon Voyages — Gestion d'une agence de voyage

Application web complète : **backend Django REST + MySQL + JWT**, **frontend React (Vite)**.
Deux espaces distincts : **Admin / Employé** (gestion et statistiques) et **Client** (découverte et réservation).

## 1. Fonctionnalités

**Espace Admin / Employé** : dashboard (cartes, graphiques, voyages populaires, réservations récentes, alertes), CRUD voyages / clients, gestion des réservations (confirmer, annuler), statistiques, gestion des utilisateurs (admin seulement), paramètres.

**Espace Client** : accueil, liste des voyages avec recherche et filtres, détail d'un voyage, réservation avec prix calculé, « Mes réservations » (annulation possible), « Mon profil ».

**Fonctionnalités un peu avancées (simples à expliquer)**
1. Prix total automatique : `prix du voyage × nombre de personnes` (`reservations/models.py`, méthode `save`).
2. Places automatiques : confirmer une réservation **diminue** les places, annuler une réservation confirmée **les rend** (méthodes `confirmer` et `annuler`).
3. Statut du voyage automatique : Disponible / Presque complet (20 % de places ou moins) / Complet / Terminé (`voyages/models.py`, méthode `calculer_statut`).
4. Voyages populaires : comptage des réservations non annulées (`/api/voyages/populaires/`).
5. Dashboard calculé automatiquement (`dashboard/views.py`).
6. Recherche et filtres : destination, pays, ville, catégorie, prix min/max, date, disponibilité.

## 2. Technologies

Python, Django, Django REST Framework, MySQL, JWT (`djangorestframework-simplejwt`), `django-cors-headers` — React, Vite, React Router, Axios, CSS, Recharts.

## 3. Architecture

```text
travel-agency/
├── backend/
│   ├── manage.py, requirements.txt, .env.example
│   ├── config/        settings.py, urls.py ...
│   ├── accounts/      utilisateur + rôles, login JWT, inscription
│   ├── voyages/       modèle Voyage + API + filtres
│   ├── clients/       modèle Client + API + profil
│   ├── reservations/  modèle Reservation + règles métier
│   └── dashboard/     statistiques + commande « seed » (données de test)
├── frontend/
│   └── src/ components, pages (auth, admin, client), layouts, services, context, hooks, utils, styles
└── README.md
```

## 4. Installation de MySQL et création de la base

1. Installez MySQL (ou XAMPP / WAMP) et démarrez le serveur MySQL.
2. Ouvrez phpMyAdmin ou le terminal MySQL (`mysql -u root -p`) et exécutez :

```sql
CREATE DATABASE travel_agency CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 5. Backend Django

```bash
cd backend
python -m venv venv
```

Activer l'environnement : **Windows** `venv\Scripts\activate` — **Mac/Linux** `source venv/bin/activate`

```bash
pip install -r requirements.txt
```

> Si `mysqlclient` ne s'installe pas sous Windows : `pip install pymysql`, puis ajoutez en haut de `config/__init__.py` :
> ```python
> import pymysql
> pymysql.install_as_MySQLdb()
> ```

### Fichier `.env`

Copiez `.env.example` en `.env` (dans `backend/`) et adaptez :

```env
SECRET_KEY=mettez_une_longue_phrase_secrete_ici
DEBUG=True

DB_NAME=travel_agency
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_HOST=localhost
DB_PORT=3306
```

### Migrations et données de test

```bash
python manage.py makemigrations accounts clients voyages reservations
python manage.py migrate
python manage.py seed
```

`seed` crée les comptes de test, 9 voyages, 6 clients et 27 réservations (pour que le dashboard soit déjà rempli). Pour tout recréer : `python manage.py seed --reset`.

### Créer un administrateur (optionnel)

Les comptes de test existent déjà (voir plus bas). Pour créer votre propre admin :

```bash
python manage.py createsuperuser
```

(Il demande un e-mail, un nom d'utilisateur et un mot de passe. Il aura automatiquement le rôle **admin**.)

### Lancer le backend

```bash
python manage.py runserver
```

API : http://127.0.0.1:8000/api/ — Admin Django : http://127.0.0.1:8000/admin/

## 6. Frontend React

```bash
cd frontend
npm install
npm run dev
```

Le fichier `frontend/.env` contient déjà :

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Ouvrez http://localhost:5173

## 7. Lancement quotidien (2 terminaux)

Terminal 1 :
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```
Terminal 2 :
```bash
cd frontend
npm run dev
```

## 8. Comptes de test

| Rôle | E-mail | Mot de passe | Redirigé vers |
|------|--------|--------------|---------------|
| Admin | admin@agence.com | Admin123! | /admin |
| Employé | employe@agence.com | Employe123! | /admin |
| Client | client@agence.com | Client123! | / (espace client) |

Les autres clients de test (tiana@, fidy@, lalao@, hanta@agence.com) ont le mot de passe `Client123!`.

## 9. URLs de l'application

| Page | URL |
|------|-----|
| Accueil client | http://localhost:5173/ |
| Voyages | http://localhost:5173/voyages |
| Connexion / Inscription | /login — /register |
| Mes réservations / Profil | /mes-reservations — /profil |
| Dashboard admin | /admin |
| Voyages, Réservations, Clients, Utilisateurs, Statistiques, Paramètres | /admin/voyages, /admin/reservations, /admin/clients, /admin/utilisateurs, /admin/statistiques, /admin/parametres |

## 10. Les rôles

| | Admin | Employé | Client |
|---|---|---|---|
| Dashboard, statistiques | ✅ | ✅ | ❌ |
| Voyages / clients / réservations (gestion) | ✅ | ✅ | ❌ |
| Gérer les utilisateurs | ✅ | ❌ | ❌ |
| Réserver, voir ses réservations, son profil | — | — | ✅ |

- **Côté Django** : les permissions sont dans `accounts/permissions.py` (`IsAdmin`, `IsAdminOrEmployee`, `IsStaffOrReadOnly`). Un client qui appelle l'API admin reçoit une erreur 403, et ne voit que **ses** réservations.
- **Côté React** : `ProtectedRoute` (connecté ?) et `AdminRoute` (rôle admin / employé ?) protègent les pages.

## 11. Authentification JWT (en simple)

```text
Login (e-mail + mot de passe)
   ↓
Django vérifie
   ↓
Access token (2 h) + Refresh token (7 jours) + infos utilisateur (dont le rôle)
   ↓
React les garde dans localStorage
   ↓
Axios ajoute « Authorization: Bearer <token> » à chaque requête (services/api.js)
   ↓
Si le token a expiré (401) : Axios utilise le refresh token pour en obtenir un nouveau
```

## 12. CORS

Dans `config/settings.py` : `corsheaders` dans `INSTALLED_APPS`, `CorsMiddleware` **en premier** dans `MIDDLEWARE`, et `CORS_ALLOWED_ORIGINS` autorise `http://localhost:5173`. Sans cela, le navigateur bloquerait les appels de React vers Django.

## 13. API REST

Préfixe : `/api`. Toutes les routes demandent un token JWT (`Authorization: Bearer ...`) sauf mention contraire.

### Authentification — `/api/auth/`
| Méthode | URL | Rôle | Données envoyées | Réponse |
|---|---|---|---|---|
| POST | `/auth/login/` | Public | `email`, `password` | `access`, `refresh`, `user` |
| POST | `/auth/refresh/` | Public | `refresh` | nouveau `access` |
| POST | `/auth/register/` | Public | `first_name`, `last_name`, `email`, `password`, `telephone`, `adresse` | message de succès |
| GET | `/auth/me/` | Connecté | — | infos de l'utilisateur |
| GET/POST | `/auth/users/` | Admin | `email`, `first_name`, `last_name`, `role`, `password` | liste / utilisateur créé |
| PATCH/DELETE | `/auth/users/<id>/` | Admin | champs à modifier | utilisateur / 204 |

### Voyages — `/api/voyages/`
| Méthode | URL | Rôle | Données | Réponse |
|---|---|---|---|---|
| GET | `/voyages/` | Public | filtres : `search`, `categorie`, `statut`, `prix_min`, `prix_max`, `date`, `disponible=true` | liste |
| GET | `/voyages/<id>/` | Public | — | un voyage |
| GET | `/voyages/populaires/` | Public | — | 6 voyages les plus réservés |
| POST | `/voyages/` | Admin / Employé | `titre`, `destination`, `pays`, `ville`, `description`, `date_depart`, `date_retour`, `prix`, `nombre_places`, `categorie`, `image` | voyage créé |
| PUT/PATCH | `/voyages/<id>/` | Admin / Employé | mêmes champs | voyage modifié |
| DELETE | `/voyages/<id>/` | Admin / Employé | — | 204 |

### Clients — `/api/clients/`
| Méthode | URL | Rôle | Données | Réponse |
|---|---|---|---|---|
| GET | `/clients/?search=` | Admin / Employé | — | liste (avec nombre de réservations) |
| POST | `/clients/` | Admin / Employé | `nom`, `prenom`, `email`, `telephone`, `adresse` | client créé |
| PUT/PATCH/DELETE | `/clients/<id>/` | Admin / Employé | champs | client / 204 |
| GET | `/clients/<id>/reservations/` | Admin / Employé | — | réservations du client |
| GET/PATCH | `/clients/me/` | Client | `prenom`, `nom`, `telephone`, `adresse` | profil du client connecté |

### Réservations — `/api/reservations/`
| Méthode | URL | Rôle | Données | Réponse |
|---|---|---|---|---|
| GET | `/reservations/` | Tous | filtres : `search`, `statut`, `voyage` | tout pour le personnel, **seulement les siennes** pour un client |
| POST | `/reservations/` | Tous | `voyage`, `nombre_personnes` (+ `client` si c'est le personnel) | réservation « en attente » |
| POST | `/reservations/<id>/confirmer/` | Admin / Employé | — | réservation confirmée, places diminuées |
| POST | `/reservations/<id>/annuler/` | Propriétaire ou personnel | — | réservation annulée (places rendues si elle était confirmée) |
| DELETE | `/reservations/<id>/` | Admin / Employé | — | 204 |

### Dashboard — `/api/dashboard/` (Admin / Employé)
| Méthode | URL | Réponse |
|---|---|---|
| GET | `/dashboard/stats/` | cartes (avec % d'évolution), données mensuelles, voyages populaires, occupation, réservations récentes, alertes |
| GET | `/dashboard/alertes/` | liste d'alertes (cloche de notifications) |

## 14. Validations

Backend (`serializers.py`) : e-mail valide et unique, prix > 0, places > 0, date de retour > date de départ, nombre de personnes ≥ 1, réservation impossible si le voyage est complet ou terminé, message « Nombre de places disponibles insuffisant. » si trop de personnes.
Frontend : mêmes contrôles dans les formulaires, avec messages sous les champs.

## 15. Remarques utiles

- Les images des voyages sont des **liens (URL)**. Dans les données de test, ce sont des photos Unsplash (internet requis). Si une image ne charge pas, un fond de remplacement s'affiche.
- Une réservation faite par un client est **« En attente »** : elle ne retire des places qu'une fois **confirmée** par l'admin / l'employé.
- Supprimer un voyage ou un client supprime aussi ses réservations (message de confirmation affiché avant).
- Le statut « Terminé » d'un voyage est recalculé à chaque enregistrement du voyage.
