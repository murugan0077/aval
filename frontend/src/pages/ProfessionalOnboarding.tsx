import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ChevronRight, ShieldCheck, CheckCircle,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProfessionalOnboarding() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [skillCategory, setSkillCategory] = useState('');
  const [subSkills, setSubSkills] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [serviceRadiusKm, setServiceRadiusKm] = useState('10');
  const [description, setDescription] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar');
  const [availability, setAvailability] = useState<Record<number, { start: string; end: string; enabled: boolean }>>({});

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  const toggleDay = (day: number) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day] ? { ...prev[day], enabled: !prev[day].enabled } : { start: '09:00', end: '18:00', enabled: true },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const availData = Object.entries(availability)
        .filter(([_, v]) => v.enabled)
        .map(([day, v]) => ({
          dayOfWeek: parseInt(day),
          startTime: v.start,
          endTime: v.end,
        }));

      await api.updateOnboarding({
        skillCategory,
        subSkills: subSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        serviceRadiusKm: parseInt(serviceRadiusKm) || 10,
        description,
        idProofType,
        availability: availData,
      });

      await refreshProfile();
      toast.success("Profile complete! You're now live on NearSkill.");
      navigate('/professional/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-b from-brand-600 to-brand-700 text-white px-5 pt-6 pb-8 rounded-b-2xl shadow-lg">
          <h1 className="text-xl font-bold">Complete Your Profile</h1>
          <p className="text-brand-100 text-sm mt-1">
            {['Basic Information', 'Skills & Experience', 'ID Verification', 'Availability'][step]}
          </p>
        </div>

        <div className="px-4 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-lg">Basic Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Category</label>
                  <select
                    value={skillCategory}
                    onChange={(e) => setSkillCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-skills</label>
                  <input
                    type="text"
                    value={subSkills}
                    onChange={(e) => setSubSkills(e.target.value)}
                    className="input-field"
                    placeholder="e.g., pipe repair, tap installation, drainage"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="input-field"
                    placeholder="e.g., 5"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service radius (km)</label>
                  <input
                    type="number"
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(e.target.value)}
                    className="input-field"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-lg">Skills & Experience</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field h-32 resize-none"
                    placeholder="Describe your experience, skills, and what makes you a great professional..."
                  />
                </div>
                <p className="text-xs text-gray-400">Tip: A good description helps you get more bookings.</p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-lg">ID Verification</h2>
                <p className="text-sm text-gray-500">
                  Select your ID type. This helps build trust with customers.
                </p>
                <select
                  value={idProofType}
                  onChange={(e) => setIdProofType(e.target.value)}
                  className="input-field"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>
                <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Background Verification</p>
                    <p className="text-xs text-blue-600 mt-1">
                      By proceeding, you consent to a background verification check. Your data is handled securely in compliance with DPDPA guidelines.
                    </p>
                    <label className="flex items-center gap-2 mt-3 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>I consent to background verification</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-lg">Set Your Availability</h2>
                <p className="text-sm text-gray-500">Select the days and times you're available for work.</p>
                <div className="space-y-2">
                  {DAYS.map((day, i) => (
                    <div key={day} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={availability[i]?.enabled || false}
                        onChange={() => toggleDay(i)}
                        className="rounded accent-brand-600"
                      />
                      <span className="flex-1 font-medium text-sm">{day}</span>
                      {availability[i]?.enabled && (
                        <div className="flex gap-2 items-center">
                          <input
                            type="time"
                            value={availability[i]?.start || '09:00'}
                            onChange={(e) => setAvailability((prev) => ({ ...prev, [i]: { ...prev[i], start: e.target.value } }))}
                            className="input-field w-22 text-sm py-1.5"
                          />
                          <span className="text-gray-400 text-xs">to</span>
                          <input
                            type="time"
                            value={availability[i]?.end || '18:00'}
                            onChange={(e) => setAvailability((prev) => ({ ...prev, [i]: { ...prev[i], end: e.target.value } }))}
                            className="input-field w-22 text-sm py-1.5"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 0 && !skillCategory}
                  className="btn-primary flex-1"
                >
                  Next <ChevronRight className="w-4 h-4 inline" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !Object.values(availability).some((a) => a?.enabled)}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Saving...' : 'Complete Profile & Go Live'}
                </button>
              )}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i <= step ? 'bg-brand-600' : 'bg-gray-200'
                } ${i === step ? 'w-6' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
