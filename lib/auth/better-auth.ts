import { betterAuth } from 'better-auth';
import { Pool } from '@neondatabase/serverless';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL! }),
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});
