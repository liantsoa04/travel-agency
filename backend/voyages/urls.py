from rest_framework.routers import DefaultRouter
from .views import VoyageViewSet

router = DefaultRouter()
router.register("", VoyageViewSet, basename="voyages")

urlpatterns = router.urls
