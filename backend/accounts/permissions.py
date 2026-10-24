from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
                                    
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == "admin")


class IsAdminOrEmployee(BasePermission):
                                                      
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role in ("admin", "employe"))


class IsStaffOrReadOnly(BasePermission):
                                                                   
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and user.role in ("admin", "employe"))
