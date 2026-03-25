import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteBooking, listBookings } from '../../api/bookings';
import { Pagination } from '../../components/Pagination';
import { getErrorMessage } from '../../utils/apiError';

const PAGE_SIZE = 20;

function formatRange(start, end) {
  const a = start ? new Date(start) : null;
  const b = end ? new Date(end) : null;
  if (!a || !b || Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
    return '—';
  }
  return `${a.toLocaleString()} → ${b.toLocaleString()}`;
}

export function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await listBookings({ page, page_size: PAGE_SIZE });
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load bookings.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this booking?')) return;
    setActionId(id);
    try {
      await deleteBooking(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete booking.'));
    } finally {
      setActionId(null);
    }
  }

  const rows = data?.results ?? [];

  return (
    <div className="page-shell">
      <h1>All bookings</h1>
      <p className="lede">Read-only overview with cancel/delete for support.</p>

      {error ? (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="table-wrap card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Parking</th>
                  <th>When</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.booking_id}>
                    <td>{b.booking_id}</td>
                    <td>
                      {b.user
                        ? `${b.user.first_name || ''} ${b.user.last_name || ''} (${b.user.email})`
                        : `#${b.user_id}`}
                    </td>
                    <td>
                      {b.parking?.address ? (
                        <Link to={`/parking/${b.parking_id}`}>
                          {b.parking.address}
                        </Link>
                      ) : (
                        `#${b.parking_id}`
                      )}
                    </td>
                    <td>{formatRange(b.start_time, b.end_time)}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm danger"
                        onClick={() => handleDelete(b.booking_id)}
                        disabled={actionId === b.booking_id}
                      >
                        {actionId === b.booking_id ? '…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 ? (
              <p className="muted empty-table-note">No bookings.</p>
            ) : null}
          </div>
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
