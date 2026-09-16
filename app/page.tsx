'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/board' : '/login');
    }
  }, [loading, router, user]);

  return (
    <main className="mx-auto max-w-xl p-6">
      <p className="text-sm">Cargando...</p>
    </main>
  );
}
