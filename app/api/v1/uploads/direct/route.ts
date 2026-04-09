import { type NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Accept either regular user or admin
    try {
      await requireAuth();
    } catch {
      await requireAdmin();
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const context = formData.get('context') as string | null;

    if (!file) {
      return Response.json({ success: false, error: { message: 'No file provided' } }, { status: 400 });
    }

    if (!context) {
      return Response.json({ success: false, error: { message: 'No context provided' } }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ success: false, error: { message: `Invalid file type: ${file.type}` } }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ success: false, error: { message: 'File too large (max 10MB)' } }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const key = `${context}/${nanoid()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));

    const publicUrl = `${PUBLIC_URL}/${key}`;

    return success({ publicUrl, key });
  } catch (error) {
    return handleApiError(error);
  }
}
