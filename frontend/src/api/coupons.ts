import api from './client';

export interface ValidatedCoupon {
  coupon: {
    id: string;
    code: string;
    description?: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_value: number;
  };
  discount: number;
}

export const validateCoupon = async (code: string, subtotal: number): Promise<ValidatedCoupon> => {
  const response = await api.post('/coupons/validate', { code, subtotal });
  return response.data.data;
};
