import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


const PAGES = {
  "/admin": { titre: "Tableau de bord", description: "Vue d'ensemble de l'activité de l'agence." },
  "/admin/voyages": { titre: "Gestion des voyages", description: "Créez, modifiez et suivez les départs proposés." },
  "/admin/reservations": { titre: "Gestion des réservations", description: "Confirmez ou annulez les demandes des clients." },
  "/admin/clients": { titre: "Gestion des clients", description: "Retrouvez et mettez à jour les fiches clients." },
  "/admin/utilisateurs": { titre: "Gestion des utilisateurs", description: "Gérez les comptes et les rôles de l'équipe." },
  "/admin/statistiques": { titre: "Statistiques", description: "Analysez les réservations et les revenus." },
  "/admin/parametres": { titre: "Paramètres", description: "Votre compte et les droits selon les rôles." },
};

export default function AdminLayout() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { pathname } = useLocation();
  const numeroPage = PAGES[pathname] || { titre: "Administration" };

  return (
    <div className="admin-shell">
      <Sidebar open={menuOuvert} onClose={() => setMenuOuvert(false)} />
      <div className="admin-main">
        <Header title={numeroPage.titre} subtitle={numeroPage.description} onMenu={() => setMenuOuvert(true)} />
        <main className="admin-content">
          <Outlet />   {                                   }
        </main>
      </div>
    </div>
  );
}
