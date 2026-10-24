import Icon from "./Icon";



export default function Logo({ suffixe = "Voyages" }) {
  return (
    <>
      <span className="logo-mark"><Icon name="avion" size={16} /></span>
      <span className="logo-text">Horizon <span>{suffixe}</span></span>
    </>
  );
}
