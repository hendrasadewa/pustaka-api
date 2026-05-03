import type { APIListResponse, APIResponse, PaginationParams } from "../types/API";

export function ok<T>(data: T, message = "OK"): APIResponse<T> {
  return { data, message, error: null };
}

export function fail(message: string, error: string = message): APIResponse<null> {
  return { data: null, message, error };
}

export function okList<T>(
  data: T[],
  params: PaginationParams,
  total: number,
  message = "OK"
): APIListResponse<T> {
  return {
    data,
    message,
    error: null,
    pagination: {
      ...params,
      totalPage: Math.ceil(total / params.limit),
      totalRecord: total,
    },
  };
}
