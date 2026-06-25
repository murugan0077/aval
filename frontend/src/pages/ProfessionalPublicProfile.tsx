import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import {
  ArrowLeft, Star, ShieldCheck, MapPin, Briefcase,
  Crown, Zap, Clock, ChevronRight, Quote,
} from 'lucide-react';

export default function ProfessionalPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prof, setProf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getProfessional(id)
      .then(setProf)
      .catch((err) => setError(err.message || 'Profile not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout title="Professional Profile" showBack>
        <div className="animate-pulse space-y-4">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (error || !prof) {
    return (
      <Layout title="Not Found" showBack>
        <div className="text-center py-12">
          <p className="text-gray-500 font-medium">{error || 'Professional not found'}</p>
          <button onClick={() => navigate('/search')} className="btn-secondary mt-4">Back to Search</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Professional Profile" showBack>
      {/* Profile Card */}
      <div className="card mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-600">
            {prof.user?.name?.[0] || 'P'}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">{prof.user?.name}</h2>
            <p className="text-sm text-gray-500">{prof.skillCategory || 'Service Professional'}</p>
            {prof.verificationBadge && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" /> {prof.verificationBadge}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Star className="w-4 h-4 text-yellow-500 shrink-0" />
            <span>{prof.averageRating?.toFixed(1)} <span className="text-gray-400">({prof._count?.reviews || prof.totalReviews || 0} reviews)</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>{prof.yearsOfExperience} yrs experience</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{prof.serviceRadiusKm} km radius</span>
          </div>
          <div className="flex items-center gap-2">
            {prof.premiumTier === 'FEATURED' && (
              <span className="badge-yellow flex items-center gap-1"><Crown className="w-3 h-3" /> Featured</span>
            )}
            {prof.premiumTier === 'PRO' && (
              <span className="badge-blue flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Pro</span>
            )}
          </div>
        </div>

        {prof.availabilityNow && (
          <div className="flex items-center gap-1 text-green-600 text-sm mb-3">
            <Zap className="w-4 h-4" /> Available Now
          </div>
        )}
      </div>

      {/* Description */}
      {prof.description && (
        <div className="card mb-4">
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{prof.description}</p>
        </div>
      )}

      {/* Skills */}
      {prof.subSkills && prof.subSkills.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-semibold mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {prof.subSkills.map((s: string) => (
              <span key={s} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Services & Pricing</h3>
        <div className="space-y-2">
          {prof.serviceListings?.length > 0 ? (
            prof.serviceListings.map((listing: any) => (
              <div key={listing.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium">{listing.category?.name || 'Service'}</p>
                  {listing.subCategory && (
                    <p className="text-sm text-gray-500">{listing.subCategory.name}</p>
                  )}
                </div>
                <div className="text-right">
                  {listing.price ? (
                    <p className="font-semibold text-brand-600">₹{listing.price}</p>
                  ) : (
                    <p className="text-sm text-gray-400">Custom quote</p>
                  )}
                  <p className="text-xs text-gray-400">{listing.priceUnit}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No services listed yet.</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      {prof.reviews && prof.reviews.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Reviews ({prof.reviews.length})</h3>
          <div className="space-y-2">
            {prof.reviews.map((review: any) => (
              <div key={review.id} className="card">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{review.isAnonymous ? 'Anonymous' : review.userName || 'Customer'}</span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book Now CTA */}
      <div className="sticky bottom-20 bg-white -mx-4 px-4 py-3 border-t border-gray-100">
        <button
          onClick={() => navigate(`/book/${prof.id}`)}
          className="btn-primary w-full py-3"
        >
          Book Now — {prof.serviceListings?.[0]?.price ? `₹${prof.serviceListings[0].price} ${prof.serviceListings[0].priceUnit}` : 'Get Quote'}
        </button>
      </div>
    </Layout>
  );
}
