import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import VoyageCard from "../../components/VoyageCard";
import SmartImage from "../../components/SmartImage";
import Icon from "../../components/Icon";
import { Loader, ErrorState } from "../../components/States";

const AVANTAGES = [
  { icon: "globe", titre: "Destinations variées", texte: "Plages de Madagascar, villes d'art, treks et séjours de luxe." },
  { icon: "reservation", titre: "Réservation simple", texte: "Choisissez, indiquez le nombre de voyageurs, c'est réservé." },
  { icon: "support", titre: "Accompagnement", texte: "Notre équipe confirme votre réservation et reste joignable." },
  { icon: "etiquette", titre: "Offres adaptées", texte: "Famille, aventure, culture : un voyage pour chaque budget." },
];

export default function Home() {
  const navigate = useNavigate();
  const [recherche, setRecherche] = useState("");
  const { data, loading, error, reload } = useFetch("/voyages/populaires/");

  const rechercher = (e) => {
    e.preventDefault();
    navigate(`/voyages?search=${encodeURIComponent(recherche)}`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-content">
          <h1>Partez là où le sable est chaud et la route longue.</h1>
          <p>De Nosy Be au Cap, de Rome à Paris : des voyages organisés, des places comptées, une réservation en deux minutes.</p>
          <form className="hero-search" onSubmit={rechercher}>
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Destination, pays ou ville..."
              aria-label="Rechercher une destination"
            />
            <button className="btn btn-accent">Rechercher</button>
          </form>
          <Link to="/voyages" className="btn btn-light">Découvrir les voyages</Link>
        </div>
      </section>

      {loading ? <Loader /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          {/* DESTINATIONS POPULAIRES */}
          <section className="section container">
            <h2 className="section-title">Destinations populaires</h2>
            <div className="dest-grid">
              {data.slice(0, 4).map((v) => (
                <Link key={v.id} to={`/voyages/${v.id}`} className="dest-card">
                  <SmartImage src={v.image} alt={v.destination} />
                  <div className="dest-overlay">
                    <strong>{v.destination}</strong>
                    <span>{v.pays}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* VOYAGES POPULAIRES */}
          <section className="section section-sand">
            <div className="container">
              <h2 className="section-title">Voyages populaires</h2>
              <div className="voyage-grid">
                {data.slice(0, 6).map((v) => <VoyageCard key={v.id} voyage={v} />)}
              </div>
            </div>
          </section>
        </>
      )}

      {/* POURQUOI NOUS CHOISIR */}
      <section className="section container">
        <h2 className="section-title">Pourquoi nous choisir ?</h2>
        <div className="why-grid">
          {AVANTAGES.map((a) => (
            <div key={a.titre} className="why-item">
              <span className="why-icon"><Icon name={a.icon} size={22} /></span>
              <h3>{a.titre}</h3>
              <p>{a.texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <h2>Votre prochain voyage est à quelques clics.</h2>
          <p>Parcourez tous nos départs et trouvez celui qui vous ressemble.</p>
          <Link to="/voyages" className="btn btn-light">Voir tous les voyages</Link>
        </div>
      </section>
    </div>
  );
}
