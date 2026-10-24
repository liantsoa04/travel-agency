import { useState } from "react";
import imageParDefaut from "../assets/voyage-placeholder.svg";

const photosLocales = new Set([
  "1507525428034-b723cf961d3e",
  "1519046904884-53103b34b206",
  "1499856871958-5b9627545d1a",
  "1552832230-c0197dd311b5",
  "1469854523086-cc02fe5d8800",
  "1476514525535-07fb3b4ae5f1",
  "1506929562872-bb421503ef21",
  "1488646953014-85cb44e25828",
]);

export default function SmartImage({ src: sourceImage, alt: texteAlternatif, className: classeCss = "" }) {
  const [urlEnErreur, setUrlEnErreur] = useState("");
  const identifiantPhoto = sourceImage?.match(/\/photo-([A-Za-z0-9-]+)/)?.[1];
  const imageLocale = identifiantPhoto && photosLocales.has(identifiantPhoto)
    ? `${import.meta.env.BASE_URL}images/voyages/${identifiantPhoto}.jpg`
    : sourceImage;
  const afficherPhoto = Boolean(imageLocale) && urlEnErreur !== imageLocale;

  return (
    <img
      src={afficherPhoto ? imageLocale : imageParDefaut}
      alt={afficherPhoto ? texteAlternatif : "Illustration de voyage"}
      className={afficherPhoto ? classeCss : `img-fallback ${classeCss}`}
      loading="lazy"
      onError={afficherPhoto ? () => setUrlEnErreur(imageLocale) : undefined}
    />
  );
}
