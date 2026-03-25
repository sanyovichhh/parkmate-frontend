import api from './api';

export async function listParkings({ page, page_size, at } = {}) {
  const { data } = await api.get('parking/', {
    params: { page, page_size, at },
  });
  return data;
}

export async function getParking(id, { at } = {}) {
  const { data } = await api.get(`parking/${id}/`, { params: { at } });
  return data;
}

export async function getParkingAvailability(id, { at } = {}) {
  const { data } = await api.get(`parking/${id}/availability/`, {
    params: { at },
  });
  return data;
}

export async function createParking(body) {
  const { data } = await api.post('parking/', body);
  return data;
}

export async function updateParking(id, body) {
  const { data } = await api.put(`parking/${id}/update/`, body);
  return data;
}

export async function deleteParking(id) {
  const { data } = await api.delete(`parking/${id}/delete/`);
  return data;
}
