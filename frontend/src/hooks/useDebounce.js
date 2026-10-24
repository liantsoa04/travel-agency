import { useEffect, useState } from "react";

export default function useDebounce(valeur, delai = 400) {
  const [valeurStabilisee, setDebouncedValue] = useState(valeur);

  useEffect(() => {
    const minuteur = setTimeout(() => {
      setDebouncedValue(valeur);
    }, delai);

    return () => clearTimeout(minuteur);
  }, [valeur, delai]);

  return valeurStabilisee;
}
