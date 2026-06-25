import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import toast from 'react-hot-toast';
import { IndianRupee, Shield, Smartphone, CreditCard, Building2, Wallet } from 'lucide-react';

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', icon: CreditCard, description: 'Credit / Debit Card' },
  { id: 'netbanking', label: 'Net Banking', icon: Building2, description: 'All major banks' },
  { id: 'cash', label: 'Cash', icon: Wallet, description: 'Pay on completion' },
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    api.getBooking(bookingId).then(setBooking).catch(() => {});
  }, [bookingId]);

  const handlePay = async () => {
    setProcessing(true);
    try {
      const res = await api.initiatePayment({ bookingId: bookingId!, method });
      toast.success('Payment successful!');
      navigate(`/booking/${bookingId}`);
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!booking) {
    return (
      <Layout showBack title="Payment">
        <p className="text-center text-gray-500 py-12">Loading...</p>
      </Layout>
    );
  }

  const amount = booking.finalCost || booking.estimatedCost;
  const commission = Math.round(amount * 0.12 * 100) / 100;
  const tax = Math.round(amount * 0.018 * 100) / 100;
  const professionalEarns = Math.round((amount - commission - tax) * 100) / 100;

  return (
    <Layout showBack title="Payment">
      {/* Amount Breakdown */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Service cost</span>
            <span>₹{amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Platform fee (12%)</span>
            <span className="text-gray-400">₹{commission}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tax (1.8%)</span>
            <span className="text-gray-400">₹{tax}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-brand-600">₹{amount}</span>
          </div>
        </div>
        <div className="mt-3 p-2 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Payment held in escrow until you confirm job completion.
          </p>
        </div>
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            Professional earns: ₹{professionalEarns}
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <h3 className="font-semibold mb-3">Payment Method</h3>
      <div className="space-y-2 mb-6">
        {paymentMethods.map((pm) => {
          const Icon = pm.icon;
          return (
            <button
              key={pm.id}
              onClick={() => setMethod(pm.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                method === pm.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
              }`}
            >
              <Icon className="w-6 h-6 text-gray-500" />
              <div className="text-left">
                <p className="font-medium">{pm.label}</p>
                <p className="text-xs text-gray-400">{pm.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={handlePay}
        disabled={processing}
        className="btn-primary w-full"
      >
        {processing ? 'Processing...' : `Pay ₹${amount}`}
      </button>
    </Layout>
  );
}
