import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import { BookingCard } from '../components/ui/BookingCard';
import type { Booking } from '../types';
import { Search } from 'lucide-react';

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.getBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Upcoming' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <Layout title="My Bookings" className="bg-slate-50/50 min-h-screen">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                filter === tab.key 
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-200' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-5 bg-slate-200/50 rounded-lg w-1/3" />
                  <div className="h-6 bg-slate-200/50 rounded-md w-16" />
                </div>
                <div className="h-4 bg-slate-200/50 rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-slate-200/50 rounded-lg w-1/2 mb-5" />
                <div className="flex gap-3">
                  <div className="h-6 bg-slate-200/50 rounded-md w-16" />
                  <div className="h-6 bg-slate-200/50 rounded-md w-16" />
                  <div className="h-6 bg-slate-200/50 rounded-md w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm mt-4">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-5">
              <Search className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-500 mb-6 max-w-sm">
              {filter === 'all' 
                ? "You haven't made any bookings yet. Find the right professional for your needs." 
                : `You don't have any ${tabs.find(t => t.key === filter)?.label.toLowerCase()} bookings.`}
            </p>
            <button 
              onClick={() => navigate('/search')} 
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-200 transition-all active:scale-95"
            >
              Explore Services
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => navigate(`/booking/${booking.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
