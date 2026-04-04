import { type NextRequest } from 'next/server';
import { registerSchema } from '@/lib/validators/user.validators';
import { createUser } from '@/lib/services/user.service';
import { created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { AuthenticationError } from '@/lib/errors/api-error';

export async function POST(request: NextRequest) {
  try {
    const authUserId = request.headers.get('x-auth-user-id');
    if (!authUserId) throw new AuthenticationError();

    const body = await request.json();
    const data = registerSchema.parse(body);
    const user = await createUser(authUserId, data);
    return created(user);
  } catch (error) {
    return handleApiError(error);
  }
}
