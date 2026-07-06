import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/ui/Layout';
import { BookingCard } from '../components/ui/BookingCard';
import {
  Star, TrendingUp, Users, Calendar, IndianRupee,
  Crown, ShieldCheck, Bell, ChevronRight, Briefcase
} from 'lucide-react';

export default function ProfessionalDashboard() {
  const { user, professional, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [upgradeInfo, setUpgradeInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getBookings().then(setBookings).catch(() => {}),
      api.checkUpgradeEligibility().then(setUpgradeInfo).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  const activeBookings = bookings.filter(
    (b) => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status)
  );
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalEarnings = bookings
    .filter((b) => b.payment?.status === 'RELEASED')
    .reduce((sum, b) => sum + (b.payment?.professionalEarning || 0), 0);

  if (loading) {
    return (
      <Layout title="Dashboard" className="bg-slate-50/50 min-h-screen">
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          <div className="h-32 bg-slate-200/50 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-28 bg-slate-200/50 rounded-3xl animate-pulse" />
            <div className="h-28 bg-slate-200/50 rounded-3xl animate-pulse" />
            <div className="h-28 bg-slate-200/50 rounded-3xl animate-pulse" />
          </div>
          <div className="h-40 bg-slate-200/50 rounded-3xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!professional?.isProfileComplete) {
    return (
      <Layout title="Dashboard" className="bg-slate-50/50 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-brand-400 rounded-full animate-ping opacity-20"></div>
            <ShieldCheck className="w-12 h-12 text-brand-600" />
          </div>
          <h2 className="font-extrabold text-2xl text-slate-900 mb-3">Complete Your Profile</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Finish setting up your professional profile to start receiving bookings and growing your business.
          </p>
          <button 
            onClick={() => navigate('/professional/onboarding')} 
            className="w-full py-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200/50 transition-all active:scale-[0.98]"
          >
            Complete Profile Now
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" className="bg-slate-50/50 min-h-screen pb-24">
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-3xl p-6 shadow-xl shadow-brand-200/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-brand-100 text-sm font-medium mb-1">Welcome back,</p>
              <h2 className="text-2xl font-bold tracking-tight">{user?.name}</h2>
              {professional.verificationBadge && (
                <p className="text-xs text-emerald-300 mt-2 flex items-center gap-1.5 font-medium bg-emerald-500/20 w-max px-2 py-1 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> {professional.verificationBadge}
                </p>
              )}
            </div>
            <div className="text-right bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <p className="text-brand-100 text-[10px] font-bold uppercase tracking-wider mb-1">Rating</p>
              <div className="flex items-center gap-1.5 justify-end">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-md" />
                <span className="font-extrabold text-xl">{professional.averageRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 text-center transition-all hover:shadow-md hover:-translate-y-1">
            <div className="w-10 h-10 mx-auto bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{activeBookings.length}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active</p>
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 text-center transition-all hover:shadow-md hover:-translate-y-1">
            <div className="w-10 h-10 mx-auto bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{completedCount}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Done</p>
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 text-center transition-all hover:shadow-md hover:-translate-y-1">
            <div className="w-10 h-10 mx-auto bg-amber-50 rounded-xl flex items-center justify-center mb-3">
              <IndianRupee className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">₹{totalEarnings > 1000 ? `${(totalEarnings/1000).toFixed(1)}k` : totalEarnings}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Earned</p>
          </div>
        </div>

        {/* Premium Upsell */}
        {upgradeInfo?.eligible && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-5 border border-amber-200 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-200 opacity-20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-amber-100">
                <Crown className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Boost Your Profile</h3>
                <p className="font-medium text-slate-600 text-sm mb-3 leading-relaxed">{upgradeInfo.message}</p>
                <button
                  onClick={() => navigate('/premium')}
                  className="bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-slate-800 transition-colors active:scale-95 w-max"
                >
                  Upgrade Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Alert */}
        {professional.averageRating > 0 && professional.averageRating < 3.5 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="bg-white rounded-full p-1.5 shrink-0 shadow-sm border border-rose-100 mt-0.5">
              <Star className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>
            <div>
              <h4 className="font-bold text-rose-900 text-sm mb-0.5">Rating Alert</h4>
              <p className="text-sm font-medium text-rose-700 leading-relaxed">
                Your rating is currently {professional.averageRating.toFixed(1)}. Focus on delivering quality service to improve your visibility.
              </p>
            </div>
          </div>
        )}

        {/* Active Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-lg text-slate-900">Active Bookings</h3>
            <button onClick={() => navigate('/professional/bookings')} className="text-sm font-bold text-brand-600 hover:text-brand-700">
              View All
            </button>
          </div>
          
          {activeBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-semibold text-slate-900 mb-1">No Active Jobs</p>
              <p className="text-sm text-slate-500">You're all caught up. Keep your availability updated!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onClick={() => navigate(`/booking/${b.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => navigate('/professional/bookings')} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
              <Calendar className="w-6 h-6 text-brand-600" />
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-brand-700">All Bookings</span>
          </button>
          <button onClick={() => navigate('/premium')} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700">Premium Plans</span>
          </button>
        </div>
      </div>
    </Layout>
  );
}
