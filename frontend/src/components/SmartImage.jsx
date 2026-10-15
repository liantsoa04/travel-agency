import { useState } from "react";
import Icon from "./Icon";

// Affiche une image ; si le lien est cassé ou vide, affiche un fond dégradé à la place.
export default function SmartImage({ src, alt, className = "" }) {
  const [erreur, setErreur] = useState(false);
  if (!src || erreur) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt}>
        <Icon name="image" size={32} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setErreur(true)} />;
}
