'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

export function UserMenu() {
  return (
    <Link
      href="/account"
      aria-label="Account"
      className="text-on-surface-variant hover:text-primary transition-colors p-2"
    >
      <User size={20} />
    </Link>
  );
}
