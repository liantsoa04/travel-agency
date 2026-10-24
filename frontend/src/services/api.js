
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({ baseURL: API_URL });


api.interceptors.request.use((configuration) => {
  const jeton = localStorage.getItem("access");
  if (jeton) configuration.headers.Authorization = `Bearer ${jeton}`;
  return configuration;
});


api.interceptors.response.use(
  (reponse) => reponse,
  async (erreurApi) => {
    const requeteOriginale = erreurApi.config;
    const jetonActualisation = localStorage.getItem("refresh");
    const estAuth = requeteOriginale?.url?.includes("/auth/");

    if (erreurApi.response?.status === 401 && !requeteOriginale._retry && jetonActualisation && !estAuth) {
      requeteOriginale._retry = true;
      try {
        const { data: donnees } = await axios.post(`${API_URL}/auth/refresh/`, { refresh: jetonActualisation });
        localStorage.setItem("access", donnees.access);
        requeteOriginale.headers.Authorization = `Bearer ${donnees.access}`;
        return api(requeteOriginale);
      } catch (evenement) {

        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(erreurApi);
  }
);


export function getErrorMessage(erreurApi) {
  const donnees = erreurApi.response?.data;
  if (!donnees) return "Impossible de joindre le serveur. Vérifiez que le backend est lancé.";
  if (typeof donnees === "string") return "Une erreur est survenue. Veuillez réessayer.";
  if (donnees.detail) return donnees.detail;
  const messagesErreur = [];
  Object.values(donnees).forEach((valeur) => {
    if (Array.isArray(valeur)) messagesErreur.push(...valeur);
    else if (typeof valeur === "string") messagesErreur.push(valeur);
  });
  return messagesErreur.length ? messagesErreur.join(" ") : "Une erreur est survenue. Veuillez réessayer.";
}


export function getFieldErrors(erreurApi) {
  const donnees = erreurApi.response?.data;
  const erreurs = {};
  if (donnees && typeof donnees === "object") {
    Object.entries(donnees).forEach(([champ, valeur]) => {
      erreurs[champ] = Array.isArray(valeur) ? valeur.join(" ") : String(valeur);
    });
  }
  return erreurs;
}

export default api;
