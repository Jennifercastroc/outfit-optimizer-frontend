'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeOutfit, type AnalyzeOutfitResponse, type Gender } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { StylingNotesBanner } from '@/components/StylingNotesBanner';
import { OutfitItemCard } from '@/components/OutfitItemCard';
import { ModeNav } from '@/components/ModeNav';

const LOADING_MESSAGES = [
  'Analizando tu outfit con IA...',
  'Buscando en Undergold, Bao Bao, Herpo y más tiendas...',
  'Comparando precios y disponibilidad...',
  'Rankeando las mejores opciones...',
  'Ya casi está listo...',
];

export default function AnalyzePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [image, setImage] = useState<File | null>(null);
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [budget, setBudget] = useState('');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeOutfitResponse | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!loading) {
      return;
    }
    const interval = setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  if (authLoading) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <p className="text-sm">Cargando...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!image || !city || !gender) {
      setError('La imagen, la ciudad y el género son obligatorios.');
      return;
    }

    setLoading(true);
    setLoadingMessageIndex(0);
    setResult(null);

    try {
      const data = await analyzeOutfit({
        image,
        city,
        gender,
        budget: budget ? Number(budget) : undefined,
        size: size || undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <ModeNav />
      <h1 className="text-2xl font-semibold mb-6">Analizar outfit</h1>

      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="image" className="text-sm font-medium">
            Imagen *
          </label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="city" className="text-sm font-medium">
            Ciudad *
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="gender" className="text-sm font-medium">
            Género *
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="border rounded px-3 py-2"
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="mujer">Mujer</option>
            <option value="hombre">Hombre</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="budget" className="text-sm font-medium">
            Presupuesto
          </label>
          <input
            id="budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="size" className="text-sm font-medium">
            Talla
          </label>
          <input
            id="size"
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="border rounded px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analizando...' : 'Analizar outfit'}
        </button>
      </form>

      {loading && (
        <div className="mt-4 flex max-w-xl items-center gap-3 rounded border border-gray-200 px-3 py-3 dark:border-gray-800">
          <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-300" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {LOADING_MESSAGES[loadingMessageIndex]}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 max-w-xl text-sm text-red-600 border border-red-300 rounded px-3 py-2">
          {error}
        </p>
      )}

      {result !== null && (
        <div className="mt-6 flex flex-col gap-6">
          <StylingNotesBanner
            accessoriesDetected={result.analysis.accessories_detected}
            stylingNotes={result.analysis.styling_notes}
          />

          <div className="flex flex-col gap-4">
            {result.items.map((item) => (
              <OutfitItemCard key={item.outfitItemId} item={item} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
