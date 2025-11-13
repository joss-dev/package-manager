// Auth types
export interface User {
  id: number;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
}

export interface GetProductsQuery {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  sortBy?: 'id' | 'name' | 'price' | 'stock' | 'sku';
}

// Customer types
export interface Customer {
  id: number;
  name: string;
  email: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
}

export interface GetCustomersQuery {
  search?: string;
  limit?: number;
  offset?: number;
}

// Order types
export type OrderStatus = 'PENDING' | 'CONFIRMED';

export const ORDER_STATUS = {
  PENDING: 'PENDING' as OrderStatus,
  CONFIRMED: 'CONFIRMED' as OrderStatus,
};

export interface OrderItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    sku: string;
  };
  qty: number;
  price: number;
}

export interface Order {
  id: number;
  customerId: number;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  status: OrderStatus;
  total: number;
  createdAt: string;
  orderItems?: OrderItem[];
}

export interface CreateOrderItemRequest {
  productId: number;
  qty: number;
}

export interface CreateOrderRequest {
  customerId: number;
  items: CreateOrderItemRequest[];
}

export interface GetOrdersQuery {
  status?: OrderStatus;
  customerId?: number;
  limit?: number;
  offset?: number;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// API Error
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
