from rest_framework import generics, viewsets, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsAdmin
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/  {email, password} -> {access, refresh, user}"""
    serializer_class = LoginSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ -> crée un compte client"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Compte créé avec succès."}, status=201)


class MeView(generics.RetrieveAPIView):
    """GET /api/auth/me/ -> informations de l'utilisateur connecté"""
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    """CRUD des utilisateurs : réservé à l'admin."""
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        role = self.request.query_params.get("role")
        if search:
            queryset = queryset.filter(email__icontains=search) | queryset.filter(first_name__icontains=search) | queryset.filter(last_name__icontains=search)
        if role:
            queryset = queryset.filter(role=role)
        return queryset.distinct()

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise ValidationError("Vous ne pouvez pas supprimer votre propre compte.")
        instance.delete()
