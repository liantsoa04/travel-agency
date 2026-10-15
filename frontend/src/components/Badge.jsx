export default function Badge({ info }) {
  if (!info) return null;
  return <span className={`badge ${info.classe}`}>{info.label}</span>;
}
