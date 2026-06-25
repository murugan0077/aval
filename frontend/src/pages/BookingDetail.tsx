import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import { Stars } from '../components/ui/Stars';
import toast from 'react-hot-toast';
import {
  Calendar, MapPin, IndianRupee, Clock, User, ShieldAlert,
  AlertTriangle, ChevronRight, FileText,
} from 'lucide-react';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showDispute, setShowDispute] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('BILLING');
  const [disputeDesc, setDisputeDesc] = useState('');

  useEffect(() => {
    if (!id) return;
    api.getBooking(id)
      .then(setBooking)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const refresh = () => {
    if (!id) return;
    api.getBooking(id).then(setBooking).catch(() => {});
  };

  const handleCancel = async () => {
    try {
      const res = await api.cancelBooking(id!, cancelReason);
      toast.success(res.message || 'Booking cancelled');
      refresh();
      setShowCancel(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      await api.updateBookingStatus(id!, { status });
      toast.success(`Booking ${status.toLowerCase()}`);
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleReview = async () => {
    try {
      await api.createReview({ bookingId: id!, rating, comment });
      toast.success('Review submitted!');
      setShowReview(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDispute = async () => {
    try {
      const res = await api.createDispute({ bookingId: id!, category: disputeCategory, description: disputeDesc });
      toast.success(res.message || 'Dispute registered');
      setShowDispute(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleReleasePayment = async () => {
    try {
      await api.releasePayment(id!);
      toast.success('Payment released!');
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleReschedule = async () => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    if (!newDate) return;
    try {
      await api.rescheduleBooking(id!, { scheduledDate: newDate });
      toast.success('Booking rescheduled');
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <Layout showBack title="Booking">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout showBack>
        <p className="text-center text-gray-500 py-12">Booking not found</p>
      </Layout>
    );
  }

  const statusColor: Record<string, string> = {
    PENDING: 'badge-yellow', CONFIRMED: 'badge-blue',
    IN_PROGRESS: 'badge-blue', COMPLETED: 'badge-green',
    CANCELLED: 'badge-red', RESCHEDULED: 'badge-yellow',
  };

  return (
    <Layout showBack title={`Booking ${booking.bookingId}`}>
      {/* Status Header */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className={statusColor[booking.status] || 'badge'}>
            {booking.status.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-400">{booking.bookingId}</span>
        </div>

        <h2 className="font-semibold text-lg mb-1">{booking.categoryName}</h2>
        {booking.subCategoryName && (
          <p className="text-sm text-gray-500 mb-2">{booking.subCategoryName}</p>
        )}
        <p className="text-sm text-gray-700 mb-3">{booking.jobDescription}</p>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            {booking.scheduledDate
              ? new Date(booking.scheduledDate).toLocaleDateString()
              : 'ASAP'}
            {booking.scheduledSlot && <span>at {booking.scheduledSlot}</span>}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            {booking.address}, {booking.city}
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-gray-400" />
            Estimated: ₹{booking.estimatedCost}
            {booking.finalCost && <> | Final: ₹{booking.finalCost}</>}
          </div>
        </div>
      </div>

      {/* Professional Info */}
      {booking.professional && (
        <div className="card mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Professional</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600">
              {booking.professional.user?.name?.[0] || 'P'}
            </div>
            <div>
              <p className="font-medium">{booking.professional.user?.name || 'Professional'}</p>
              <p className="text-sm text-gray-500">{booking.professional.skillCategory}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 mb-4">
        {booking.status === 'PENDING' && (
          <div className="flex gap-2">
            <button onClick={() => handleStatusUpdate('CONFIRMED')} className="btn-primary flex-1 text-sm">
              Confirm Booking
            </button>
            <button onClick={() => setShowCancel(true)} className="btn-secondary flex-1 text-sm">
              Cancel
            </button>
          </div>
        )}
        {booking.status === 'CONFIRMED' && (
          <div className="flex gap-2">
            <button onClick={() => handleStatusUpdate('IN_PROGRESS')} className="btn-primary flex-1 text-sm">
              Start Job
            </button>
            <button onClick={handleReschedule} className="btn-secondary flex-1 text-sm">
              Reschedule
            </button>
            <button onClick={() => setShowCancel(true)} className="text-red-500 btn-ghost text-sm">
              Cancel
            </button>
          </div>
        )}
        {booking.status === 'IN_PROGRESS' && (
          <div className="flex gap-2">
            <button onClick={() => handleStatusUpdate('COMPLETED')} className="btn-primary flex-1 text-sm">
              Mark Completed
            </button>
          </div>
        )}
        {booking.status === 'COMPLETED' && !booking.review && (
          <button onClick={() => setShowReview(true)} className="btn-secondary w-full text-sm">
            Rate this Service
          </button>
        )}
        {booking.payment?.status === 'HELD_IN_ESCROW' && (
          <button onClick={handleReleasePayment} className="btn-primary w-full text-sm">
            Confirm Completion & Release Payment
          </button>
        )}
        {booking.payment?.status === 'HELD_IN_ESCROW' && (
          <button onClick={() => navigate(`/payment/${booking.id}`)} className="btn-secondary w-full text-sm">
            Make Payment (₹{booking.payment.amount})
          </button>
        )}
      </div>

      {/* Payment Info */}
      {booking.payment && (
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4 text-gray-400" />
            <h3 className="font-medium">Payment</h3>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span>₹{booking.payment.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Platform fee (12%)</span>
              <span className="text-gray-400">₹{booking.payment.platformCommission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Professional earns</span>
              <span className="font-medium text-green-600">₹{booking.payment.professionalEarning}</span>
            </div>
            <div className="border-t pt-1 flex justify-between font-medium">
              <span>Status</span>
              <span className={booking.payment.status === 'RELEASED' ? 'text-green-600' : 'text-yellow-600'}>
                {booking.payment.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions: Cancel, Dispute */}
      <div className="flex gap-2">
        <button onClick={() => navigate(`/receipt/${booking.id}`)} className="btn-ghost flex-1 text-sm">
          <FileText className="w-4 h-4 inline mr-1" /> Receipt
        </button>
        <button onClick={() => setShowDispute(true)} className="btn-ghost flex-1 text-sm text-red-500">
          <AlertTriangle className="w-4 h-4 inline mr-1" /> Raise Issue
        </button>
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowCancel(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-2">Cancel Booking</h3>
            <p className="text-sm text-gray-500 mb-4">
              Cancellations less than 2 hours before the scheduled time may incur a 25% fee.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="input-field h-20 resize-none mb-4"
              placeholder="Reason for cancellation (optional)"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowCancel(false)} className="btn-secondary flex-1">Keep Booking</button>
              <button onClick={handleCancel} className="btn-primary flex-1 bg-red-600 hover:bg-red-700">Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowReview(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Rate this Service</h3>
            <div className="flex justify-center mb-4">
              <Stars rating={rating} size={36} interactive onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field h-24 resize-none mb-4"
              placeholder="Share your experience (optional)"
            />
            <button onClick={handleReview} className="btn-primary w-full">Submit Review</button>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDispute && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowDispute(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Raise an Issue</h3>
            <div className="space-y-3">
              <select
                value={disputeCategory}
                onChange={(e) => setDisputeCategory(e.target.value)}
                className="input-field"
              >
                <option value="BILLING">Billing Dispute</option>
                <option value="SERVICE_QUALITY">Service Quality</option>
                <option value="NO_SHOW">Professional No-Show</option>
                <option value="SAFETY">Safety Concern</option>
                <option value="ACCOUNT">Account Issue</option>
              </select>
              <textarea
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                className="input-field h-24 resize-none"
                placeholder="Describe the issue..."
              />
              {disputeCategory === 'SAFETY' && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  Safety concerns are escalated immediately to our support team.
                </p>
              )}
              <div className="flex gap-2">
                <button onClick={() => setShowDispute(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleDispute} className="btn-primary flex-1">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
