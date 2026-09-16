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
      router.push('/analyze');
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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-white to-indigo-50 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/50">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">
          {mode === 'signIn' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h1>

        <div className="mb-6 flex gap-1 rounded-full bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode('signIn')}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium transition ${
              mode === 'signIn'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('signUp')}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium transition ${
              mode === 'signUp'
                ? 'bg-white text-indigo-600 shadow-sm'
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
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
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
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Procesando...'
              : mode === 'signIn'
                ? 'Iniciar sesión'
                : 'Crear cuenta'}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        {info && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {info}
          </p>
        )}

        <button
          type="button"
          onClick={toggleMode}
          className="mt-4 text-sm text-indigo-600 underline-offset-2 hover:underline"
        >
          {mode === 'signIn' ? '¿No tienes cuenta? Créala' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </main>
  );
}
