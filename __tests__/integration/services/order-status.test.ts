import { describe, it, expect, beforeEach } from 'vitest';
import { truncateAll } from '../../helpers/db';
import { seedUser, seedAdmin, seedAddress, seedOrder } from '../../helpers/factories';
import { updateOrderStatus } from '@/lib/services/order.service';

describe('Order Status FSM (integration)', () => {
  let admin: Awaited<ReturnType<typeof seedAdmin>>;
  let order: Awaited<ReturnType<typeof seedOrder>>;

  beforeEach(async () => {
    await truncateAll();
    const user = await seedUser();
    admin = await seedAdmin();
    const address = await seedAddress(user.id);
    order = await seedOrder(user.id, address.id, { status: 'pending' });
  });

  it('pending -> confirmed is valid', async () => {
    const updated = await updateOrderStatus(order.id, 'confirmed', admin.id, 'Confirmed by admin');
    expect(updated.status).toBe('confirmed');
  });

  it('pending -> cancelled is valid', async () => {
    const updated = await updateOrderStatus(order.id, 'cancelled', admin.id);
    expect(updated.status).toBe('cancelled');
  });

  it('pending -> shipped is INVALID', async () => {
    await expect(
      updateOrderStatus(order.id, 'shipped', admin.id),
    ).rejects.toThrow("Cannot transition from 'pending' to 'shipped'");
  });

  it('pending -> delivered is INVALID', async () => {
    await expect(
      updateOrderStatus(order.id, 'delivered', admin.id),
    ).rejects.toThrow("Cannot transition from 'pending' to 'delivered'");
  });

  it('confirmed -> packed is valid', async () => {
    await updateOrderStatus(order.id, 'confirmed', admin.id);
    const updated = await updateOrderStatus(order.id, 'packed', admin.id);
    expect(updated.status).toBe('packed');
  });

  it('packed -> shipped is valid', async () => {
    await updateOrderStatus(order.id, 'confirmed', admin.id);
    await updateOrderStatus(order.id, 'packed', admin.id);
    const updated = await updateOrderStatus(order.id, 'shipped', admin.id);
    expect(updated.status).toBe('shipped');
  });

  it('shipped -> delivered is valid', async () => {
    await updateOrderStatus(order.id, 'confirmed', admin.id);
    await updateOrderStatus(order.id, 'packed', admin.id);
    await updateOrderStatus(order.id, 'shipped', admin.id);
    const updated = await updateOrderStatus(order.id, 'delivered', admin.id);
    expect(updated.status).toBe('delivered');
  });

  it('delivered is terminal — no further transitions', async () => {
    await updateOrderStatus(order.id, 'confirmed', admin.id);
    await updateOrderStatus(order.id, 'packed', admin.id);
    await updateOrderStatus(order.id, 'shipped', admin.id);
    await updateOrderStatus(order.id, 'delivered', admin.id);

    await expect(
      updateOrderStatus(order.id, 'cancelled', admin.id),
    ).rejects.toThrow("Cannot transition from 'delivered'");
  });

  it('cancelled is terminal', async () => {
    await updateOrderStatus(order.id, 'cancelled', admin.id);

    await expect(
      updateOrderStatus(order.id, 'confirmed', admin.id),
    ).rejects.toThrow("Cannot transition from 'cancelled'");
  });

  it('shipped -> returned is valid', async () => {
    await updateOrderStatus(order.id, 'confirmed', admin.id);
    await updateOrderStatus(order.id, 'packed', admin.id);
    await updateOrderStatus(order.id, 'shipped', admin.id);
    const updated = await updateOrderStatus(order.id, 'returned', admin.id);
    expect(updated.status).toBe('returned');
  });
});
