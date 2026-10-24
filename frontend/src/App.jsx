import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import ClientLayout from "./layouts/ClientLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/admin/Dashboard";
import AdminVoyages from "./pages/admin/Voyages";
import AdminReservations from "./pages/admin/Reservations";
import AdminClients from "./pages/admin/Clients";
import Users from "./pages/admin/Users";
import Statistiques from "./pages/admin/Statistiques";
import Parametres from "./pages/admin/Parametres";

import Home from "./pages/client/Home";
import Voyages from "./pages/client/Voyages";
import VoyageDetails from "./pages/client/VoyageDetails";
import Reservation from "./pages/client/Reservation";
import MyReservations from "./pages/client/MyReservations";
import Profile from "./pages/client/Profile";

export default function App() {
  const { user: utilisateur } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ClientLayout />}>
        <Route path="/" element={utilisateur ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/voyages" element={<Voyages />} />
        <Route path="/voyages/:id" element={<VoyageDetails />} />
        <Route path="/voyages/:id/reserver" element={<ProtectedRoute clientOnly><Reservation /></ProtectedRoute>} />
        <Route path="/mes-reservations" element={<ProtectedRoute clientOnly><MyReservations /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute clientOnly><Profile /></ProtectedRoute>} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="voyages" element={<AdminVoyages />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="utilisateurs" element={<AdminRoute adminOnly><Users /></AdminRoute>} />
        <Route path="statistiques" element={<Statistiques />} />
        <Route path="parametres" element={<Parametres />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
