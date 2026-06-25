import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import { IndianRupee, CheckCircle, Download } from 'lucide-react';

export default function ReceiptPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    api.getReceipt(bookingId)
      .then(setReceipt)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <Layout showBack title="Receipt">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </Layout>
    );
  }

  if (!receipt) {
    return (
      <Layout showBack title="Receipt">
        <p className="text-center text-gray-500 py-12">Receipt not available yet</p>
      </Layout>
    );
  }

  return (
    <Layout showBack title="Receipt">
      {/* Receipt Card */}
      <div className="card border-2 border-green-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-lg font-bold">Payment Successful</h2>
          <p className="text-sm text-gray-500">{receipt.receiptId}</p>
        </div>

        {/* Details */}
        <div className="border-t border-b border-gray-100 py-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span>{new Date(receipt.date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Booking</span>
            <span>{receipt.bookingId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Professional</span>
            <span>{receipt.professional}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service</span>
            <span>{receipt.service}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction</span>
            <span className="text-xs">{receipt.transactionId}</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="py-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>₹{receipt.breakdown?.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Platform Fee (12%)</span>
            <span className="text-gray-400">-₹{receipt.breakdown?.platformFee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tax (1.8%)</span>
            <span className="text-gray-400">-₹{receipt.breakdown?.tax}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-brand-600">₹{receipt.total}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Professional earns</span>
            <span>₹{receipt.breakdown?.professionalEarning}</span>
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <span className={`badge ${
            receipt.status === 'RELEASED' ? 'badge-green' : 'badge-yellow'
          }`}>
            {receipt.status === 'RELEASED' ? 'Payment Released' : 'Held in Escrow'}
          </span>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="btn-secondary w-full mt-4"
      >
        <Download className="w-4 h-4 inline mr-2" /> Download Receipt
      </button>
    </Layout>
  );
}
