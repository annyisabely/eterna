import api from './client';

export const getSettings = async () => {
  const { data } = await api.get('/settings/public');
  return data;
};
