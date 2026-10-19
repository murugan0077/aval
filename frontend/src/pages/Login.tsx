import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PHONE_REGEX = /^[0-9]{10}$/;

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginRole, setLoginRole] = useState<'CUSTOMER' | 'PROFESSIONAL'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const { login, professional } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
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
      await login(phone, password, loginRole);
      toast.success('Welcome back!');
      
      if (loginRole === 'PROFESSIONAL') {
        navigate('/professional/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
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

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 tracking-tight">Nearo</h1>
          <p className="text-slate-500 mt-3 font-medium">Find verified local professionals</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-brand-100/50 border border-white space-y-6" noValidate>
          {/* Role Selection Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setLoginRole('CUSTOMER')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${loginRole === 'CUSTOMER' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setLoginRole('PROFESSIONAL')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${loginRole === 'PROFESSIONAL' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Professional
            </button>
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
              placeholder="Enter your phone number"
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
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-rose-500 text-xs font-medium mt-1">{errors.password}</p>}
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200/50 transition-all active:scale-[0.98] mt-4 disabled:opacity-70 disabled:active:scale-100">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="pt-6 border-t border-slate-100 mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
