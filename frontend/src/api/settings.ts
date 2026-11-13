import api from './client';

export interface StoreSettings {
  store_name?: string;
  store_address?: string;
  store_phone?: string;
  store_whatsapp?: string;
  store_email?: string;
  store_instagram?: string;
  store_hours?: string;
  store_about?: string;
  delivery_enabled?: string;
  pickup_enabled?: string;
  min_order_value?: string;
}

export const getStoreSettings = async (): Promise<StoreSettings> => {
  const response = await api.get('/settings');
  return response.data.data ?? {};
};

