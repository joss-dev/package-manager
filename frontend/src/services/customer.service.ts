import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  GetCustomersQuery,
  PaginatedResponse,
} from '../types';

export const customerService = {
  async getAll(query?: GetCustomersQuery): Promise<PaginatedResponse<Customer>> {
    return apiClient.get<PaginatedResponse<Customer>>(
      API_ENDPOINTS.CUSTOMERS.BASE,
      { params: query as Record<string, string | number | boolean | undefined> }
    );
  },

  async getById(id: number): Promise<Customer> {
    return apiClient.get<Customer>(API_ENDPOINTS.CUSTOMERS.BY_ID(id));
  },

  async create(data: CreateCustomerRequest): Promise<Customer> {
    return apiClient.post<Customer>(API_ENDPOINTS.CUSTOMERS.BASE, data);
  },

  async update(id: number, data: UpdateCustomerRequest): Promise<Customer> {
    return apiClient.put<Customer>(API_ENDPOINTS.CUSTOMERS.BY_ID(id), data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.CUSTOMERS.BY_ID(id));
  },
};
