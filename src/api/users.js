import api from './api';

export async function listUsers({ page, page_size } = {}) {
  const { data } = await api.get('users/', {
    params: { page, page_size },
  });
  return data;
}
