import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import { ROLES } from "../utils/format";
import Icon from "./Icon";


export default function Header({ title: titre, subtitle: sousTitre, onMenu: changerMenu }) {
  const { user: utilisateur } = useAuth();
  const { data: alertes } = useFetch("/dashboard/alertes/");
  const [ouvert, setOuvert] = useState(false);
  const liste = alertes || [];

  return (
    <header className="admin-header">
      <button className="menu-btn" onClick={changerMenu} aria-label="Ouvrir le menu">
        <Icon name="menu" size={22} />
      </button>

      <div className="admin-title">
        <h1>{titre}</h1>
        {sousTitre && <p>{sousTitre}</p>}
      </div>

      <div className="admin-header-right">
        <div className="notif">
          <button className="notif-btn" onClick={() => setOuvert(!ouvert)} aria-label="Notifications">
            <Icon name="cloche" size={19} />
            {liste.length > 0 && <span className="notif-count">{liste.length}</span>}
          </button>
          {ouvert && (
            <div className="notif-dropdown">
              <strong>Notifications</strong>
              {liste.length === 0 && <p className="muted">Rien à signaler.</p>}
              {liste.map((a, indice) => (
                <p key={indice} className={`notif-item notif-${a.type}`}>{a.message}</p>
              ))}
            </div>
          )}
        </div>

        <div className="profile-chip">
          <div className="avatar">{(utilisateur?.first_name?.[0] || utilisateur?.email?.[0] || "?").toUpperCase()}</div>
          <div className="profile-text">
            <strong>{utilisateur?.first_name} {utilisateur?.last_name}</strong>
            <span>{ROLES[utilisateur?.role]?.label}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
