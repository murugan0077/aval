import { Star, MapPin, Zap, ShieldCheck, Crown } from 'lucide-react';
import type { SearchResult } from '../../types';

interface Props {
  result: SearchResult;
  onBook: (id: string) => void;
  onViewProfile: (id: string) => void;
}

export function SearchCard({ result, onBook, onViewProfile }: Props) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{result.name}</h3>
            {result.premiumTier === 'FEATURED' && (
              <span className="badge-yellow flex items-center gap-1 text-xs">
                <Crown className="w-3 h-3" /> Featured
              </span>
            )}
            {result.premiumTier === 'PRO' && (
              <span className="badge-blue flex items-center gap-1 text-xs">
                <ShieldCheck className="w-3 h-3" /> Pro
              </span>
            )}
          </div>

          {result.verificationBadge && (
            <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" /> {result.verificationBadge}
            </p>
          )}

          <p className="text-sm text-gray-500 mt-1">{result.category}</p>

          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" /> {result.rating}
              <span className="text-gray-400">({result.totalReviews})</span>
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-4 h-4" /> {result.distance} km away
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {result.startingPrice ? (
              <span className="font-semibold text-brand-600">
                ₹{result.startingPrice}/{result.priceUnit}
              </span>
            ) : (
              <span className="text-gray-400 text-sm">Custom quote</span>
            )}
            {result.availableNow && (
              <span className="badge-green flex items-center gap-1">
                <Zap className="w-3 h-3" /> Available Now
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onViewProfile(result.id)}
          className="btn-ghost flex-1 text-sm py-2"
        >
          View Profile
        </button>
        <button
          onClick={() => onBook(result.id)}
          className="btn-primary flex-1 text-sm py-2"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
