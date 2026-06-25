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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-brand-50 to-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">NearSkill</h1>
          <p className="text-gray-500 mt-2">Join as a customer or professional</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I want to join as <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`flex-1 py-2 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                  role === 'CUSTOMER'
                    ? 'border-brand-600 bg-brand-50 text-brand-600'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('PROFESSIONAL')}
                className={`flex-1 py-2 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                  role === 'PROFESSIONAL'
                    ? 'border-brand-600 bg-brand-50 text-brand-600'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                Professional
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
              onBlur={() => { if (name && name.trim().length < 2) setErrors((p) => ({ ...p, name: 'Name must be at least 2 characters' })); }}
              className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Your full name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
              placeholder="10-digit mobile number"
              maxLength={10}
              inputMode="numeric"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
              onBlur={() => { if (password && password.length < 6) setErrors((p) => ({ ...p, password: 'Password must be at least 6 characters' })); }}
              className={`input-field ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Min 6 characters"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
