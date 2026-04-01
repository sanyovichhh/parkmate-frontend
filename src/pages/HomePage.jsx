import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listParkings } from '../api/parkings';
import { Pagination } from '../components/Pagination';
import { getErrorMessage } from '../utils/apiError';
import { DateTimeFields } from '../components/DateTimeFields';
import {
  defaultLocalDatetimeValue,
  isoToLocalDatetimeValue,
  localDatetimeToIso,
  nowLocalDatetimeValue,
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

  useEffect(() => {
    setPage(1);
  }, [atIso]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (atIso) next.set('at', atIso);
    else next.delete('at');
    const nextAt = next.get('at') ?? '';
    const curAt = searchParams.get('at') ?? '';
    if (nextAt === curAt) return;
    setSearchParams(next, { replace: true });
  }, [atIso, searchParams, setSearchParams]);

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

      <div className="filter-bar card">
        <div className="filter-datetime-block">
          <DateTimeFields
            legend="Check availability at"
            value={localAt}
            onChange={setLocalAt}
            idPrefix="home-at"
            timeStep={300}
          />
          <div className="datetime-quick" aria-label="Quick time presets">
            <span className="datetime-quick-label">Quick</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setLocalAt(nowLocalDatetimeValue({ stepMinutes: 15 }))}
            >
              Now
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setLocalAt(defaultLocalDatetimeValue(1))}
            >
              +1 h
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setLocalAt(defaultLocalDatetimeValue(2))}
            >
              +2 h
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setLocalAt(defaultLocalDatetimeValue(4))}
            >
              +4 h
            </button>
          </div>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            disabled={!atIso}
          />
          <span>Only lots with free spots (uses the time above)</span>
        </label>
      </div>

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
