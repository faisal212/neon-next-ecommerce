import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/auth');

import { GET } from '@/app/api/v1/cart/route';
import { POST as addItemHandler } from '@/app/api/v1/cart/items/route';
import * as authModule from '@/lib/auth';
import { get, post } from '../../../helpers/request';
import { truncateAll } from '../../../helpers/db';
import { seedUser, seedCategory, seedProduct, seedVariantWithStock } from '../../../helpers/factories';

const mockGetCurrentUser = vi.mocked(authModule.getCurrentUser);

describe('Cart API', () => {
  let userId: string;
  let variantId: string;

  beforeEach(async () => {
    vi.resetAllMocks();
    await truncateAll();

    const user = await seedUser();
    userId = user.id;

    const category = await seedCategory();
    const product = await seedProduct(category.id, { basePricePkr: '1000.00' });
    const variant = await seedVariantWithStock(product.id, 10);
    variantId = variant.id;
  });

  describe('GET /api/v1/cart', () => {
    it('returns 400 when no auth and no x-session-token', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const res = await GET(get('/api/v1/cart'));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('Session token required for guest cart');
    });

    it('returns 200 with cart for guest (x-session-token header)', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const res = await GET(
        get('/api/v1/cart', { headers: { 'x-session-token': 'guest-session-123' } }),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.userId).toBeNull();
      expect(body.data.sessionToken).toBe('guest-session-123');
    });

    it('returns 200 with cart for authenticated user', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: userId,
        authUserId: crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phonePk: null,
        isPhoneVerified: false,
        isActive: true,
      });

      const res = await GET(get('/api/v1/cart'));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.userId).toBe(userId);
    });
  });

  describe('POST /api/v1/cart/items', () => {
    it('returns 400 for invalid body', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: userId,
        authUserId: crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phonePk: null,
        isPhoneVerified: false,
        isActive: true,
      });

      const res = await addItemHandler(
        post('/api/v1/cart/items', { variantId: 'not-a-uuid', quantity: -1 }),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 201 when adding item to cart', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: userId,
        authUserId: crypto.randomUUID(),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phonePk: null,
        isPhoneVerified: false,
        isActive: true,
      });

      const res = await addItemHandler(
        post('/api/v1/cart/items', { variantId, quantity: 2 }),
      );
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.quantity).toBe(2);
      expect(body.data.variantId).toBe(variantId);
    });
  });
});
