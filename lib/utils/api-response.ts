export function success<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

export function created<T>(data: T): Response {
  return success(data, 201);
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function paginated<T>(data: T[], meta: PaginationMeta): Response {
  return Response.json({ success: true, data, meta }, { status: 200 });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}
