import { Calendar, MapPin, Clock, IndianRupee } from 'lucide-react';
import type { Booking } from '../../types';

interface Props {
  booking: Booking;
  onClick?: () => void;
}

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200',
  RESCHEDULED: 'bg-orange-100 text-orange-700 border-orange-200',
};

export function BookingCard({ booking, onClick }: Props) {
  const badgeStyle = statusStyles[booking.status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div
      className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-brand-200 cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{booking.categoryName}</h3>
          {booking.subCategoryName && (
            <p className="text-sm text-slate-500 font-medium">{booking.subCategoryName}</p>
          )}
        </div>
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}>
          {booking.status.replace('_', ' ')}
        </span>
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">{booking.jobDescription}</p>

      <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          {booking.scheduledDate
            ? new Date(booking.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : 'ASAP'}
        </span>
        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          {booking.city}
        </span>
        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
          {booking.estimatedCost}
        </span>
      </div>

      {booking.bookingId && (
        <p className="text-[10px] text-slate-400 mt-4 font-mono">ID: {booking.bookingId}</p>
      )}
    </div>
  );
}
