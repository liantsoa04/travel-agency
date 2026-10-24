export const formatPrix = (prix) =>
  `${Number(prix).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} Ar`;

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

export const formatDateCourte = (date) =>
  date ? new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "";

export const CATEGORIES = [
  { value: "plage", label: "Plage" },
  { value: "aventure", label: "Aventure" },
  { value: "culture", label: "Culture" },
  { value: "famille", label: "Famille" },
  { value: "luxe", label: "Luxe" },
];

export const STATUTS_VOYAGE = {
  disponible: { label: "Disponible", classe: "badge-green" },
  presque_complet: { label: "Presque complet", classe: "badge-orange" },
  complet: { label: "Complet", classe: "badge-red" },
  termine: { label: "Terminé", classe: "badge-grey" },
};

export const STATUTS_RESERVATION = {
  en_attente: { label: "En attente", classe: "badge-orange" },
  confirmee: { label: "Confirmée", classe: "badge-green" },
  annulee: { label: "Annulée", classe: "badge-red" },
};

export const ROLES = {
  admin: { label: "Admin", classe: "badge-green" },
  employe: { label: "Employé", classe: "badge-orange" },
  client: { label: "Client", classe: "badge-grey" },
};

export const categorieLabel = (valeur) => CATEGORIES.find((categorie) => categorie.value === valeur)?.label || valeur;
