'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Inicio' },
  { href: '/timeline', icon: '📅', label: 'Semanas' },
  { href: '/health', icon: '💊', label: 'Salud' },
  { href: '/journal', icon: '📓', label: 'Diario' },
  { href: '/tools', icon: '🧰', label: 'Tools' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-warm-50 pb-20 md:pb-0 md:pl-20">
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-warm-100 flex-col items-center py-6 z-50">
        <Link href="/dashboard" className="text-2xl mb-8">🤰</Link>
        <div className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={cn(
                'w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs transition-all',
                pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-warm-400 hover:bg-warm-50 hover:text-warm-600'
              )}>
              <span className="text-lg mb-0.5">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        <Link href="/profile"
          className={cn(
            'w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs transition-all',
            pathname === '/profile' ? 'bg-brand-50 text-brand-600' : 'text-warm-400 hover:bg-warm-50'
          )}>
          <span className="text-lg mb-0.5">👤</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-warm-100 flex items-center justify-around py-1.5 px-2 z-50">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={cn(
              'flex flex-col items-center py-1.5 px-2 rounded-xl transition-all min-w-[52px]',
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                ? 'text-brand-600'
                : 'text-warm-400'
            )}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-medium mt-0.5">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Content */}
      <main className="min-h-screen">{children}</main>
    </div>
  );
}