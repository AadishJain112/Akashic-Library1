import { apiRequest } from './http';

export interface CartItem {
  id: string; // uuid
  product_id: string; // uuid
  book_reference: string;
  edition: string;
  condition: string;
  current_price: number;
  quantity: number;
  available_quantity: number;
  line_subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  status: 'ACTIVE' | 'ABANDONED';
  cart_subtotal: number;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export const cartApi = {
  async getCart(): Promise<Cart> {
    return apiRequest<Cart>('/api/cart/');
  },

  async getCartItems(): Promise<CartItem[]> {
    return apiRequest<CartItem[]>('/api/cart/items/');
  },

  async addItem(productId: string, quantity = 1): Promise<CartItem> {
    return apiRequest<CartItem>('/api/cart/items/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    return apiRequest<CartItem>(`/api/cart/items/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },

  async removeItem(itemId: string): Promise<null> {
    return apiRequest<null>(`/api/cart/items/${itemId}/`, {
      method: 'DELETE',
    });
  },
};
