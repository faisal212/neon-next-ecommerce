import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`SELECT 1`;
    return Response.json({ status: 'ok', database: 'connected' });
  } catch {
    return Response.json(
      { status: 'error', database: 'disconnected' },
      { status: 503 },
    );
  }
}
