import { useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api";

// Charge des données depuis l'API et gère loading + erreur.
// Utilisation : const { data, loading, error, reload } = useFetch("/voyages/", { search: "paris" })
export default function useFetch(url, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // On retire les filtres vides pour ne pas les envoyer à l'API
  const propres = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined && v !== false)
  );
  const cle = JSON.stringify(propres);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(url, { params: JSON.parse(cle) });
      setData(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [url, cle]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
