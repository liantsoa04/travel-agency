import { useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api";

export default function useFetch(url, parametres = {}) {
  const [donnees, definirDonnees] = useState(null);
  const [chargement, definirChargement] = useState(true);
  const [erreurApi, definirErreur] = useState("");

  const filtresActifs = Object.fromEntries(
    Object.entries(parametres).filter(([, voyage]) => voyage !== "" && voyage !== null && voyage !== undefined && voyage !== false)
  );
  const filtresEnTexte = JSON.stringify(filtresActifs);

  const chargerDonnees = useCallback(async () => {
    definirChargement(true);
    definirErreur("");

    try {
      const reponse = await api.get(url, {
        params: JSON.parse(filtresEnTexte),
      });
      definirDonnees(reponse.data);
    } catch (erreurApi) {
      definirErreur(getErrorMessage(erreurApi));
    } finally {
      definirChargement(false);
    }
  }, [url, filtresEnTexte]);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  return { data: donnees, loading: chargement, error: erreurApi, reload: chargerDonnees };
}
