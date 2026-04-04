import { describe, it, expect, beforeEach } from 'vitest';
import { truncateAll } from '../../helpers/db';
import { seedUser, seedAdmin, seedAddress, seedOrder, seedCategory, seedProduct, seedVariantWithStock } from '../../helpers/factories';
import { createReturnRequest, getReturnRequest, listUserReturns, updateReturnStatus } from '@/lib/services/return.service';
import { createTicket, getTicket, listUserTickets, addMessage, updateTicketStatus } from '@/lib/services/support-ticket.service';
import { updateOrderStatus } from '@/lib/services/order.service';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { orderItems } from '@/lib/db/schema/orders';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

describe('Return Service (integration)', () => {
  let userId: string;
  let orderId: string;
  let orderItemId: string;
  let adminId: string;

  beforeEach(async () => {
    await truncateAll();
    const user = await seedUser();
    userId = user.id;
    const admin = await seedAdmin();
    adminId = admin.id;
    const address = await seedAddress(userId);
    const order = await seedOrder(userId, address.id, { status: 'pending' });
    orderId = order.id;

    // Add an order item
    const cat = await seedCategory();
    const product = await seedProduct(cat.id);
    const variant = await seedVariantWithStock(product.id);
    const [item] = await db.insert(orderItems).values({
      orderId: order.id,
      variantId: variant.id,
      quantity: 2,
      unitPricePkr: '1000.00',
      totalPkr: '2000.00',
    }).returning();
    orderItemId = item.id;

    // Move order to delivered
    await updateOrderStatus(orderId, 'confirmed', adminId);
    await updateOrderStatus(orderId, 'packed', adminId);
    await updateOrderStatus(orderId, 'shipped', adminId);
    await updateOrderStatus(orderId, 'delivered', adminId);
  });

  it('creates a return request for delivered order', async () => {
    const req = await createReturnRequest(userId, {
      orderId,
      reason: 'damaged',
      items: [{ orderItemId, quantity: 1, condition: 'damaged' }],
    });
    expect(req.status).toBe('pending');
    expect(req.reason).toBe('damaged');
  });

  it('rejects return for non-delivered order', async () => {
    const user2 = await seedUser();
    const addr2 = await seedAddress(user2.id);
    const pendingOrder = await seedOrder(user2.id, addr2.id, { status: 'pending' });

    await expect(createReturnRequest(user2.id, {
      orderId: pendingOrder.id,
      reason: 'changed_mind',
      items: [{ orderItemId, quantity: 1, condition: 'unopened' }],
    })).rejects.toThrow('Only delivered orders');
  });

  it('gets return with items', async () => {
    const req = await createReturnRequest(userId, {
      orderId,
      reason: 'wrong_item',
      items: [{ orderItemId, quantity: 1, condition: 'opened' }],
    });
    const detail = await getReturnRequest(req.id);
    expect(detail.items).toHaveLength(1);
  });

  it('lists user returns', async () => {
    await createReturnRequest(userId, {
      orderId,
      reason: 'not_as_described',
      items: [{ orderItemId, quantity: 1, condition: 'opened' }],
    });
    const { data, total } = await listUserReturns(userId, { page: 1, limit: 10, offset: 0 });
    expect(total).toBe(1);
  });

  it('updates return status', async () => {
    const req = await createReturnRequest(userId, {
      orderId,
      reason: 'damaged',
      items: [{ orderItemId, quantity: 1, condition: 'damaged' }],
    });
    const updated = await updateReturnStatus(req.id, 'approved', 'replacement', adminId);
    expect(updated.status).toBe('approved');
    expect(updated.resolution).toBe('replacement');
  });
});

describe('Support Ticket Service (integration)', () => {
  let userId: string;

  beforeEach(async () => {
    await truncateAll();
    const user = await seedUser();
    userId = user.id;
  });

  it('creates ticket with auto-generated number', async () => {
    const ticket = await createTicket(userId, {
      category: 'product',
      subject: 'Defective item',
      message: 'The zipper broke on first use',
    });
    expect(ticket.ticketNumber).toMatch(/^TKT-/);
    expect(ticket.status).toBe('open');
    expect(ticket.priority).toBe('medium');
  });

  it('gets ticket with messages', async () => {
    const ticket = await createTicket(userId, {
      category: 'order_issue',
      subject: 'Wrong item received',
      message: 'I ordered blue but got red',
    });
    const detail = await getTicket(ticket.id);
    expect(detail.messages).toHaveLength(1);
    expect(detail.messages[0].senderType).toBe('customer');
  });

  it('adds reply message', async () => {
    const ticket = await createTicket(userId, {
      category: 'other',
      subject: 'Question',
      message: 'When do you restock?',
    });
    const admin = await seedAdmin();
    await addMessage(ticket.id, admin.id, 'admin', 'We restock every Monday');

    const detail = await getTicket(ticket.id);
    expect(detail.messages).toHaveLength(2);
    expect(detail.messages[1].senderType).toBe('admin');
  });

  it('lists user tickets', async () => {
    await createTicket(userId, { category: 'product', subject: 'Q1', message: 'msg' });
    await createTicket(userId, { category: 'payment', subject: 'Q2', message: 'msg' });
    const { total } = await listUserTickets(userId, { page: 1, limit: 10, offset: 0 });
    expect(total).toBe(2);
  });

  it('updates ticket status to resolved', async () => {
    const ticket = await createTicket(userId, { category: 'other', subject: 'Q', message: 'msg' });
    const updated = await updateTicketStatus(ticket.id, 'resolved');
    expect(updated.status).toBe('resolved');
    expect(updated.resolvedAt).not.toBeNull();
  });
});
