import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// Quel est l'espace de chaque rôle ?
export function homePathFor(user) {
  if (!user) return "/login";
  return user.role === "client" ? "/" : "/admin";
}

export function AuthProvider({ children }) {
  // On relit l'utilisateur sauvegardé pour rester connecté après un rechargement
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const isStaff = user?.role === "admin" || user?.role === "employe";

  async function login(email, password) {
    const { data } = await api.post("/auth/login/", { email, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(form) {
    await api.post("/auth/register/", form);
    return login(form.email, form.password);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  function updateUser(changes) {
    const updated = { ...user, ...changes };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, isStaff, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
