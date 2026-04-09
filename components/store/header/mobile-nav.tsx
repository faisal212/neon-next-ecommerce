'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface MobileNavProps {
  links: { label: string; href: string }[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Open menu"
          className="text-on-surface-variant hover:text-primary transition-colors p-2"
        >
          <Menu size={20} />
        </SheetTrigger>
        <SheetContent side="left" className="bg-surface border-outline-variant/10">
          <SheetHeader>
            <SheetTitle className="text-white font-black tracking-tighter text-xl">
              Cover
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-on-surface-variant hover:text-white transition-colors text-sm py-3 border-b border-outline-variant/10 last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
