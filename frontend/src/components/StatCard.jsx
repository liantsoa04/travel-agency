import Icon from "./Icon";



export default function StatCard({ label: libelle, value: valeur, variation, icon: icone, couleur = "green" }) {
  const positif = variation >= 0;
  return (
    <div className={`stat-card stat-${couleur}`}>
      <div className="stat-top">
        <p className="stat-label">{libelle}</p>
        <div className="stat-icon"><Icon name={icone} size={20} /></div>
      </div>
      <p className="stat-value">{valeur}</p>
      {variation !== undefined && (
        <p className={`stat-variation ${positif ? "up" : "down"}`}>
          <Icon name={positif ? "hausse" : "baisse"} size={14} />
          {positif ? "+" : ""}{variation}% <span>vs mois dernier</span>
        </p>
      )}
    </div>
  );
}
