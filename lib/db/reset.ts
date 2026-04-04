import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;
  console.log('Done - public schema reset');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
