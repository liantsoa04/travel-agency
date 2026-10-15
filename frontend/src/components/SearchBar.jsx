import Icon from "./Icon";

export default function SearchBar({ value, onChange, placeholder = "Rechercher..." }) {
  return (
    <div className="searchbar">
      <Icon name="recherche" size={18} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
