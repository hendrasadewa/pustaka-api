export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResponse extends PaginationParams {
  totalPage: number;
  totalRecord: number;
}

export interface APIResponse<T = unknown> {
  data: T;
  message: string;
  error: string | null;
}

export interface APIListResponse<T = unknown> extends APIResponse<Array<T>> {
  pagination: PaginationResponse;
}
