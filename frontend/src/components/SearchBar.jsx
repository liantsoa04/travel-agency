import Icon from "./Icon";

export default function SearchBar({ value: valeur, onChange: changerValeur, placeholder = "Rechercher..." }) {
  return (
    <div className="searchbar">
      <Icon name="recherche" size={18} />
      <input
        type="search"
        value={valeur}
        onChange={(evenement) => changerValeur(evenement.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
