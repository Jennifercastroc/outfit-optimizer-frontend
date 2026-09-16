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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-sky-50 p-6">
        <p className="text-sm text-slate-500">Cargando...</p>
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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-sky-50 p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl">
        <ModeNav />

        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
              Tablero de looks
            </span>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Analiza tu tablero y recibe recomendaciones
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex max-w-xl flex-col gap-4 rounded-2xl border border-rose-100 bg-white/80 p-6 shadow-sm shadow-rose-100"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="images" className="text-sm font-medium text-slate-700">
              Imágenes *
            </label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-rose-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-rose-600 hover:file:bg-rose-100 focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {previews.map((url, idx) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
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
            <label htmlFor="city" className="text-sm font-medium text-slate-700">
              Ciudad *
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg border border-rose-100 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="gender" className="text-sm font-medium text-slate-700">
              Género *
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="rounded-lg border border-rose-100 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
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
            <label htmlFor="budget" className="text-sm font-medium text-slate-700">
              Presupuesto
            </label>
            <input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="rounded-lg border border-rose-100 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="size" className="text-sm font-medium text-slate-700">
              Talla
            </label>
            <input
              id="size"
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="rounded-lg border border-rose-100 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-rose-500 px-4 py-2.5 font-medium text-white shadow-sm shadow-rose-200 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Analizando...' : 'Analizar tablero'}
          </button>
        </form>

        {loading && (
          <div className="mt-4 flex max-w-xl items-center gap-3 rounded-lg border border-sky-100 bg-sky-50 px-3 py-3">
            <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
            <p className="text-sm text-sky-700">
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 max-w-xl rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        {result !== null && (
          <div className="mt-6 flex flex-col gap-6">
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
              <p className="text-lg leading-relaxed text-sky-950">
                {result.styleNarrative}
              </p>
            </div>

            {result.accessoryRecommendation !== '' && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl leading-none">💡</span>
                  <h2 className="text-base font-semibold text-amber-900">
                    Recomendación de accesorio
                  </h2>
                </div>
                <p className="text-base leading-relaxed text-amber-900">
                  {result.accessoryRecommendation}
                </p>
              </div>
            )}

            {result.essentialCategories.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Prendas esenciales detectadas
                </h2>
                {result.essentialCategories.map((cat, idx) => {
                  const isOwned = !!ownedCategories[idx];
                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/50"
                    >
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {cat.specificDescription}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Aparece en el {Math.round(cat.imageFrequency * 100)}% de tus looks ·{' '}
                          {cat.color} · {cat.material} · {cat.pattern}
                        </p>
                      </div>

                      {cat.exampleImageIndexes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {cat.exampleImageIndexes.map((imgIdx) => (
                            <div
                              key={imgIdx}
                              className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200"
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

                      <label className="flex w-fit items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={isOwned}
                          onChange={() => toggleOwned(idx)}
                          className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-200"
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
                          <p className="text-sm text-slate-500">
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
      </div>
    </main>
  );
}
