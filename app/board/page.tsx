'use client';

import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeBoard, type AnalyzeBoardResponse, type Gender } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { RecommendationCard } from '@/components/RecommendationCard';
import { ModeNav } from '@/components/ModeNav';

const LOADING_MESSAGES = [
  'Analizando tu tablero con IA...',
  'Esto puede tardar unos 15 segundos con varias imágenes...',
  'Buscando patrones en tus looks...',
  'Buscando en Undergold, Bao Bao, Herpo y más tiendas...',
  'Rankeando las mejores opciones...',
  'Ya casi está listo...',
];

export default function BoardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [images, setImages] = useState<File[]>([]);
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [budget, setBudget] = useState('');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeBoardResponse | null>(null);
  const [ownedCategories, setOwnedCategories] = useState<Record<number, boolean>>({});

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

  const previews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

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

  function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      setImages(files);
    }
    e.target.value = '';
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleOwned(index: number) {
    setOwnedCategories((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (images.length === 0 || !city || !gender) {
      setError('Sube al menos una imagen, escribe la ciudad y selecciona el género.');
      return;
    }

    setLoading(true);
    setLoadingMessageIndex(0);
    setResult(null);
    setOwnedCategories({});

    try {
      const data = await analyzeBoard({
        images,
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
      <h1 className="text-2xl font-semibold mb-6">Analizar tablero de looks</h1>

      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="images" className="text-sm font-medium">
            Imágenes *
          </label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="border rounded px-3 py-2"
          />
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {previews.map((url, idx) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded border border-gray-200 dark:border-gray-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Imagen ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  aria-label={`Quitar imagen ${idx + 1}`}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs leading-none text-white hover:bg-black/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

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
          {loading ? 'Analizando...' : 'Analizar tablero'}
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
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950/40">
            <p className="text-lg leading-relaxed text-indigo-950 dark:text-indigo-100">
              {result.styleNarrative}
            </p>
          </div>

          {result.accessoryRecommendation !== '' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl leading-none">💡</span>
                <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200">
                  Recomendación de accesorio
                </h2>
              </div>
              <p className="text-base leading-relaxed text-amber-900 dark:text-amber-200">
                {result.accessoryRecommendation}
              </p>
            </div>
          )}

          {result.essentialCategories.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Prendas esenciales detectadas
              </h2>
              {result.essentialCategories.map((cat, idx) => {
                const isOwned = !!ownedCategories[idx];
                return (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {cat.specificDescription}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Aparece en el {Math.round(cat.imageFrequency * 100)}% de tus looks ·{' '}
                        {cat.color} · {cat.material} · {cat.pattern}
                      </p>
                    </div>

                    {cat.exampleImageIndexes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {cat.exampleImageIndexes.map((imgIdx) => (
                          <div
                            key={imgIdx}
                            className="h-20 w-20 flex-shrink-0 overflow-hidden rounded border border-gray-200 dark:border-gray-800"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={result.images[imgIdx]}
                              alt={`Ejemplo de ${cat.category}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <label className="flex w-fit items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={isOwned}
                        onChange={() => toggleOwned(idx)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      Ya tengo esto en mi clóset
                    </label>

                    {!isOwned &&
                      (cat.recommendations.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {cat.recommendations.map((recommendation, recIdx) => (
                            <RecommendationCard
                              key={recIdx}
                              recommendation={recommendation}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No encontramos opciones disponibles ahora mismo.
                        </p>
                      ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
