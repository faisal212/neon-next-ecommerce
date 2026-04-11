import { type NextRequest } from 'next/server';
import { requireAuthUserId } from '@/lib/auth';
import { registerSchema } from '@/lib/validators/user.validators';
import { createUser } from '@/lib/services/user.service';
import { created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function POST(request: NextRequest) {
  try {
    // Read the Neon Auth user id from the session cookie set by
    // authClient.signUp.email() a moment ago. Works during signup
    // because it does NOT require a matching `users` profile row —
    // we're the one about to create that row below.
    const authUserId = await requireAuthUserId();

    const body = await request.json();
    const data = registerSchema.parse(body);
    const user = await createUser(authUserId, data);
    return created(user);
  } catch (error) {
    return handleApiError(error);
  }
}
