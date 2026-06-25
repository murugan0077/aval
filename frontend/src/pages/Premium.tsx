import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Crown, ShieldCheck, CheckCircle, TrendingUp, BarChart3, Headphones } from 'lucide-react';

const planFeatures = {
  PRO: {
    name: 'Pro',
    price: 499,
    color: 'blue',
    features: [
      'Priority in search results',
      'Pro badge on profile',
      '10% more visibility',
      'Basic analytics',
    ],
  },
  FEATURED: {
    name: 'Featured',
    price: 999,
    color: 'yellow',
    features: [
      'Top placement in search results',
      'Featured badge with crown icon',
      '50% more visibility',
      'Advanced analytics dashboard',
      'Dedicated support',
      'Early access to new job leads',
    ],
  },
};

export default function PremiumPage() {
  const navigate = useNavigate();
  const { professional, refreshProfile } = useAuth();
  const [plans, setPlans] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getPremiumPlans().then(setPlans).catch(() => {});
  }, []);

  const handleSubscribe = async (tier: string) => {
    setLoading(true);
    try {
      await api.subscribePremium(tier);
      toast.success(`Upgraded to ${tier} tier!`);
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentTier = professional?.premiumTier || 'NONE';

  return (
    <Layout title={currentTier !== 'NONE' ? 'My Plan' : 'Upgrade'}>
      {/* Current Plan */}
      {currentTier !== 'NONE' && (
        <div className="card border-green-200 bg-green-50 mb-4">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="font-semibold text-green-800">
                You're on the {currentTier} plan
              </p>
              <p className="text-sm text-green-600">
                Enjoying premium visibility and features
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Why Upgrade */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3">Why go Premium?</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-medium">More Visibility</p>
            <p className="text-xs text-gray-500">Up to 50% more views</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium">Analytics</p>
            <p className="text-xs text-gray-500">Track your performance</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-xl">
            <Crown className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-sm font-medium">Premium Badge</p>
            <p className="text-xs text-gray-500">Stand out from the crowd</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <Headphones className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-sm font-medium">Priority Support</p>
            <p className="text-xs text-gray-500">Get help faster</p>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="space-y-4">
        {(plans?.plans || Object.entries(planFeatures).map(([k, v]) => ({ tier: k, ...v }))).map((plan: any) => {
          const tier = plan.tier;
          const info = planFeatures[tier as keyof typeof planFeatures] || plan;
          const isCurrent = currentTier === tier;
          const isDowngrade = currentTier !== 'NONE' && currentTier !== tier;

          return (
            <div
              key={tier}
              className={`card border-2 ${
                isCurrent
                  ? 'border-green-400'
                  : tier === 'FEATURED'
                  ? 'border-yellow-300'
                  : 'border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {tier === 'FEATURED' ? (
                    <Crown className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                  )}
                  <h3 className="font-bold text-lg">{info.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">₹{info.price}</p>
                  <p className="text-xs text-gray-400">per month</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {info.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(tier)}
                disabled={isCurrent || loading || isDowngrade}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  isCurrent
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : tier === 'FEATURED'
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                } disabled:opacity-50`}
              >
                {isCurrent ? 'Current Plan' : loading ? 'Processing...' : `Upgrade to ${info.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
