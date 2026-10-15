"""Les grandes routes du projet. Chaque application a ensuite ses propres urls.py."""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),               # interface d'administration Django
    path("api/auth/", include("accounts.urls")),   # login, register, utilisateurs
    path("api/voyages/", include("voyages.urls")),
    path("api/clients/", include("clients.urls")),
    path("api/reservations/", include("reservations.urls")),
    path("api/dashboard/", include("dashboard.urls")),
]

# En développement, Django sert aussi les fichiers du dossier media/
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
