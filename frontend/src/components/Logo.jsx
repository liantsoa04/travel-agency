import Icon from "./Icon";

// Logo de l'agence : un petit carré vert avec un avion + le nom.
// Le composant parent (Link, div...) garde la classe "logo".
export default function Logo({ suffixe = "Voyages" }) {
  return (
    <>
      <span className="logo-mark"><Icon name="avion" size={16} /></span>
      <span className="logo-text">Horizon <span>{suffixe}</span></span>
    </>
  );
}
