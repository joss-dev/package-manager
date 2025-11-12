export interface PaginatedResponse<T = unknown> {
  total: number;
  limit: number;
  offset: number;
  order: string;
  sortBy: string;
  data: T[];
  [key: string]: unknown;
}
