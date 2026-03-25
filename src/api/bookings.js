import api from './api';

export async function listBookings({ page, page_size } = {}) {
  const { data } = await api.get('bookings/', { params: { page, page_size } });
  return data;
}

export async function getBooking(id) {
  const { data } = await api.get(`bookings/${id}/`);
  return data;
}

export async function createBooking(body) {
  const { data } = await api.post('bookings/', body);
  return data;
}

export async function updateBooking(id, body) {
  const { data } = await api.put(`bookings/${id}/update/`, body);
  return data;
}

export async function deleteBooking(id) {
  const { data } = await api.delete(`bookings/${id}/delete/`);
  return data;
}
