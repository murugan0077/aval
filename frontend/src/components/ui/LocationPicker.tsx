import { useState } from 'react';
import { X, Search, MapPin, Crosshair, ChevronRight } from 'lucide-react';

const POPULAR_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai',
  'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Surat', 'Bhopal',
  'Indore', 'Chandigarh', 'Nagpur', 'Patna', 'Vadodara', 'Thane',
  'Agra', 'Varanasi', 'Nashik', 'Meerut', 'Faridabad', 'Rajkot',
  'Srinagar', 'Amritsar', 'Allahabad', 'Ranchi', 'Coimbatore', 'Mysuru',
  'Gurugram', 'Noida', 'Ghaziabad', 'Ludhiana', 'Kochi', 'Visakhapatnam',
  'Madurai', 'Guwahati', 'Bhubaneswar', 'Jodhpur',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry', 'Chandigarh',
];

type Props = {
  currentCity?: string;
  currentPincode?: string;
  currentState?: string;
  onSave: (data: { city: string; pincode?: string; state?: string; lat?: number; lng?: number }) => void;
  onClose: () => void;
};

export default function LocationPicker({ currentCity, currentPincode, currentState, onSave, onClose }: Props) {
  const [tab, setTab] = useState<'search' | 'manual'>('search');
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(currentCity || '');
  const [pincode, setPincode] = useState(currentPincode || '');
  const [state, setState] = useState(currentState || '');
  const [detecting, setDetecting] = useState(false);

  const filtered = query
    ? POPULAR_CITIES.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : POPULAR_CITIES;

  const handleSelect = (city: string) => {
    setSelectedCity(city);
    setTab('manual');
  };

  const handleDetect = () => {
    if (!navigator.geolocation) {
      setTab('manual');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=en`
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const stateName = addr.state || '';
          const pincodeVal = addr.postcode || '';
          setSelectedCity(city);
          setState(stateName);
          setPincode(pincodeVal);
          onSave({ city, state: stateName, pincode: pincodeVal, lat: pos.coords.latitude, lng: pos.coords.longitude });
        } catch {
          // Reverse geocode failed, use coords directly
          onSave({ city: '', pincode: '', state: '', lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
        setDetecting(false);
        onClose();
      },
      () => {
        setDetecting(false);
        setTab('manual');
      }
    );
  };

  const handleSave = () => {
    if (!selectedCity.trim()) return;
    onSave({ city: selectedCity.trim(), pincode: pincode.trim() || undefined, state: state.trim() || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg">Your Location</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Detect Button */}
        <div className="px-4 pt-3">
          <button
            onClick={handleDetect}
            disabled={detecting}
            className="w-full p-3 rounded-xl border-2 border-brand-200 bg-brand-50 flex items-center gap-3 hover:bg-brand-100 transition-colors"
          >
            <Crosshair className={`w-5 h-5 text-brand-600 ${detecting ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <p className="font-medium text-sm text-brand-700">{detecting ? 'Detecting...' : 'Use Current Location'}</p>
              <p className="text-xs text-brand-500">Auto-detect via GPS</p>
            </div>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pt-4 pb-2">
          <button
            onClick={() => setTab('search')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'search' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <Search className="w-4 h-4 inline mr-1" /> Search City
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'manual' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <MapPin className="w-4 h-4 inline mr-1" /> Enter Manually
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {tab === 'search' ? (
            <div>
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search for your city..."
                  autoFocus
                />
              </div>
              <div className="space-y-0.5">
                {filtered.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleSelect(city)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors ${selectedCity === city ? 'bg-brand-50 text-brand-600 font-medium' : 'hover:bg-gray-50'}`}
                  >
                    <MapPin className={`w-4 h-4 shrink-0 ${selectedCity === city ? 'text-brand-600' : 'text-gray-400'}`} />
                    {city}
                    {selectedCity === city && <ChevronRight className="w-4 h-4 ml-auto text-brand-600" />}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No cities found. Try manual entry.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="input-field"
                  placeholder="Your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field"
                  placeholder="6-digit pincode"
                  maxLength={6}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select value={state} onChange={(e) => setState(e.target.value)} className="input-field">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={!selectedCity.trim()}
                className="btn-primary w-full mt-2"
              >
                Save Location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
