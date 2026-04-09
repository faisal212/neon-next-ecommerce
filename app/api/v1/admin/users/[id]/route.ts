import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { NotFoundError, ValidationError } from '@/lib/errors/api-error';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) throw new NotFoundError('User not found');

    return success(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin']);
    const { id } = await params;
    const body = await request.json();

    if (typeof body.isActive !== 'boolean') {
      throw new ValidationError('isActive must be a boolean');
    }

    const [user] = await db
      .update(users)
      .set({ isActive: body.isActive, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!user) throw new NotFoundError('User not found');

    return success(user);
  } catch (error) {
    return handleApiError(error);
  }
}
