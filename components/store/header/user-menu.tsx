'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

export function UserMenu() {
  return (
    <Link
      href="/account"
      aria-label="Account"
      className="p-2 text-on-surface-variant transition-colors hover:text-primary"
    >
      <User size={20} />
    </Link>
  );
}
