import Link from 'next/link';
import Image from 'next/image';
import { SearchTrigger } from './search-trigger';
import { CartTrigger } from './cart-trigger';
import { UserMenu } from './user-menu';
import { MobileNav } from './mobile-nav';
import { getNavCategories } from '@/lib/services/category.service';

export async function StoreHeader() {
  const links = await getNavCategories();

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/10 bg-[#0E0E0E]/80 shadow-[0_0_40px_rgba(255,103,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 md:px-6">
        {/* Left: Brand + Mobile menu */}
        <div className="flex items-center gap-2">
          <MobileNav links={links} />
          <Link href="/" aria-label="Refine home">
            <Image
              src="/logo.svg"
              alt="Refine"
              width={140}
              height={36}
              priority
              fetchPriority="high"
              className="h-7 w-auto sm:h-8"
            />
          </Link>
        </div>

        {/* Center: Desktop navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-on-surface-variant transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <SearchTrigger />
          <CartTrigger />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
