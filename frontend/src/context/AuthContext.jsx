import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function homePathFor(utilisateur) {
  if (!utilisateur) return "/login";
  return utilisateur.role === "client" ? "/" : "/admin";
}

export function AuthProvider({ children: contenu }) {
  const [utilisateur, definirUtilisateur] = useState(() => {
    const utilisateurEnregistre = localStorage.getItem("user");
    return utilisateurEnregistre ? JSON.parse(utilisateurEnregistre) : null;
  });

  const estPersonnel = utilisateur?.role === "admin" || utilisateur?.role === "employe";

  async function login(adresseCourriel, motDePasse) {
    const { data: donnees } = await api.post("/auth/login/", { email: adresseCourriel, password: motDePasse });
    localStorage.setItem("access", donnees.access);
    localStorage.setItem("refresh", donnees.refresh);
    localStorage.setItem("user", JSON.stringify(donnees.user));
    definirUtilisateur(donnees.user);
    return donnees.user;
  }

  async function register(formulaire) {
    await api.post("/auth/register/", formulaire);
    return login(formulaire.email, formulaire.password);
  }

  function logout() {
    localStorage.clear();
    definirUtilisateur(null);
  }

  function updateUser(modifications) {
    const utilisateurModifie = { ...utilisateur, ...modifications };
    localStorage.setItem("user", JSON.stringify(utilisateurModifie));
    definirUtilisateur(utilisateurModifie);
  }

  return (
    <AuthContext.Provider value={{ user: utilisateur, isStaff: estPersonnel, login, register, logout, updateUser }}>
      {contenu}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
