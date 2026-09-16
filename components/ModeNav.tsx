'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MODES = [
  { href: '/analyze', label: 'Una imagen' },
  { href: '/board', label: 'Tablero de looks' },
];

export function ModeNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex w-fit gap-1 rounded-full bg-slate-100 p-1 text-sm">
      {MODES.map((mode) => {
        const isActive = pathname === mode.href;
        return (
          <Link
            key={mode.href}
            href={mode.href}
            className={
              isActive
                ? 'rounded-full bg-white px-3 py-1.5 font-medium text-indigo-600 shadow-sm'
                : 'rounded-full px-3 py-1.5 text-slate-500 hover:text-slate-700'
            }
          >
            {mode.label}
          </Link>
        );
      })}
    </nav>
  );
}
