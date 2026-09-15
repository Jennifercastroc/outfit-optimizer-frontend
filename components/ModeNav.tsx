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
    <nav className="mb-6 flex gap-2 text-sm">
      {MODES.map((mode) => {
        const isActive = pathname === mode.href;
        return (
          <Link
            key={mode.href}
            href={mode.href}
            className={
              isActive
                ? 'rounded border border-gray-900 px-3 py-1 font-medium text-gray-900 dark:border-gray-100 dark:text-gray-100'
                : 'rounded border border-gray-300 px-3 py-1 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
            }
          >
            {mode.label}
          </Link>
        );
      })}
    </nav>
  );
}
