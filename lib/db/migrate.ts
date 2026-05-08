/**
 * Apply pending Drizzle migrations against the configured Neon branch.
 *
 * This replaces `drizzle-kit migrate` (which uses the Neon HTTP driver
 * and hangs on multi-statement migrations like 0005). The runtime app
 * on Vercel still uses the HTTP driver via `lib/db/index.ts` — this
 * script only runs locally / in CI when there are migrations to apply.
 *
 * Mechanism: open a single WebSocket-backed connection to Neon, call
 * drizzle's programmatic `migrate()` (which reads the same files
 * drizzle-kit produces under `lib/db/migrations`), then close.
 *
 * Usage:
 *   npm run db:migrate                   # uses .env.local DATABASE_URL
 *   npm run db:migrate -- "postgres://…" # explicit URL (e.g. prod branch)
 *
 * Resolution order: CLI arg > process.env.DATABASE_URL > .env.local.
 * The CLI-arg path is meant for one-off migrations against a non-default
 * branch (typically prod) without having to mutate .env.local.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

// Neon serverless requires a WebSocket constructor in Node.js. Node 22+
// provides one globally; older Nodes would need the `ws` package here.
neonConfig.webSocketConstructor = globalThis.WebSocket;

async function main() {
  const connectionString = process.argv[2] || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set — pass it as an arg or set it in .env.local');
  }

  // Echo the target host so a prod migration is unmistakable. The
  // username/password are stripped — only host[:port] is logged.
  const host = (() => {
    try { return new URL(connectionString).host; } catch { return '<unparseable>'; }
  })();
  console.log(`target: ${host}`);

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  console.log('applying migrations from lib/db/migrations ...');
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  console.log('migrations up to date');

  await pool.end();
}

main().catch((err) => {
  console.error('migration failed:', err);
  process.exit(1);
});
