import { apiRequest } from './http';
import { PageEnvelope } from './books';

export interface OrderItem {
  id: string;
  product_id: string | null;
  title: string; // snapshot title
  quantity: number;
  price: string; // decimal string e.g. "450.00"
  line_total: string;
}

export interface Order {
  id: string; // uuid
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PAID' | 'FAILED';
  subtotal: string; // decimal string
  total: string; // decimal string
  items: OrderItem[];
  created_at: string;
}

export const ordersApi = {
  async checkout(): Promise<Order> {
    return apiRequest<Order>('/api/checkout/', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  async getOrders(page = 1, pageSize = 20): Promise<PageEnvelope<Order>> {
    return apiRequest<PageEnvelope<Order>>('/api/orders/', {
      params: { page, page_size: pageSize },
    });
  },

  async getOrderDetail(orderId: string): Promise<Order> {
    return apiRequest<Order>(`/api/orders/${orderId}/`);
  },
};
