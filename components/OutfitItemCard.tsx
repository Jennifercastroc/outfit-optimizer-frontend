import type { OutfitItem } from '@/lib/api-client';
import { RecommendationCard } from './RecommendationCard';

interface OutfitItemCardProps {
  item: OutfitItem;
}

export function OutfitItemCard({ item }: OutfitItemCardProps) {
  const { category, color, pattern, style, status, recommendations } = item;
  const isOwned = status === 'owned';

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold capitalize text-gray-900 dark:text-gray-100">
            {category} — {color}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {[pattern, style].filter(Boolean).join(' · ')}
          </p>
        </div>

        <span
          className={
            isOwned
              ? 'whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'whitespace-nowrap rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
          }
        >
          {isOwned ? 'Ya la tienes' : 'Te falta'}
        </span>
      </div>

      {!isOwned && (
        <>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.productVariantId}
                  recommendation={recommendation}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No encontramos opciones disponibles ahora mismo.
            </p>
          )}
        </>
      )}
    </div>
  );
}
