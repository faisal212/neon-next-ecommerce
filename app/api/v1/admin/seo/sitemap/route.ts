import { connection } from 'next/server';
import { generateSitemapXml } from '@/lib/services/seo.service';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    await connection();
    const xml = await generateSitemapXml();
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
