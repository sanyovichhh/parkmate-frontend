import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { createBooking } from '../api/bookings';
import { getParking, getParkingAvailability } from '../api/parkings';
import { getErrorMessage } from '../utils/apiError';
import {
  defaultLocalDatetimeValue,
  isoToLocalDatetimeValue,
  localDatetimeToIso,
} from '../utils/datetime';

export function ParkingDetailPage() {
  const { id } = useParams();
  const parkingId = Number(id);
  const [searchParams] = useSearchParams();
  const atFromList = searchParams.get('at') || '';

  const [parking, setParking] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [startLocal, setStartLocal] = useState(() =>
    atFromList
      ? isoToLocalDatetimeValue(atFromList)
      : defaultLocalDatetimeValue(1),
  );
  const [endLocal, setEndLocal] = useState(() =>
    atFromList
      ? isoToLocalDatetimeValue(
          new Date(
            new Date(atFromList).getTime() + 2 * 60 * 60 * 1000,
          ).toISOString(),
        )
      : defaultLocalDatetimeValue(3),
  );

  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const startIso = useMemo(() => localDatetimeToIso(startLocal), [startLocal]);
  const endIso = useMemo(() => localDatetimeToIso(endLocal), [endLocal]);

  const load = useCallback(async () => {
    if (!Number.isFinite(parkingId)) {
      setError('Invalid parking.');
      setLoading(false);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const [p, av] = await Promise.all([
        getParking(parkingId, { at: startIso }),
        getParkingAvailability(parkingId, { at: startIso }),
      ]);
      setParking(p);
      setAvailability(av);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load parking.'));
      setParking(null);
      setAvailability(null);
    } finally {
      setLoading(false);
    }
  }, [parkingId, startIso]);

  useEffect(() => {
    load();
  }, [load]);

  const durationMs = useMemo(() => {
    if (!startIso || !endIso) return 0;
    const a = new Date(startIso).getTime();
    const b = new Date(endIso).getTime();
    return Math.max(0, b - a);
  }, [startIso, endIso]);

  const durationLabel = useMemo(() => {
    if (!durationMs) return '—';
    const m = Math.floor(durationMs / 60000);
    const h = Math.floor(m / 60);
    const rest = m % 60;
    if (h <= 0) return `${rest} min`;
    return `${h} h ${rest} min`;
  }, [durationMs]);

  async function handleBook(e) {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    if (!startIso || !endIso) {
      setBookingError('Choose start and end time.');
      return;
    }
    if (new Date(endIso) <= new Date(startIso)) {
      setBookingError('End time must be after start time.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createBooking({
        parking_id: parkingId,
        start_time: startIso,
        end_time: endIso,
      });
      setBookingSuccess(
        `Booking #${created.booking_id} confirmed. You can manage it under My bookings.`,
      );
    } catch (err) {
      setBookingError(
        getErrorMessage(
          err,
          'Booking failed. The lot may be full for that window.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (error || !parking) {
    return (
      <div className="page-shell">
        <div className="alert alert-error" role="alert">
          {error || 'Parking not found.'}
        </div>
        <Link to="/">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="page-shell parking-detail">
      <p className="breadcrumb">
        <Link to="/">Find parking</Link>
        <span aria-hidden> / </span>
        <span>{parking.address}</span>
      </p>
      <h1>{parking.address}</h1>
      {parking.comment ? <p className="lede">{parking.comment}</p> : null}

      <div className="two-col">
        <section className="card">
          <h2>Availability</h2>
          {availability ? (
            <dl className="detail-list compact">
              <div>
                <dt>At (start time)</dt>
                <dd>{new Date(availability.datetime).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Total spots</dt>
                <dd>{availability.total_spots}</dd>
              </div>
              <div>
                <dt>Booked then</dt>
                <dd>{availability.booked}</dd>
              </div>
              <div>
                <dt>Available then</dt>
                <dd>{availability.available}</dd>
              </div>
            </dl>
          ) : (
            <p className="muted">Could not load availability.</p>
          )}
          <p className="muted small">
            Booking uses the full interval; the server checks overlaps with
            capacity.
          </p>
        </section>

        <section className="card">
          <h2>Book</h2>
          <form className="stack-form" onSubmit={handleBook}>
            {bookingError ? (
              <div className="alert alert-error" role="alert">
                {bookingError}
              </div>
            ) : null}
            {bookingSuccess ? (
              <div className="alert alert-success" role="alert">
                {bookingSuccess}
              </div>
            ) : null}
            <label className="field">
              <span>Start</span>
              <input
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>End</span>
              <input
                type="datetime-local"
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
                required
              />
            </label>
            <dl className="detail-list compact">
              <div>
                <dt>Duration</dt>
                <dd>{durationLabel}</dd>
              </div>
              <div>
                <dt>Parking price (API value)</dt>
                <dd>{parking.price}</dd>
              </div>
            </dl>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Confirming…' : 'Confirm booking'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
