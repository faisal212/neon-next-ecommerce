'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
          className="p-2 text-on-surface-variant transition-colors hover:text-primary"
        >
          <Menu size={20} />
        </SheetTrigger>
        <SheetContent side="left" className="border-outline-variant/10 bg-surface">
          <SheetHeader>
            <SheetTitle>
              <Image src="/logo.svg" alt="Refine" width={120} height={32} className="h-7 w-auto" />
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-outline-variant/10 py-3 text-sm text-on-surface-variant transition-colors last:border-b-0 hover:text-white"
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
