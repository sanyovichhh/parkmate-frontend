export function Pagination({ count, page, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="btn btn-secondary"
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
      >
        Previous
      </button>
      <span className="pagination-meta">
        Page {safePage} of {totalPages}
        {count != null ? ` · ${count} total` : ''}
      </span>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={safePage >= totalPages}
        onClick={() => onPageChange(safePage + 1)}
      >
        Next
      </button>
    </nav>
  );
}
