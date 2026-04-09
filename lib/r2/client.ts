import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

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
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export interface PresignResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function generatePresignedUploadUrl(
  context: string,
  filename: string,
  contentType: string,
): Promise<PresignResult> {
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error(`Content type '${contentType}' not allowed. Use: ${ALLOWED_TYPES.join(', ')}`);
  }

  const ext = filename.split('.').pop() || 'jpg';
  const key = `${context}/${nanoid()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

  return {
    uploadUrl,
    publicUrl: `${PUBLIC_URL}/${key}`,
    key,
  };
}
