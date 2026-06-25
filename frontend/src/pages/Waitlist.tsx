import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

const PHONE_REGEX = /^[0-9]{10}$/;

export default function WaitlistPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!category.trim()) errs.category = 'Service needed is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!phone) errs.phone = 'Phone number is required';
    else if (!PHONE_REGEX.test(phone)) errs.phone = 'Enter a valid 10-digit phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.joinWaitlist({ phone, category: category.trim(), city: city.trim() });
      toast.success(res.message || 'Added to waitlist!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showBack title="Join Waitlist">
      <div className="card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <Bell className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h2 className="font-semibold">No professionals yet?</h2>
            <p className="text-sm text-gray-500">We'll notify you when one becomes available in your area.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Needed <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setErrors((p) => ({ ...p, category: '' })); }}
            className={`input-field ${errors.category ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="e.g., Plumber, Electrician"
          />
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: '' })); }}
            className={`input-field ${errors.city ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="e.g., Bengaluru, Pune"
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors((p) => ({ ...p, phone: '' })); }}
            onBlur={() => { if (phone && !PHONE_REGEX.test(phone)) setErrors((p) => ({ ...p, phone: 'Enter a valid 10-digit phone number' })); }}
            className={`input-field ${errors.phone ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="For notification"
            maxLength={10}
            inputMode="numeric"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Joining...' : 'Notify Me'}
        </button>
      </form>
    </Layout>
  );
}
