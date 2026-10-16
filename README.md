# Horizon Voyages

Application de gestion d'une agence de voyage. Le backend est en Django (API REST avec authentification JWT) et la base de données est MySQL. Le frontend est en React (Vite).

Il y a deux espaces :

- **Admin / Employé** : tableau de bord, gestion des voyages, des clients et des réservations, statistiques.
- **Client** : liste des voyages avec recherche et filtres, réservation, suivi de ses réservations, profil.

## Technologies

- Backend : Python, Django, Django REST Framework, SimpleJWT, django-cors-headers, MySQL
- Frontend : React, Vite, React Router, Axios, Recharts

## Structure du projet

```text
travel-agency/
├── backend/
│   ├── config/         réglages et routes principales
│   ├── accounts/       utilisateurs, rôles, connexion, inscription
│   ├── voyages/        voyages et filtres
│   ├── clients/        clients et profil
│   ├── reservations/   réservations et règles de calcul
│   └── dashboard/      statistiques et données de test
└── frontend/
    └── src/            pages, composants, services, styles
```

## Fonctionnement

- Le prix total d'une réservation est calculé automatiquement : prix du voyage × nombre de personnes.
- Quand une réservation est confirmée, le nombre de places du voyage diminue. Si elle est annulée après confirmation, les places sont rendues.
- Le statut d'un voyage change tout seul : Disponible, Presque complet (20 % de places ou moins), Complet ou Terminé.
- Un client ne voit que ses propres réservations.

## Installation

### 1. Base de données

Installez MySQL (XAMPP) :

```sql
CREATE DATABASE travel_agency CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```



Créez ensuite un fichier `.env` dans le dossier `backend/` avec ces variables : `SECRET_KEY`, `DEBUG`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` et `DB_PORT`. Ce fichier n'est pas envoyé sur GitHub.

Si `mysqlclient` ne s'installe pas sous Windows, le projet utilise `pymysql` à la place (déjà configuré dans `config/__init__.py`).

Puis :

```bash
python manage.py migrate
python manage.py seed
python manage.py runserver
```

La commande `seed` ajoute des comptes de test, des voyages, des clients et des réservations, pour que le tableau de bord ne soit pas vide. Pour tout recréer : `python manage.py seed --reset`.

L'API est disponible sur http://127.0.0.1:8000/api/.

### 3. Frontend

Dans un deuxième terminal :

```bash
cd frontend
npm install
npm run dev
```

Le site s'ouvre sur http://localhost:5173.

## Comptes de test

| Rôle | E-mail | Mot de passe |
|------|--------|--------------|
| Admin | admin@agence.com | Admin123! |
| Employé | employe@agence.com | Employe123! |
| Client | client@agence.com | Client123! |

## Rôles et accès

| | Admin | Employé | Client |
|---|---|---|---|
| Tableau de bord et statistiques | oui | oui | non |
| Gérer voyages, clients, réservations | oui | oui | non |
| Gérer les utilisateurs | oui | non | non |
| Réserver et voir ses réservations | non | non | oui |

Les permissions côté Django sont dans `accounts/permissions.py`. Côté React, les pages sont protégées par `ProtectedRoute` et `AdminRoute`.

## API

Toutes les routes commencent par `/api` et demandent un token JWT (`Authorization: Bearer ...`), sauf celles marquées « public ».

| Route | Description |
|---|---|
| `POST /auth/login/` | Connexion (public) |
| `POST /auth/register/` | Inscription (public) |
| `POST /auth/refresh/` | Renouveler le token (public) |
| `GET /auth/me/` | Utilisateur connecté |
| `/auth/users/` | Gestion des utilisateurs (admin) |
| `/voyages/` | Liste publique avec filtres ; création, modification et suppression pour admin et employé |
| `GET /voyages/populaires/` | Les voyages les plus réservés (public) |
| `/clients/` | Gestion des clients (admin et employé) |
| `/clients/me/` | Profil du client connecté |
| `/reservations/` | Liste et création de réservations |
| `POST /reservations/<id>/confirmer/` | Confirmer une réservation (admin et employé) |
| `POST /reservations/<id>/annuler/` | Annuler une réservation |
| `GET /dashboard/stats/` | Statistiques du tableau de bord (admin et employé) |

## Validations

Le backend vérifie notamment que l'e-mail est valide et unique, que le prix et le nombre de places sont positifs, que la date de retour est après la date de départ, et qu'on ne peut pas réserver un voyage complet ou terminé. Le frontend refait les mêmes contrôles dans les formulaires.