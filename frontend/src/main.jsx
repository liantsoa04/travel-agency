import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Les styles sont chargés dans cet ordre (du plus général au plus précis)
import "./styles/variables.css";   // couleurs, polices, arrondis
import "./styles/base.css";        // réglages de base + logo
import "./styles/components.css";  // boutons, formulaires, badges, modales...
import "./styles/auth.css";        // connexion / inscription
import "./styles/client.css";      // espace client
import "./styles/voyages.css";     // cartes de voyages + filtres
import "./styles/admin.css";       // espace admin
import "./styles/dashboard.css";   // dashboard + statistiques

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
