import type { Recommendation } from '@/lib/api-client';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const BREAKDOWN_LABELS: Record<string, string> = {
  categoryMatch: 'Categoría',
  colorMatch: 'Color',
  styleMatch: 'Estilo de la prenda',
  storeStyleMatch: 'Estilo de la tienda',
  priceCompatibility: 'Presupuesto',
  sizeAvailability: 'Talla disponible',
  nationalProximity: 'Disponibilidad nacional',
  visualMatchScore: 'Similitud visual (0-100)',
  reason: 'Motivo (IA visual)',
};

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { productName, storeUrl, price, imageUrl, score, scoreBreakdown } = recommendation;
  const matchPercent = Math.round(score * 100);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-rose-100 bg-white shadow-sm shadow-rose-100/50">
      <div className="aspect-square w-full bg-slate-50">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={productName ?? 'Producto'} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm font-medium text-slate-900">
          {productName ?? 'Producto sin nombre'}
        </p>

        <p className="text-sm font-semibold text-slate-900">
          {price !== null ? currencyFormatter.format(price) : 'Precio no disponible'}
        </p>

        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${matchPercent}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-xs font-medium text-slate-500">
            Match: {matchPercent}%
          </span>
        </div>

        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer select-none">Ver detalle del match</summary>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {Object.entries(scoreBreakdown).map(([key, value]) => (
              <li key={key} className="flex justify-between gap-3">
                <span className="flex-shrink-0">{BREAKDOWN_LABELS[key] ?? key}</span>
                <span className="text-right">
                  {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}
                </span>
              </li>
            ))}
          </ul>
        </details>

        {storeUrl && (
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver en tienda
          </a>
        )}
      </div>
    </div>
  );
}
