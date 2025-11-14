import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  GetProductsQuery,
  PaginatedResponse,
} from '../types';

export const productService = {
  async getAll(query?: GetProductsQuery): Promise<PaginatedResponse<Product>> {
    return apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.BASE,
      { params: query as Record<string, string | number | boolean | undefined> }
    );
  },

  async getById(id: number): Promise<Product> {
    return apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  async create(data: CreateProductRequest): Promise<Product> {
    return apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.BASE, data);
  },

  async update(id: number, data: UpdateProductRequest): Promise<Product> {
    return apiClient.patch<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id), data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },
};
