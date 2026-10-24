# Horizon Voyages

Application web de gestion d'une agence de voyages. Les clients peuvent découvrir des voyages et gérer leurs réservations ; le personnel peut administrer l'agence.

## Langages et technologies utilisés

- **Python** avec Django et Django REST Framework pour l'API.
- **JavaScript** avec React et Vite pour l'interface.
- **HTML** et **CSS** pour les pages et leur présentation.
- **MySQL** pour la base de données.
- React Router, Axios et Recharts pour la navigation, les appels API et les graphiques.
- JSON Web Token (JWT) pour l'authentification.

## Fonctionnalités

- Connexion et création de compte avec des rôles client, employé et administrateur.
- Consultation des voyages et recherche par destination, catégorie, prix ou date.
- Réservation de voyages, suivi et annulation des réservations.
- Tableau de bord, statistiques et graphiques pour le personnel.
- Gestion des voyages, des clients, des réservations et des utilisateurs selon les permissions.
- Pagination des tableaux, avec cinq lignes affichées par défaut.
- Prix affichés en ariary (Ar).
- Accès à la page de connexion à l'ouverture du site lorsqu'aucun utilisateur n'est connecté.

## Installation

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
```env
SECRET_KEY=remplacer-par-une-cle-secrete
DEBUG=True
DB_NAME=travel_agency
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```



```powershell
python manage.py migrate
python manage.py seed
python manage.py runserver
```

L'API est disponible à l'adresse `http://127.0.0.1:8000/api/`


```powershell
cd frontend
npm install
npm run dev
```

 `http://localhost:5173/`.

## Structure du projet

```text
travel-agency/
├── backend/
│   ├── accounts/       comptes, rôles et authentification
│   ├── clients/        gestion des clients et profils
│   ├── config/         configuration et routes Django
│   ├── dashboard/      données et statistiques du tableau de bord
│   ├── reservations/   réservations et règles associées
│   ├── voyages/        voyages et filtres
│   ├── manage.py       commandes Django
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── images/voyages/ photos locales utilisées par l'interface
│   ├── src/
│   │   ├── assets/     images et ressources
│   │   ├── components/ composants réutilisables
│   │   ├── context/    contexte d'authentification
│   │   ├── hooks/      hooks React
│   │   ├── layouts/    mises en page client et administration
│   │   ├── pages/      pages client, administration et connexion
│   │   ├── services/   appels à l'API
│   │   ├── styles/     feuilles de style
│   │   └── utils/      fonctions utilitaires
│   ├── index.html
│   └── package.json
└── README.md
```
