import axios from 'axios';

const raw = import.meta.env.VITE_API_URL;
const baseURL = typeof raw === 'string' ? raw.replace(/\/$/, '') : '';

if (!baseURL && import.meta.env.DEV) {
  console.warn(
    '[ParkMate] Set VITE_API_URL in .env (e.g. http://127.0.0.1:8000/api/parkmate)',
  );
}

const api = axios.create({
  baseURL: baseURL || undefined,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
