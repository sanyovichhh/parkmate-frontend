import { useCallback, useEffect, useState } from 'react';
import { listUsers } from '../../api/users';
import { Pagination } from '../../components/Pagination';
import { getErrorMessage } from '../../utils/apiError';

const PAGE_SIZE = 20;

function userId(u) {
  return u?.id ?? u?.user_id;
}

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await listUsers({ page, page_size: PAGE_SIZE });
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load users.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = Array.isArray(data) ? data : (data?.results ?? []);

  return (
    <div className="page-shell">
      <h1>All users</h1>
      <p className="lede">Directory of registered accounts (admin only).</p>

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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Member since</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => {
                  const id = userId(u);
                  return (
                    <tr key={id ?? u.email}>
                      <td>{id ?? '—'}</td>
                      <td>
                        {[u.first_name, u.last_name].filter(Boolean).join(' ') ||
                          '—'}
                      </td>
                      <td>{u.email ?? '—'}</td>
                      <td>{u.is_admin ? 'Administrator' : 'Customer'}</td>
                      <td>
                        {u.date_joined
                          ? new Date(u.date_joined).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 ? (
              <p className="muted empty-table-note">No users.</p>
            ) : null}
          </div>
          {data && typeof data.count === 'number' ? (
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
