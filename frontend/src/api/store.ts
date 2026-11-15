import { apiRequest } from './http';
import { PageEnvelope } from './books';

export type ProductStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'PREORDER';

export interface StoreProduct {
  id: string; // uuid
  book_reference: string; // MongoDB book id string
  edition: string;
  condition: string;
  price: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface StoreProductDetail extends StoreProduct {
  inventory: {
    quantity: number;
    reserved_quantity: number;
    available_quantity: number;
  };
}

export interface CreateProductPayload {
  book_reference: string;
  price: number;
  edition?: string;
  condition?: string;
  status?: ProductStatus;
  quantity?: number;
  reserved_quantity?: number;
}

export interface UpdateProductPayload {
  price?: number;
  edition?: string;
  condition?: string;
  status?: ProductStatus;
}

export interface UpdateInventoryPayload {
  quantity?: number;
  reserved_quantity?: number;
}

export const storeApi = {
  async getProducts(page = 1, pageSize = 20): Promise<PageEnvelope<StoreProduct>> {
    return apiRequest<PageEnvelope<StoreProduct>>('/api/store/products/', {
      params: { page, page_size: pageSize },
    });
  },

  async getProductDetail(productId: string): Promise<StoreProductDetail> {
    return apiRequest<StoreProductDetail>(`/api/store/products/${productId}/`);
  },

  // Staff endpoints
  async createProduct(payload: CreateProductPayload): Promise<StoreProductDetail> {
    return apiRequest<StoreProductDetail>('/api/store/products/manage/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateProduct(productId: string, payload: UpdateProductPayload): Promise<StoreProductDetail> {
    return apiRequest<StoreProductDetail>(`/api/store/products/${productId}/manage/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async updateInventory(productId: string, payload: UpdateInventoryPayload): Promise<StoreProductDetail> {
    return apiRequest<StoreProductDetail>(`/api/store/products/${productId}/inventory/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
