import api from './client';

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  is_active: boolean;
  sort_order: number;
}

export const getBanners = async (): Promise<Banner[]> => {
  const response = await api.get('/banners?active=true');
  return response.data.data ?? [];
};
