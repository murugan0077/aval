import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PHONE_REGEX = /^[0-9]{10}$/;

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>('CUSTOMER');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    else if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!phone) errs.phone = 'Phone number is required';
    else if (!PHONE_REGEX.test(phone)) errs.phone = 'Enter a valid 10-digit phone number';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), phone, password, role);
      toast.success('Account created!');
      navigate(role === 'PROFESSIONAL' ? '/professional/onboarding' : '/');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10 my-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 tracking-tight">NearSkill</h1>
          <p className="text-slate-500 mt-3 font-medium">Join as a customer or professional</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-brand-100/50 border border-white space-y-6" noValidate>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              I want to join as <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all active:scale-[0.98] ${
                  role === 'CUSTOMER'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('PROFESSIONAL')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all active:scale-[0.98] ${
                  role === 'PROFESSIONAL'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                }`}
              >
                Professional
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
              onBlur={() => { if (name && name.trim().length < 2) setErrors((p) => ({ ...p, name: 'Name must be at least 2 characters' })); }}
              className={`w-full p-4 rounded-xl border ${errors.name ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-slate-200 focus:ring-brand-200 focus:border-brand-500'} bg-white/50 focus:bg-white transition-all outline-none font-medium`}
              placeholder="Your full name"
            />
            {errors.name && <p className="text-rose-500 text-xs font-medium mt-1">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors((p) => ({ ...p, phone: '' })); }}
              onBlur={() => { if (phone && !PHONE_REGEX.test(phone)) setErrors((p) => ({ ...p, phone: 'Enter a valid 10-digit phone number' })); }}
              className={`w-full p-4 rounded-xl border ${errors.phone ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-slate-200 focus:ring-brand-200 focus:border-brand-500'} bg-white/50 focus:bg-white transition-all outline-none font-medium`}
              placeholder="10-digit mobile number"
              maxLength={10}
              inputMode="numeric"
            />
            {errors.phone && <p className="text-rose-500 text-xs font-medium mt-1">{errors.phone}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
              onBlur={() => { if (password && password.length < 6) setErrors((p) => ({ ...p, password: 'Password must be at least 6 characters' })); }}
              className={`w-full p-4 rounded-xl border ${errors.password ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500' : 'border-slate-200 focus:ring-brand-200 focus:border-brand-500'} bg-white/50 focus:bg-white transition-all outline-none font-medium`}
              placeholder="Min 6 characters"
            />
            {errors.password && <p className="text-rose-500 text-xs font-medium mt-1">{errors.password}</p>}
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200/50 transition-all active:scale-[0.98] mt-4 disabled:opacity-70 disabled:active:scale-100">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="pt-6 border-t border-slate-100 mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
