/** Convert `<input type="datetime-local">` value to ISO 8601 for the API. */
export function localDatetimeToIso(localValue) {
  if (!localValue) return undefined;
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** Round-trip for prefilling datetime-local from URL `at` param. */
export function isoToLocalDatetimeValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function defaultLocalDatetimeValue(hoursFromNow = 1) {
  const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Split `YYYY-MM-DDTHH:mm` for separate date + time inputs. */
export function splitLocalDatetime(localValue) {
  if (!localValue) return { date: '', time: '' };
  const [date, rest] = localValue.split('T');
  const time = rest ? rest.slice(0, 5) : '';
  return { date: date || '', time };
}

/** Merge date + time back to `datetime-local` string shape. */
export function mergeLocalDatetime(date, time) {
  if (!date?.trim()) return '';
  const t = time?.trim() ? time.slice(0, 5) : '12:00';
  return `${date.trim()}T${t}`;
}

/** Local value for “now”, minutes rounded up to `step` (e.g. 15). */
export function nowLocalDatetimeValue({ stepMinutes = 15 } = {}) {
  const d = new Date();
  const stepMs = stepMinutes * 60 * 1000;
  const rounded = Math.ceil(d.getTime() / stepMs) * stepMs;
  const rd = new Date(rounded);
  return isoToLocalDatetimeValue(rd.toISOString());
}
