'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

type Mode = 'signIn' | 'signUp';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === 'signIn') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push('/board');
    } else {
      const { error } = await signUp(email, password);
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setInfo('Revisa tu correo para confirmar la cuenta antes de iniciar sesión.');
    }
  }

  function toggleMode() {
    setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
    setError(null);
    setInfo(null);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-sky-50">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-rose-200/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-100/60 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-6 py-16 lg:flex-row lg:items-center lg:gap-20">
        <div className="flex-1">
          <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
            Outfit Optimizer
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            Tu clóset,{' '}
            <span className="text-rose-500">optimizado</span>{' '}
            con IA
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
            Sube fotos de tus looks y recibe recomendaciones de prendas y accesorios pensadas
            para completar tu estilo.
          </p>

          <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-600">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-base">
                📷
              </span>
              Sube tus outfits o tu tablero de looks
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-base">
                🛍️
              </span>
              Descubre prendas de tus tiendas favoritas
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-base">
                ✨
              </span>
              Arma looks completos con un accesorio ideal
            </li>
          </ul>
        </div>

        <div className="w-full flex-1 lg:max-w-md">
          <h2 className="mb-6 text-2xl font-semibold text-slate-900">
            {mode === 'signIn' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>

          <div className="mb-6 flex w-fit gap-1 rounded-full bg-white/70 p-1 text-sm shadow-sm shadow-rose-100">
            <button
              type="button"
              onClick={() => setMode('signIn')}
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                mode === 'signIn'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('signUp')}
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                mode === 'signUp'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-rose-100 bg-white/70 px-4 py-2.5 text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-rose-100 bg-white/70 px-4 py-2.5 text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-rose-500 px-4 py-2.5 font-medium text-white shadow-sm shadow-rose-200 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Procesando...'
                : mode === 'signIn'
                  ? 'Iniciar sesión'
                  : 'Crear cuenta'}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          {info && (
            <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
              {info}
            </p>
          )}

          <button
            type="button"
            onClick={toggleMode}
            className="mt-4 text-sm text-rose-500 underline-offset-2 hover:underline"
          >
            {mode === 'signIn' ? '¿No tienes cuenta? Créala' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </main>
  );
}
