export function getErrorMessage(err, fallback = 'Something went wrong.') {
  const d = err?.response?.data;
  if (!d) return err?.message || fallback;
  if (typeof d === 'string') return d;
  if (d.error) return typeof d.error === 'string' ? d.error : fallback;
  if (d.detail) return typeof d.detail === 'string' ? d.detail : fallback;
  if (d.message && typeof d.message === 'string') return d.message;
  const first = Object.values(d).flat()[0];
  if (typeof first === 'string') return first;
  if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
  return fallback;
}
