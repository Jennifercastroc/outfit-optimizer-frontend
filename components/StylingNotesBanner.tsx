import type { AccessoryDetected } from '@/lib/api-client';

interface StylingNotesBannerProps {
  accessoriesDetected: AccessoryDetected[];
  stylingNotes: string;
}

export function StylingNotesBanner({ accessoriesDetected, stylingNotes }: StylingNotesBannerProps) {
  const hasNotes = stylingNotes.trim().length > 0;
  const hasAccessories = accessoriesDetected.length > 0;

  if (!hasNotes && !hasAccessories) {
    return null;
  }

  return (
    <div className="flex gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/40">
      <span className="text-xl leading-none">✨</span>
      <div className="flex flex-col gap-1.5 text-sm">
        {hasNotes && <p className="text-indigo-950 dark:text-indigo-100">{stylingNotes}</p>}
        {hasAccessories && (
          <p className="text-indigo-800 dark:text-indigo-300">
            <span className="font-medium">Accesorios detectados en este look:</span>{' '}
            {accessoriesDetected
              .map((accessory) => `${accessory.category} (${accessory.color})`)
              .join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
