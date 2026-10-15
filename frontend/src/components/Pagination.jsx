import { useEffect, useState } from "react";

export function usePagination(items, resetKey = "") {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    page: currentPage,
    pageSize,
    pageCount,
    start: items.length === 0 ? 0 : startIndex + 1,
    end: Math.min(startIndex + pageSize, items.length),
    setPage,
    setPageSize: (value) => {
      setPageSize(Number(value));
      setPage(1);
    },
  };
}

export function Pagination({ count, start, end, page, pageCount, pageSize, onPageChange, onPageSizeChange }) {
  if (count === 0) return null;

  let firstPage = Math.max(1, page - 2);
  let lastPage = Math.min(pageCount, firstPage + 4);
  firstPage = Math.max(1, lastPage - 4);
  const pages = Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index);

  return (
    <nav className="pagination" aria-label="Pagination du tableau">
      <p className="pagination-summary">Affichage de {start} à {end} sur {count} éléments</p>
      <div className="pagination-controls">
        <label className="pagination-size">
          Lignes
          <select value={pageSize} onChange={(event) => onPageSizeChange(event.target.value)} aria-label="Nombre de lignes par page">
            {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <button type="button" className="pagination-button" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          Précédent
        </button>
        {firstPage > 1 && <>
          <button type="button" className="pagination-button" onClick={() => onPageChange(1)}>1</button>
          {firstPage > 2 && <span className="pagination-ellipsis" aria-hidden="true">…</span>}
        </>}
        {pages.map((number) => (
          <button
            type="button"
            key={number}
            className={`pagination-button${number === page ? " active" : ""}`}
            onClick={() => onPageChange(number)}
            aria-current={number === page ? "page" : undefined}
            aria-label={`Page ${number}`}
          >
            {number}
          </button>
        ))}
        {lastPage < pageCount && <>
          {lastPage < pageCount - 1 && <span className="pagination-ellipsis" aria-hidden="true">…</span>}
          <button type="button" className="pagination-button" onClick={() => onPageChange(pageCount)}>{pageCount}</button>
        </>}
        <button type="button" className="pagination-button" onClick={() => onPageChange(page + 1)} disabled={page === pageCount}>
          Suivant
        </button>
      </div>
    </nav>
  );
}
