export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  let page = parseInt(searchParams.get('page') ?? '', 10);
  let limit = parseInt(searchParams.get('limit') ?? '', 10);

  if (!Number.isFinite(page) || page < 1) page = DEFAULT_PAGE;
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}
