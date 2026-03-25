import { useCallback, useEffect, useState } from 'react';
import {
  createParking,
  deleteParking,
  listParkings,
  updateParking,
} from '../../api/parkings';
import { Pagination } from '../../components/Pagination';
import { getErrorMessage } from '../../utils/apiError';

const PAGE_SIZE = 20;

const emptyForm = {
  amount_of_spots: '',
  address: '',
  comment: '',
  price: '',
};

export function AdminParkingsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await listParkings({ page, page_size: PAGE_SIZE });
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load parkings.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(p) {
    setEditingId(p.parking_id);
    setForm({
      amount_of_spots: String(p.amount_of_spots),
      address: p.address ?? '',
      comment: p.comment ?? '',
      price: String(p.price ?? ''),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createParking({
        amount_of_spots: Number(form.amount_of_spots),
        address: form.address,
        comment: form.comment || null,
        price: Number(form.price),
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create parking.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (editingId == null) return;
    setSaving(true);
    setError('');
    try {
      await updateParking(editingId, {
        amount_of_spots: Number(form.amount_of_spots),
        address: form.address,
        comment: form.comment || null,
        price: Number(form.price),
      });
      cancelEdit();
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update parking.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this parking? Bookings may still reference it.'))
      return;
    setError('');
    try {
      await deleteParking(id);
      if (editingId === id) cancelEdit();
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete parking.'));
    }
  }

  const rows = data?.results ?? [];

  return (
    <div className="page-shell">
      <h1>Manage parkings</h1>
      <p className="lede">Create, edit, or remove parking lots.</p>

      {error ? (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      ) : null}

      <section className="card admin-form-card">
        <h2>{editingId != null ? 'Edit parking' : 'New parking'}</h2>
        <form
          className="stack-form"
          onSubmit={editingId != null ? handleUpdate : handleCreate}
        >
          <div className="field-row">
            <label className="field">
              <span>Spots</span>
              <input
                type="number"
                min={1}
                value={form.amount_of_spots}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount_of_spots: e.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Price</span>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                required
              />
            </label>
          </div>
          <label className="field">
            <span>Address</span>
            <input
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              required
            />
          </label>
          <label className="field">
            <span>Comment</span>
            <textarea
              rows={2}
              value={form.comment}
              onChange={(e) =>
                setForm((f) => ({ ...f, comment: e.target.value }))
              }
            />
          </label>
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? 'Saving…'
                : editingId != null
                  ? 'Save changes'
                  : 'Create parking'}
            </button>
            {editingId != null ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelEdit}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="table-wrap card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Address</th>
                  <th>Spots</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.parking_id}>
                    <td>{p.parking_id}</td>
                    <td>{p.address}</td>
                    <td>{p.amount_of_spots}</td>
                    <td>{p.price}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => startEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm danger"
                        onClick={() => handleDelete(p.parking_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 ? (
              <p className="muted empty-table-note">No parkings yet.</p>
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
