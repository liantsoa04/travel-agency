// Configuration Axios centralisée : toutes les pages utilisent ce fichier.
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL: API_URL });

// 1) Avant chaque requête : on ajoute le token JWT s'il existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2) Si le token est expiré (erreur 401) : on demande un nouveau token avec le refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const refresh = localStorage.getItem("refresh");
    const estAuth = original?.url?.includes("/auth/");

    if (error.response?.status === 401 && !original._retry && refresh && !estAuth) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
        localStorage.setItem("access", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (e) {
        // Le refresh token est expiré aussi : on déconnecte
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Transforme une erreur Django en message lisible
export function getErrorMessage(error) {
  const data = error.response?.data;
  if (!data) return "Impossible de joindre le serveur. Vérifiez que le backend est lancé.";
  if (typeof data === "string") return "Une erreur est survenue. Veuillez réessayer.";
  if (data.detail) return data.detail;
  const messages = [];
  Object.values(data).forEach((valeur) => {
    if (Array.isArray(valeur)) messages.push(...valeur);
    else if (typeof valeur === "string") messages.push(valeur);
  });
  return messages.length ? messages.join(" ") : "Une erreur est survenue. Veuillez réessayer.";
}

// Pour les formulaires : renvoie { champ: "message" }
export function getFieldErrors(error) {
  const data = error.response?.data;
  const erreurs = {};
  if (data && typeof data === "object") {
    Object.entries(data).forEach(([champ, valeur]) => {
      erreurs[champ] = Array.isArray(valeur) ? valeur.join(" ") : String(valeur);
    });
  }
  return erreurs;
}

export default api;
