import Link from 'next/link';
import { SearchTrigger } from './search-trigger';
import { CartTrigger } from './cart-trigger';
import { UserMenu } from './user-menu';
import { MobileNav } from './mobile-nav';
import { getNavCategories } from '@/lib/services/category.service';

export async function StoreHeader() {
  const links = await getNavCategories();

  return (
    <header className="sticky top-0 z-50 bg-[#0E0E0E]/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-[0_0_40px_rgba(255,103,0,0.04)]">
      <div className="mx-auto max-w-[1440px] flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left: Brand + Mobile menu */}
        <div className="flex items-center gap-2">
          <MobileNav links={links} />
          <Link href="/" className="text-2xl font-black text-white tracking-tighter">
            Cover
          </Link>
        </div>

        {/* Center: Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-on-surface-variant hover:text-white transition-colors text-sm"
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
