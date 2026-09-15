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
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {mode === 'signIn' ? 'Iniciar sesión' : 'Crear cuenta'}
      </h1>

      <div className="flex gap-2 mb-6 text-sm">
        <button
          type="button"
          onClick={() => setMode('signIn')}
          className={`px-3 py-1 rounded border ${
            mode === 'signIn' ? 'font-semibold border-black' : 'border-gray-300'
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode('signUp')}
          className={`px-3 py-1 rounded border ${
            mode === 'signUp' ? 'font-semibold border-black' : 'border-gray-300'
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="border rounded px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Procesando...'
            : mode === 'signIn'
              ? 'Iniciar sesión'
              : 'Crear cuenta'}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600 border border-red-300 rounded px-3 py-2">
          {error}
        </p>
      )}

      {info && (
        <p className="mt-4 text-sm text-green-700 border border-green-300 rounded px-3 py-2">
          {info}
        </p>
      )}

      <button
        type="button"
        onClick={toggleMode}
        className="mt-4 text-sm underline text-gray-600"
      >
        {mode === 'signIn' ? '¿No tienes cuenta? Créala' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </main>
  );
}
