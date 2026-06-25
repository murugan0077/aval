import { Calendar, MapPin, Clock, IndianRupee } from 'lucide-react';
import type { Booking } from '../../types';

interface Props {
  booking: Booking;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  PENDING: 'badge-yellow',
  CONFIRMED: 'badge-blue',
  IN_PROGRESS: 'badge-blue',
  COMPLETED: 'badge-green',
  CANCELLED: 'badge-red',
  RESCHEDULED: 'badge-yellow',
};

export function BookingCard({ booking, onClick }: Props) {
  return (
    <div
      className="card hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold">{booking.categoryName}</h3>
          {booking.subCategoryName && (
            <p className="text-sm text-gray-500">{booking.subCategoryName}</p>
          )}
        </div>
        <span className={statusColors[booking.status] || 'badge'}>
          {booking.status.replace('_', ' ')}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{booking.jobDescription}</p>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {booking.scheduledDate
            ? new Date(booking.scheduledDate).toLocaleDateString()
            : 'ASAP'}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {booking.city}
        </span>
        <span className="flex items-center gap-1">
          <IndianRupee className="w-3.5 h-3.5" />
          {booking.estimatedCost}
        </span>
      </div>

      {booking.bookingId && (
        <p className="text-xs text-gray-400 mt-2">ID: {booking.bookingId}</p>
      )}
    </div>
  );
}
