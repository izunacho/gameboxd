import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

export default function RatingDisplay({
  rating,
  maxRating = 100,
  size = 'md',
  showValue = true,
  interactive = false,
  onRatingChange,
}: RatingDisplayProps) {
  const normalizedRating = (rating / maxRating) * 5;
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      const newRating = (starIndex / 5) * maxRating;
      onRatingChange(newRating);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {stars.map((star) => {
          const isFilled = star <= normalizedRating;
          const isPartial = star - normalizedRating > 0 && star - normalizedRating < 1;

          return (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              disabled={!interactive}
              className={`transition-all ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled ? 'fill-primary text-primary' : isPartial ? 'text-primary' : 'text-dark-border'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showValue && <span className="text-sm text-dark-text">{Math.round(rating)}/100</span>}
    </div>
  );
}
