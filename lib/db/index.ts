import { neon, Pool } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePool } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// HTTP driver — stateless, for reads and simple writes
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzleHttp(sql, { schema });

// Pool driver — for transactions (order placement, inventory reservation)
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const dbPool = drizzlePool(pool, { schema });

export { sql, pool };
