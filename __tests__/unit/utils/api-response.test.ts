import { describe, it, expect } from 'vitest';
import { success, created, paginated, noContent } from '@/lib/utils/api-response';

describe('api-response helpers', () => {
  describe('success()', () => {
    it('returns 200 with success shape', async () => {
      const res = success({ id: '1', name: 'test' });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({
        success: true,
        data: { id: '1', name: 'test' },
      });
    });

    it('accepts custom status code', async () => {
      const res = success('ok', 202);
      expect(res.status).toBe(202);
    });

    it('returns correct content-type header', () => {
      const res = success({});
      expect(res.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('created()', () => {
    it('returns 201 with success shape', async () => {
      const res = created({ id: 'new-id' });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toEqual({
        success: true,
        data: { id: 'new-id' },
      });
    });
  });

  describe('paginated()', () => {
    it('returns 200 with data and meta', async () => {
      const items = [{ id: '1' }, { id: '2' }];
      const meta = { page: 1, limit: 20, total: 2, totalPages: 1 };
      const res = paginated(items, meta);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({
        success: true,
        data: items,
        meta,
      });
    });

    it('returns empty data array with correct meta', async () => {
      const meta = { page: 1, limit: 20, total: 0, totalPages: 0 };
      const res = paginated([], meta);
      const body = await res.json();
      expect(body.data).toEqual([]);
      expect(body.meta.total).toBe(0);
    });
  });

  describe('noContent()', () => {
    it('returns 204 with null body', () => {
      const res = noContent();
      expect(res.status).toBe(204);
      expect(res.body).toBeNull();
    });
  });
});
