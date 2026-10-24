import { useEffect, useState } from "react";

export function usePagination(elements, cleReinitialisation = "") {
  const [numeroPage, definirNumeroPage] = useState(1);
  const [lignesParPage, definirLignesParPage] = useState(5);
  const nombrePages = Math.max(1, Math.ceil(elements.length / lignesParPage));
  const pageActuelle = Math.min(numeroPage, nombrePages);
  const indexDebut = (pageActuelle - 1) * lignesParPage;

  useEffect(() => {
    definirNumeroPage(1);
  }, [cleReinitialisation]);

  useEffect(() => {
    if (numeroPage > nombrePages) definirNumeroPage(nombrePages);
  }, [numeroPage, nombrePages]);

  return {
    items: elements.slice(indexDebut, indexDebut + lignesParPage),
    page: pageActuelle,
    pageSize: lignesParPage,
    pageCount: nombrePages,
    start: elements.length === 0 ? 0 : indexDebut + 1,
    end: Math.min(indexDebut + lignesParPage, elements.length),
    setPage: definirNumeroPage,
    setPageSize: (nouvelleTaille) => {
      definirLignesParPage(Number(nouvelleTaille));
      definirNumeroPage(1);
    },
  };
}

export function Pagination({
  count: nombreElements,
  start: debut,
  end: fin,
  page: pageActuelle,
  pageCount: nombrePages,
  pageSize: lignesParPage,
  onPageChange: changerPage,
  onPageSizeChange: changerTaillePage,
}) {
  if (nombreElements === 0) return null;

  let premierePage = Math.max(1, pageActuelle - 2);
  let dernierePage = Math.min(nombrePages, premierePage + 4);
  premierePage = Math.max(1, dernierePage - 4);
  const numerosPages = Array.from({ length: dernierePage - premierePage + 1 }, (_, indice) => premierePage + indice);

  return (
    <nav className="pagination" aria-label="Pagination du tableau">
      <p className="pagination-summary">Affichage de {debut} à {fin} sur {nombreElements} éléments</p>
      <div className="pagination-controls">
        <label className="pagination-size">
          Lignes
          <select value={lignesParPage} onChange={(evenement) => changerTaillePage(evenement.target.value)} aria-label="Nombre de lignes par page">
            {[5, 10, 25, 50].map((taille) => <option key={taille} value={taille}>{taille}</option>)}
          </select>
        </label>
        <button type="button" className="pagination-button" onClick={() => changerPage(pageActuelle - 1)} disabled={pageActuelle === 1}>
          Précédent
        </button>
        {premierePage > 1 && <>
          <button type="button" className="pagination-button" onClick={() => changerPage(1)}>1</button>
          {premierePage > 2 && <span className="pagination-ellipsis" aria-hidden="true">…</span>}
        </>}
        {numerosPages.map((numero) => (
          <button
            type="button"
            key={numero}
            className={`pagination-button${numero === pageActuelle ? " active" : ""}`}
            onClick={() => changerPage(numero)}
            aria-current={numero === pageActuelle ? "page" : undefined}
            aria-label={`Page ${numero}`}
          >
            {numero}
          </button>
        ))}
        {dernierePage < nombrePages && <>
          {dernierePage < nombrePages - 1 && <span className="pagination-ellipsis" aria-hidden="true">…</span>}
          <button type="button" className="pagination-button" onClick={() => changerPage(nombrePages)}>{nombrePages}</button>
        </>}
        <button type="button" className="pagination-button" onClick={() => changerPage(pageActuelle + 1)} disabled={pageActuelle === nombrePages}>
          Suivant
        </button>
      </div>
    </nav>
  );
}
