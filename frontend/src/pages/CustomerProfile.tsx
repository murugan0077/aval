import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/ui/Layout';
import { api, setToken } from '../services/api';
import toast from 'react-hot-toast';
import {
  User, Phone, Shield, LogOut, ChevronRight, Pencil,
  Globe, CheckCircle, X, ArrowRight, Info, Lock, MapPin,
} from 'lucide-react';
import LocationPicker from '../components/ui/LocationPicker';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
];

export default function CustomerProfile() {
  const { user, logout, professional, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editLang, setEditLang] = useState(user?.preferredLang || 'en');
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const handleSavePersonalInfo = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await api.updateProfile({ name: editName.trim(), preferredLang: editLang });
      await refreshProfile();
      setShowPersonalInfo(false);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await api.upgradeToProfessional();
      setToken(res.token);
      await refreshProfile();
      toast.success(res.message || 'Professional account created!');
      navigate('/professional/onboarding');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upgrade');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <Layout title="My Profile">
      {/* Profile Card */}
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-600 shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-lg truncate">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.phone}</p>
            <p className="text-xs text-gray-400 capitalize flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3 text-green-500" />
              {user?.role?.toLowerCase()}
              {professional?.isVerified && (
                <span className="badge-green text-xs ml-1">Verified</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {/* Personal Information */}
        <button
          onClick={() => { setEditName(user?.name || ''); setEditLang(user?.preferredLang || 'en'); setShowPersonalInfo(true); setShowPrivacy(false); }}
          className="card w-full flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Personal Information</p>
              <p className="text-xs text-gray-400">Name, language preferences</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Language - quick shortcut */}
        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Language</p>
              <p className="text-xs text-gray-400">
                {LANGUAGES.find((l) => l.code === (user?.preferredLang || 'en'))?.label || 'English'}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setEditLang(user?.preferredLang || 'en'); setShowPersonalInfo(true); }}
            className="text-brand-600 text-sm font-medium"
          >
            Change
          </button>
        </div>

        {/* Your Location */}
        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Your Location</p>
              <p className="text-xs text-gray-400">
                {user?.city ? `${user.city}${user?.pincode ? ` · ${user.pincode}` : ''}` : 'Set your location'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLocation(true)}
            className="text-brand-600 text-sm font-medium"
          >
            Change
          </button>
        </div>

        {/* Privacy & Security */}
        <button
          onClick={() => { setShowPrivacy(true); setShowPersonalInfo(false); }}
          className="card w-full flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Privacy & Security</p>
              <p className="text-xs text-gray-400">Data protection, DPDPA compliance</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Upgrade to Professional */}
      {user?.role === 'CUSTOMER' && !professional && (
        <div className="card mt-4 border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
              <ArrowRight className="w-5 h-5 text-brand-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-brand-800">Are you a professional?</p>
              <p className="text-sm text-brand-600 mt-0.5">
                Create a professional account to list your services and start earning.
              </p>
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="btn-primary text-sm mt-3 w-full"
              >
                {upgrading ? 'Creating...' : 'Create Professional Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Professional quick link */}
      {professional && (
        <div className="card mt-4 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800 text-sm">Professional Dashboard</p>
              <p className="text-xs text-green-600">{professional.skillCategory || 'Profile incomplete'}</p>
            </div>
            <button
              onClick={() => navigate('/professional/dashboard')}
              className="btn-ghost text-green-700 text-sm"
            >
              Go <ChevronRight className="w-4 h-4 inline" />
            </button>
          </div>
        </div>
      )}

      {/* Sign Out */}
      <button
        onClick={logout}
        className="card w-full mt-4 flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
          <LogOut className="w-5 h-5 text-red-500" />
        </div>
        <span className="font-medium">Sign Out</span>
      </button>

      {/* ===== MODAL: Personal Information ===== */}
      {showPersonalInfo && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center" onClick={() => setShowPersonalInfo(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 pb-20 max-h-[80vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Personal Information</h3>
              <button onClick={() => setShowPersonalInfo(false)} className="btn-ghost p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Phone (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="input-field bg-gray-50 text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {user?.phone}
                </div>
              </div>

              {/* Name (editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <Pencil className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Your name"
                  />
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={editLang}
                    onChange={(e) => setEditLang(e.target.value)}
                    className="input-field pl-10 appearance-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-400 mt-1">The platform will use this language for communication.</p>
              </div>

              <button
                onClick={handleSavePersonalInfo}
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Privacy & Security ===== */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center" onClick={() => setShowPrivacy(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 pb-20 max-h-[80vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Privacy & Security</h3>
              <button onClick={() => setShowPrivacy(false)} className="btn-ghost p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* DPDPA Compliance */}
              <div className="card border-brand-100 bg-brand-50">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-brand-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-brand-800 text-sm">Your Data is Protected</p>
                    <p className="text-xs text-brand-600 mt-1">
                      NearSkill complies with India's Digital Personal Data Protection Act (DPDPA).
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Address Privacy</p>
                    <p className="text-xs text-gray-500">
                      Your full address is only shared with a professional after a booking is confirmed. Never before.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Phone Number Protected</p>
                    <p className="text-xs text-gray-500">
                      Professional phone numbers are never displayed publicly. All communication is routed through the in-app chat system.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Anonymous Reviews</p>
                    <p className="text-xs text-gray-500">
                      You can choose to leave reviews anonymously. Your identity will not be visible to the professional or other users.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Data Control</p>
                    <p className="text-xs text-gray-500">
                      You can request data deletion at any time by contacting our support team. We only retain essential data for legal compliance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Secure Payments</p>
                    <p className="text-xs text-gray-500">
                      Payments are held in escrow and only released when you confirm job completion. Your financial data is encrypted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-gray-500" />
                  <p className="text-xs font-medium text-gray-600">Security Contact</p>
                </div>
                <p className="text-xs text-gray-500">
                  For privacy concerns or data requests, contact our Data Protection Officer at
                  privacy@nearskill.in
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker */}
      {showLocation && (
        <LocationPicker
          currentCity={user?.city}
          currentPincode={user?.pincode}
          currentState={user?.state}
          onSave={async (data) => {
            try {
              await api.updateLocation(data);
              await refreshProfile();
              setShowLocation(false);
              toast.success('Location updated');
            } catch (err: any) {
              toast.error(err.message || 'Failed to update location');
            }
          }}
          onClose={() => setShowLocation(false)}
        />
      )}
    </Layout>
  );
}
