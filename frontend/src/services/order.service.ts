import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  Order,
  CreateOrderRequest,
  GetOrdersQuery,
  PaginatedResponse,
} from '../types';

export const orderService = {
  async getAll(query?: GetOrdersQuery): Promise<PaginatedResponse<Order>> {
    return apiClient.get<PaginatedResponse<Order>>(
      API_ENDPOINTS.ORDERS.BASE,
      { params: query as Record<string, string | number | boolean | undefined> }
    );
  },

  async getById(id: number): Promise<Order> {
    return apiClient.get<Order>(API_ENDPOINTS.ORDERS.BY_ID(id));
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS.BASE, data);
  },

  async confirm(id: number): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CONFIRM(id));
  },
};
