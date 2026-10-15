import Icon from "./Icon";

// Carte statistique du dashboard
// icon = nom d'une icône de Icon.jsx ; color = "green" | "orange" | "sand"
export default function StatCard({ label, value, variation, icon, color = "green" }) {
  const positif = variation >= 0;
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-top">
        <p className="stat-label">{label}</p>
        <div className="stat-icon"><Icon name={icon} size={20} /></div>
      </div>
      <p className="stat-value">{value}</p>
      {variation !== undefined && (
        <p className={`stat-variation ${positif ? "up" : "down"}`}>
          <Icon name={positif ? "hausse" : "baisse"} size={14} />
          {positif ? "+" : ""}{variation}% <span>vs mois dernier</span>
        </p>
      )}
    </div>
  );
}
