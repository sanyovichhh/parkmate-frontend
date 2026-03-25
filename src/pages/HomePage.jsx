import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listParkings } from '../api/parkings';
import { Pagination } from '../components/Pagination';
import { getErrorMessage } from '../utils/apiError';
import {
  defaultLocalDatetimeValue,
  isoToLocalDatetimeValue,
  localDatetimeToIso,
} from '../utils/datetime';

const PAGE_SIZE = 12;

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const atParam = searchParams.get('at') || '';

  const [localAt, setLocalAt] = useState(() =>
    atParam ? isoToLocalDatetimeValue(atParam) : defaultLocalDatetimeValue(1),
  );
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (atParam) setLocalAt(isoToLocalDatetimeValue(atParam));
  }, [atParam]);

  const atIso = useMemo(() => localDatetimeToIso(localAt), [localAt]);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await listParkings({
        page,
        page_size: PAGE_SIZE,
        at: atIso,
      });
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load parkings.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, atIso]);

  useEffect(() => {
    load();
  }, [load]);

  function applyTimeFilter(e) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (atIso) next.set('at', atIso);
    else next.delete('at');
    setSearchParams(next);
    setPage(1);
  }

  const filtered = useMemo(() => {
    const results = data?.results ?? [];
    if (!onlyAvailable || !atIso) return results;
    return results.filter(
      (p) => p.available_spots != null && p.available_spots > 0,
    );
  }, [data, onlyAvailable, atIso]);

  return (
    <div className="page-shell home-page">
      <header className="page-header">
        <h1>Find parking</h1>
        <p className="lede">
          Pick a time to see availability at that moment, then open a lot to
          book a start and end window.
        </p>
      </header>

      <form className="filter-bar card" onSubmit={applyTimeFilter}>
        <label className="field inline">
          <span>Check availability at</span>
          <input
            type="datetime-local"
            value={localAt}
            onChange={(e) => setLocalAt(e.target.value)}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            disabled={!atIso}
          />
          <span>Only lots with free spots (uses the time above)</span>
        </label>
        <button type="submit" className="btn btn-secondary">
          Apply to URL
        </button>
      </form>

      {error ? (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="muted">Loading parkings…</p>
      ) : (
        <>
          <ul className="parking-grid">
            {filtered.map((p) => (
              <li key={p.parking_id} className="card parking-card">
                <h2>{p.address}</h2>
                {p.comment ? <p className="muted small">{p.comment}</p> : null}
                <dl className="parking-meta">
                  <div>
                    <dt>Spots</dt>
                    <dd>{p.amount_of_spots}</dd>
                  </div>
                  <div>
                    <dt>Available</dt>
                    <dd>
                      {p.available_spots != null
                        ? p.available_spots
                        : '— (set a time)'}
                    </dd>
                  </div>
                  <div>
                    <dt>Price</dt>
                    <dd>{p.price}</dd>
                  </div>
                </dl>
                <Link
                  className="btn btn-primary"
                  to={
                    atIso
                      ? `/parking/${p.parking_id}?at=${encodeURIComponent(atIso)}`
                      : `/parking/${p.parking_id}`
                  }
                >
                  View & book
                </Link>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && !error ? (
            <p className="muted">
              No parkings match your filters. Try another time or turn off
              “only lots with free spots”.
            </p>
          ) : null}
          {data ? (
            <Pagination
              count={data.count}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => setPage(p)}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
