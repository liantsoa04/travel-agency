import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

// Style commun des infobulles des graphiques
const STYLE_TOOLTIP = { borderRadius: 10, border: "1px solid #e6dcc7", boxShadow: "0 4px 14px rgba(40, 30, 10, 0.12)" };

// Graphique : réservations par mois
export function ReservationsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ece3d0" />
        <XAxis dataKey="mois" stroke="#6b6254" tick={{ fontSize: 11 }} tickMargin={6} />
        <YAxis allowDecimals={false} stroke="#6b6254" tick={{ fontSize: 11 }} width={38} />
        <Tooltip contentStyle={STYLE_TOOLTIP} cursor={{ fill: "rgba(47, 107, 79, 0.06)" }} />
        <Bar dataKey="reservations" name="Réservations" fill="#2f6b4f" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Graphique : revenus par mois
export function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 6, right: 6, left: -4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ece3d0" />
        <XAxis dataKey="mois" stroke="#6b6254" tick={{ fontSize: 11 }} tickMargin={6} />
        <YAxis stroke="#6b6254" tick={{ fontSize: 11 }} width={42} />
        <Tooltip contentStyle={STYLE_TOOLTIP} formatter={(v) => `${Number(v).toLocaleString("fr-FR")} €`} />
        <Line type="monotone" dataKey="revenus" name="Revenus" stroke="#e07a2f" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
