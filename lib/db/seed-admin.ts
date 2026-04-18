import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { adminUsers } from './schema/users';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!;

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD!;
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'Admin';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Error: Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local');
  process.exit(1);
}

async function seedAdmin() {
  console.log('Creating admin user...');
  console.log(`  Email: ${ADMIN_EMAIL}`);

  // Step 1: Sign up via Neon Auth API
  const signUpRes = await fetch(`${NEON_AUTH_BASE_URL}/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
    }),
  });

  const signUpData = await signUpRes.json();

  if (!signUpRes.ok) {
    // Check if user already exists
    if (signUpData?.code === 'USER_ALREADY_EXISTS' || signUpRes.status === 422) {
      console.log('  User already exists in Neon Auth, looking up...');

      // Sign in to get the user ID
      const signInRes = await fetch(`${NEON_AUTH_BASE_URL}/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      });

      if (!signInRes.ok) {
        console.error('  Failed to sign in:', await signInRes.text());
        process.exit(1);
      }

      const signInData = await signInRes.json();
      const authUserId = signInData.user?.id;

      if (!authUserId) {
        console.error('  Could not get user ID from sign-in response:', signInData);
        process.exit(1);
      }

      await upsertAdmin(authUserId);
      return;
    }

    console.error('  Sign-up failed:', signUpData);
    process.exit(1);
  }

  const authUserId = signUpData.user?.id;
  if (!authUserId) {
    console.error('  Could not get user ID from sign-up response:', signUpData);
    process.exit(1);
  }

  console.log(`  Auth user created: ${authUserId}`);

  // Wait briefly for neon_auth.user sync
  await new Promise((r) => setTimeout(r, 2000));

  await upsertAdmin(authUserId);
}

async function upsertAdmin(authUserId: string) {
  // Step 2: Insert admin_users record
  const [admin] = await db
    .insert(adminUsers)
    .values({
      authUserId,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'super_admin',
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  if (admin) {
    console.log(`  Admin record created: ${admin.id}`);
  } else {
    console.log('  Admin record already exists');
  }

  console.log('\nAdmin user ready!');
  console.log(`  Login at: http://localhost:3000/admin/login`);
  console.log(`  Email: ${ADMIN_EMAIL}`);
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});
