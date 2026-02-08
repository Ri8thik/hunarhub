import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ rating, size = 14, showValue = true, reviewCount, interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            className={cn(!interactive && 'cursor-default')}
          >
            <Star
              size={size}
              className={cn(
                star <= Math.round(rating)
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-stone-300'
              )}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-stone-700 ml-0.5">{rating.toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-stone-400">({reviewCount})</span>
      )}
    </div>
  );
}
