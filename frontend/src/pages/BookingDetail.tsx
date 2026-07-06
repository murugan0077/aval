import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import { Stars } from '../components/ui/Stars';
import toast from 'react-hot-toast';
import {
  Calendar, MapPin, IndianRupee, Clock, User, ShieldAlert,
  AlertTriangle, ChevronRight, FileText, CheckCircle2, Info
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
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

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
      refresh();
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

  const submitReschedule = async () => {
    if (!rescheduleDate) {
      toast.error('Please select a date');
      return;
    }
    try {
      await api.rescheduleBooking(id!, { scheduledDate: rescheduleDate });
      toast.success('Booking rescheduled');
      refresh();
      setShowReschedule(false);
      setRescheduleDate('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <Layout showBack title="Booking Details">
        <div className="animate-pulse space-y-6 p-4">
          <div className="h-40 bg-slate-200/50 rounded-3xl" />
          <div className="h-24 bg-slate-200/50 rounded-3xl" />
          <div className="h-14 bg-slate-200/50 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout showBack>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Info className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Booking Not Found</h2>
          <p className="text-slate-500">The booking you are looking for does not exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'CANCELLED': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'RESCHEDULED': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Layout showBack title="Booking Details" className="bg-slate-50/50 min-h-screen pb-20">
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        
        {/* Main Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex items-center justify-between mb-5">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(booking.status)} uppercase tracking-wider`}>
              {booking.status.replace('_', ' ')}
            </span>
            <span className="text-sm font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
              #{booking.bookingId}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{booking.categoryName}</h2>
            {booking.subCategoryName && (
              <p className="text-slate-500 font-medium">{booking.subCategoryName}</p>
            )}
            <p className="text-slate-600 mt-3 text-sm leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {booking.jobDescription}
            </p>
          </div>

          <div className="grid gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="pt-0.5">
                <p className="font-medium text-slate-900">
                  {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'ASAP'}
                </p>
                {booking.scheduledSlot && <p className="text-slate-500 text-xs mt-0.5">Slot: {booking.scheduledSlot}</p>}
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-500 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="pt-0.5">
                <p className="font-medium text-slate-900">{booking.address}</p>
                <p className="text-slate-500 text-xs mt-0.5">{booking.city}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500 shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div className="pt-0.5">
                <p className="font-medium text-slate-900">
                  Estimated: ₹{booking.estimatedCost}
                </p>
                {booking.finalCost && <p className="text-emerald-600 font-semibold text-sm mt-0.5">Final Cost: ₹{booking.finalCost}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        {booking.professional && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:border-brand-200 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center font-bold text-brand-600 text-xl shadow-inner border border-brand-100">
                {booking.professional.user?.name?.[0] || 'P'}
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">Professional</p>
                <p className="font-bold text-slate-900 text-lg leading-tight">{booking.professional.user?.name || 'Assigned Pro'}</p>
                <p className="text-sm text-slate-500">{booking.professional.skillCategory}</p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Payment Card */}
        {booking.payment && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
              <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                <IndianRupee className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-lg">Payment Details</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Service Amount</span>
                <span className="font-medium text-slate-900">₹{booking.payment.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Platform Fee (12%)</span>
                <span className="text-slate-500">₹{booking.payment.platformCommission}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Professional Earnings</span>
                <span className="font-medium text-brand-600">₹{booking.payment.professionalEarning}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="font-semibold text-slate-900">Status</span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${booking.payment.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {booking.payment.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Card */}
        {booking.dispute && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600" />
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-rose-50">
              <div className="bg-rose-100 p-1.5 rounded-lg text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-lg">Issue Reported</h3>
              <span className={`ml-auto px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${booking.dispute.status === 'OPEN' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                {booking.dispute.status}
              </span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Category</span>
                <span className="font-medium text-slate-900">{booking.dispute.category.replace('_', ' ')}</span>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Description</span>
                <span className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{booking.dispute.description}</span>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Reported on: {new Date(booking.dispute.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons Section */}
        <div className="space-y-3 pt-2">
          {booking.status === 'PENDING' && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowCancel(true)} className="py-3.5 px-4 rounded-xl font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors active:scale-[0.98]">
                Cancel Booking
              </button>
              <button onClick={() => handleStatusUpdate('CONFIRMED')} className="py-3.5 px-4 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-200 transition-all active:scale-[0.98]">
                Confirm Job
              </button>
            </div>
          )}
          
          {booking.status === 'CONFIRMED' && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowReschedule(true)} className="py-3.5 px-4 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors active:scale-[0.98]">
                Reschedule
              </button>
              <button onClick={() => handleStatusUpdate('IN_PROGRESS')} className="py-3.5 px-4 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-200 transition-all active:scale-[0.98]">
                Start Job
              </button>
              <button onClick={() => setShowCancel(true)} className="col-span-2 py-3 px-4 rounded-xl font-medium text-rose-500 hover:bg-rose-50 transition-colors">
                Cancel Booking
              </button>
            </div>
          )}
          
          {booking.status === 'IN_PROGRESS' && (
            <button onClick={() => handleStatusUpdate('COMPLETED')} className="w-full py-4 px-4 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Mark Completed
            </button>
          )}
          
          {booking.status === 'COMPLETED' && !booking.review && (
            <button onClick={() => setShowReview(true)} className="w-full py-4 px-4 rounded-xl font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all active:scale-[0.98]">
              ⭐ Rate your experience
            </button>
          )}
          
          {booking.payment?.status === 'HELD_IN_ESCROW' && (
            <div className="space-y-3">
              <button onClick={handleReleasePayment} className="w-full py-4 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-200 transition-all active:scale-[0.98]">
                Confirm & Release Payment
              </button>
              <button onClick={() => navigate(`/payment/${booking.id}`)} className="w-full py-3.5 px-4 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors active:scale-[0.98]">
                Pay Custom Amount (₹{booking.payment.amount})
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200/60 mt-6">
            <button onClick={() => navigate(`/receipt/${booking.id}`)} className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
              <FileText className="w-4 h-4 text-slate-400" /> View Receipt
            </button>
            {!booking.dispute && (
              <button onClick={() => setShowDispute(true)} className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-rose-600 bg-white rounded-xl border border-rose-100 hover:bg-rose-50 transition-colors">
                <AlertTriangle className="w-4 h-4" /> Raise Issue
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals with Backdrop Blur and Smooth Transitions */}
      {showCancel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center transition-all" onClick={() => setShowCancel(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />
            <h3 className="font-bold text-xl text-slate-900 mb-2">Cancel Booking?</h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Cancellations less than 2 hours before the scheduled time may incur a 25% fee. Please let us know why you're cancelling.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none resize-none h-28 mb-6"
              placeholder="Reason for cancellation (optional)"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-3.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                Keep Booking
              </button>
              <button onClick={handleCancel} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all">
                Cancel It
              </button>
            </div>
          </div>
        </div>
      )}

      {showReview && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowReview(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />
            <h3 className="font-bold text-xl text-slate-900 mb-6 text-center">Rate this Service</h3>
            <div className="flex justify-center mb-8 bg-slate-50 py-4 rounded-2xl">
              <Stars rating={rating} size={42} interactive onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none resize-none h-32 mb-6 text-sm"
              placeholder="Share your experience (optional)"
            />
            <button onClick={handleReview} className="w-full py-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-200 transition-all active:scale-[0.98]">
              Submit Review
            </button>
          </div>
        </div>
      )}

      {showReschedule && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center transition-all" onClick={() => setShowReschedule(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />
            <h3 className="font-bold text-xl text-slate-900 mb-2">Reschedule Booking</h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Please enter the new date for your booking.
            </p>
            <div className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none bg-white font-medium text-slate-700"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReschedule(false)} className="flex-1 py-3.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={submitReschedule} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-200 transition-all">
                Reschedule It
              </button>
            </div>
          </div>
        </div>
      )}

      {showDispute && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowDispute(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />
            <h3 className="font-bold text-xl text-slate-900 mb-5">Raise an Issue</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Issue Category</label>
                <select
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none bg-white font-medium text-slate-700"
                >
                  <option value="BILLING">Billing Dispute</option>
                  <option value="SERVICE_QUALITY">Service Quality</option>
                  <option value="NO_SHOW">Professional No-Show</option>
                  <option value="SAFETY">Safety Concern</option>
                  <option value="ACCOUNT">Account Issue</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none resize-none h-28"
                  placeholder="Describe the issue in detail..."
                />
              </div>
              
              {disputeCategory === 'SAFETY' && (
                <div className="p-3 bg-rose-50 rounded-lg flex items-start gap-2 border border-rose-100">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700 font-medium">
                    Safety concerns are escalated immediately to our support team for priority handling.
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowDispute(false)} className="flex-1 py-3.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDispute} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all">
                  Submit Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

