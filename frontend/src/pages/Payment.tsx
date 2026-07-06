import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import toast from 'react-hot-toast';
import { IndianRupee, Shield, Smartphone, CreditCard, Building2, Wallet, CheckCircle2 } from 'lucide-react';

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
      <Layout showBack title="Secure Checkout" className="bg-slate-50/50 min-h-screen">
        <div className="p-4 max-w-lg mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse h-64"></div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse h-80"></div>
        </div>
      </Layout>
    );
  }

  const amount = booking.finalCost || booking.estimatedCost;
  const commission = Math.round(amount * 0.12 * 100) / 100;
  const tax = Math.round(amount * 0.018 * 100) / 100;
  const professionalEarns = Math.round((amount - commission - tax) * 100) / 100;

  return (
    <Layout showBack title="Secure Checkout" className="bg-slate-50/50 min-h-screen pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        
        {/* Amount Breakdown */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-500 bg-emerald-50 p-0.5 rounded-full" />
            Payment Summary
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Service cost</span>
              <span className="font-semibold text-slate-800">₹{amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Platform fee (12%)</span>
              <span className="text-slate-400">₹{commission}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Tax (1.8%)</span>
              <span className="text-slate-400">₹{tax}</span>
            </div>
            
            <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-center">
              <span className="font-bold text-lg text-slate-900">Total to Pay</span>
              <span className="font-extrabold text-2xl text-brand-600">₹{amount}</span>
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 font-medium leading-relaxed">
              Payment is held securely in escrow. It will only be released when you confirm job completion.
            </p>
          </div>
          
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Professional earns</span>
            <span className="text-sm font-semibold text-slate-700">₹{professionalEarns}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="font-bold text-lg text-slate-900 mb-4 px-1">Select Payment Method</h3>
          <div className="space-y-3">
            {paymentMethods.map((pm) => {
              const Icon = pm.icon;
              const isSelected = method === pm.id;
              
              return (
                <button
                  key={pm.id}
                  onClick={() => setMethod(pm.id)}
                  className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                    isSelected 
                      ? 'border-brand-500 bg-brand-50 shadow-sm' 
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-xl mr-4 ${isSelected ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`font-bold ${isSelected ? 'text-brand-900' : 'text-slate-800'}`}>{pm.label}</p>
                    <p className={`text-xs ${isSelected ? 'text-brand-600' : 'text-slate-400'}`}>{pm.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-10 sm:relative sm:bg-transparent sm:backdrop-blur-none sm:border-t-0 sm:p-0">
          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full py-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 max-w-lg mx-auto"
          >
            {processing ? (
              <>Processing...</>
            ) : (
              <>
                Pay ₹{amount} Securely <Shield className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
