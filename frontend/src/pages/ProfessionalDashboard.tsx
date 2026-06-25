import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/ui/Layout';
import { BookingCard } from '../components/ui/BookingCard';
import {
  Star, TrendingUp, Users, Calendar, IndianRupee,
  Crown, ShieldCheck, Bell, ChevronRight,
} from 'lucide-react';

export default function ProfessionalDashboard() {
  const { user, professional, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [upgradeInfo, setUpgradeInfo] = useState<any>(null);

  useEffect(() => {
    api.getBookings().then(setBookings).catch(() => {});
    api.checkUpgradeEligibility().then(setUpgradeInfo).catch(() => {});
  }, []);

  const activeBookings = bookings.filter(
    (b) => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status)
  );
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalEarnings = bookings
    .filter((b) => b.payment?.status === 'RELEASED')
    .reduce((sum, b) => sum + (b.payment?.professionalEarning || 0), 0);

  if (!professional?.isProfileComplete) {
    return (
      <Layout title="Dashboard">
        <div className="text-center py-12">
          <ShieldCheck className="w-16 h-16 text-brand-300 mx-auto mb-4" />
          <h2 className="font-semibold text-lg mb-2">Complete Your Profile</h2>
          <p className="text-gray-500 text-sm mb-4">Finish setting up your profile to start receiving bookings.</p>
          <button onClick={() => navigate('/professional/onboarding')} className="btn-primary">
            Complete Profile
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      {/* Welcome Card */}
      <div className="card bg-gradient-to-r from-brand-600 to-brand-800 text-white mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-brand-100 text-sm">Welcome back,</p>
            <h2 className="text-xl font-bold">{user?.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-brand-200 text-xs">Rating</p>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-lg">{professional.averageRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        {professional.verificationBadge && (
          <p className="text-xs text-green-300 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> {professional.verificationBadge}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card text-center">
          <Calendar className="w-5 h-5 text-brand-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{activeBookings.length}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="card text-center">
          <Users className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{completedCount}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="card text-center">
          <IndianRupee className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <p className="text-xl font-bold">₹{totalEarnings}</p>
          <p className="text-xs text-gray-500">Earned</p>
        </div>
      </div>

      {/* Premium Upsell */}
      {upgradeInfo?.eligible && (
        <div className="card border-yellow-200 bg-yellow-50 mb-4">
          <div className="flex items-start gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="font-semibold text-sm">{upgradeInfo.message}</p>
              <button
                onClick={() => navigate('/premium')}
                className="text-brand-600 text-sm font-medium mt-1 flex items-center gap-1"
              >
                Upgrade Now <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Alert */}
      {professional.averageRating > 0 && professional.averageRating < 3.5 && (
        <div className="card border-red-200 bg-red-50 mb-4">
          <div className="flex items-center gap-2 text-red-700">
            <Star className="w-5 h-5" />
            <p className="text-sm font-medium">
              Your rating has dropped to {professional.averageRating.toFixed(1)}. Focus on quality to improve your rating.
            </p>
          </div>
        </div>
      )}

      {/* Active Bookings */}
      <h3 className="font-semibold mb-3">Active Bookings</h3>
      {activeBookings.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No active bookings. Keep your availability updated!</p>
      ) : (
        <div className="space-y-3">
          {activeBookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onClick={() => navigate(`/booking/${b.id}`)}
            />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button onClick={() => navigate('/professional/bookings')} className="card text-center">
          <Calendar className="w-5 h-5 text-brand-500 mx-auto mb-1" />
          <span className="text-sm font-medium">All Bookings</span>
        </button>
        <button onClick={() => navigate('/premium')} className="card text-center">
          <Crown className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <span className="text-sm font-medium">Premium Plans</span>
        </button>
      </div>
    </Layout>
  );
}
