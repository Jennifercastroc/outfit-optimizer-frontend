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
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={productName ?? 'Producto'} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {productName ?? 'Producto sin nombre'}
        </p>

        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {price !== null ? currencyFormatter.format(price) : 'Precio no disponible'}
        </p>

        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${matchPercent}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-xs font-medium text-gray-600 dark:text-gray-400">
            Match: {matchPercent}%
          </span>
        </div>

        <details className="text-xs text-gray-500 dark:text-gray-400">
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
            className="mt-1 rounded border border-gray-300 px-3 py-1.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Ver en tienda
          </a>
        )}
      </div>
    </div>
  );
}
