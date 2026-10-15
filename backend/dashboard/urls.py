from django.urls import path
from .views import StatsView, AlertesView

urlpatterns = [
    path("stats/", StatsView.as_view()),
    path("alertes/", AlertesView.as_view()),
]
