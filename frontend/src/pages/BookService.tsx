import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, IndianRupee, ShieldCheck } from 'lucide-react';

export default function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prof, setProf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [jobDescription, setJobDescription] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isInstant, setIsInstant] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledSlot, setScheduledSlot] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getProfessional(id)
      .then(setProf)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const calculateCost = () => {
    if (selectedService?.price) return selectedService.price;
    if (prof?.serviceListings?.[0]?.price) return prof.serviceListings[0].price;
    return 0;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!jobDescription.trim()) errs.jobDescription = 'Job description is required';
    if (!address.trim()) errs.address = 'Service address is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!isInstant && !scheduledDate) errs.scheduledDate = 'Please select a date or choose ASAP';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.createBooking({
        professionalId: id,
        listingId: selectedService?.id || prof?.serviceListings?.[0]?.id,
        jobDescription,
        isInstant,
        scheduledDate: isInstant ? undefined : scheduledDate,
        scheduledSlot: isInstant ? undefined : scheduledSlot,
        address,
        city,
        pincode,
        categoryName: prof?.skillCategory,
        subCategoryName: selectedService?.subCategory?.name,
        estimatedCost: calculateCost(),
      });

      toast.success('Booking created!');
      navigate(`/booking/${res.booking.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout showBack title="Book">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </Layout>
    );
  }

  if (!prof) {
    return (
      <Layout showBack>
        <p className="text-center text-gray-500 py-12">Professional not found</p>
      </Layout>
    );
  }

  return (
    <Layout showBack title="Book Service">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Professional Summary */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600">
              {prof.user.name[0]}
            </div>
            <div>
              <h3 className="font-semibold">{prof.user.name}</h3>
              <p className="text-sm text-gray-500">{prof.skillCategory}</p>
              {prof.verificationBadge && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {prof.verificationBadge}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Service Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
          <div className="space-y-2">
            {prof.serviceListings?.map((listing: any) => (
              <button
                key={listing.id}
                type="button"
                onClick={() => setSelectedService(listing)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  selectedService?.id === listing.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{listing.subCategory?.name || listing.category.name}</span>
                  <span className="font-semibold text-brand-600">
                    {listing.price ? `₹${listing.price}` : 'Quote'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{listing.priceUnit}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your job <span className="text-red-500">*</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => { setJobDescription(e.target.value); setErrors((p) => ({ ...p, jobDescription: '' })); }}
            className={`input-field h-24 resize-none ${errors.jobDescription ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Tell the professional what you need done..."
          />
          {errors.jobDescription && <p className="text-red-500 text-xs mt-1">{errors.jobDescription}</p>}
        </div>

        {/* Booking Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setIsInstant(true); setScheduledDate(''); setErrors((p) => ({ ...p, scheduledDate: '' })); }}
              className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                isInstant ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
              }`}
            >
              <Clock className="w-5 h-5 mx-auto mb-1 text-brand-600" />
              <span className="text-sm font-medium">ASAP</span>
              {prof.availabilityNow && (
                <p className="text-xs text-green-600">Available now</p>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsInstant(false)}
              className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                !isInstant && !scheduledDate ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
              }`}
            >
              <Calendar className="w-5 h-5 mx-auto mb-1 text-brand-600" />
              <span className="text-sm font-medium">Schedule</span>
            </button>
          </div>
          {!isInstant && (
            <div className="mt-2 flex gap-2">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => { setScheduledDate(e.target.value); setErrors((p) => ({ ...p, scheduledDate: '' })); }}
                className={`input-field flex-1 ${errors.scheduledDate ? 'border-red-400 focus:ring-red-400' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="time"
                value={scheduledSlot}
                onChange={(e) => setScheduledSlot(e.target.value)}
                className="input-field w-32"
              />
            </div>
          )}
          {errors.scheduledDate && <p className="text-red-500 text-xs mt-1">{errors.scheduledDate}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={address}
            onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: '' })); }}
            className={`input-field h-20 resize-none mb-2 ${errors.address ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Full address"
          />
          {errors.address && <p className="text-red-500 text-xs mt-1 mb-2">{errors.address}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: '' })); }}
              className={`input-field flex-1 ${errors.city ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="City"
            />
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-field w-32"
              placeholder="Pincode"
              inputMode="numeric"
              maxLength={6}
            />
          </div>
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        {/* Cost Summary */}
        <div className="card bg-brand-50 border-brand-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Estimated Cost:</span>
            <span className="text-xl font-bold text-brand-600">₹{calculateCost()}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Includes 12% platform fee</p>
          <p className="text-xs text-gray-400 mt-1">
            Cancellation policy: Free cancellation up to 2 hours before the scheduled time.
            Late cancellation may incur a 25% fee.
          </p>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Booking...' : 'Confirm Booking'}
        </button>
      </form>
    </Layout>
  );
}
