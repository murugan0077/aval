import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/ui/Layout';
import toast from 'react-hot-toast';
import {
  User, Star, ShieldCheck, MapPin, Briefcase,
  Crown, Plus, Pencil, Trash2, X, Check,
} from 'lucide-react';

export default function ProfessionalProfilePage() {
  const { professional, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);

  const [addingService, setAddingService] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [price, setPrice] = useState('');
  const [serviceErrors, setServiceErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  const resetForm = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setPrice('');
    setServiceErrors({});
  };

  const startEdit = (listing: any) => {
    setEditingId(listing.id);
    setSelectedCategory(listing.categoryId || listing.category?.id);
    setSelectedSubCategory(listing.subCategoryId || '');
    setPrice(listing.price?.toString() || '');
    setServiceErrors({});
    setAddingService(false);
  };

  const startAdd = () => {
    setAddingService(!addingService);
    setEditingId(null);
    resetForm();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedCategory) errs.category = 'Select a category';
    if (!price) errs.price = 'Set a price';
    else if (parseFloat(price) <= 0) errs.price = 'Price must be greater than 0';
    setServiceErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const payload = {
        categoryId: selectedCategory,
        subCategoryId: selectedSubCategory || undefined,
        price: parseFloat(price),
      };

      if (editingId) {
        await api.updateService(editingId, payload);
        toast.success('Service updated');
      } else {
        await api.addService(payload);
        toast.success('Service added');
      }

      await refreshProfile();
      setEditingId(null);
      setAddingService(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from your services?`)) return;
    try {
      await api.deleteService(id);
      toast.success('Service removed');
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const cancelForm = () => {
    setEditingId(null);
    setAddingService(false);
    resetForm();
  };

  if (!professional) return null;

  return (
    <Layout title="My Profile">
      {/* Profile Card */}
      <div className="card mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-600">
            {professional.user?.name?.[0] || 'P'}
          </div>
          <div>
            <h2 className="font-bold text-lg">{professional.user?.name}</h2>
            <p className="text-sm text-gray-500">{professional.skillCategory || 'Category not set'}</p>
            {professional.verificationBadge && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" /> {professional.verificationBadge}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Star className="w-4 h-4 text-yellow-500" />
            {professional.averageRating.toFixed(1)} ({professional.totalReviews} reviews)
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-4 h-4" />
            {professional.yearsOfExperience} yrs exp
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            {professional.serviceRadiusKm} km radius
          </div>
          <div className="flex items-center gap-2">
            {professional.premiumTier !== 'NONE' ? (
              <span className="badge-yellow flex items-center gap-1">
                <Crown className="w-3 h-3" /> {professional.premiumTier}
              </span>
            ) : (
              <button onClick={() => navigate('/premium')} className="text-brand-600 text-xs">
                Upgrade to Premium
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/professional/onboarding')}
          className="btn-ghost w-full mt-3 text-sm"
        >
          Edit Profile
        </button>
      </div>

      {/* Services */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">My Services</h3>
        <button
          onClick={startAdd}
          className="text-brand-600 text-sm flex items-center gap-1"
        >
          {addingService ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {addingService ? 'Cancel' : 'Add Service'}
        </button>
      </div>

      {/* Service List */}
      <div className="space-y-2 mb-4">
        {professional.serviceListings?.map((listing: any) => (
          <div key={listing.id} className="card">
            {editingId === listing.id ? (
              /* Edit Mode */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Edit Service</h4>
                  <button onClick={cancelForm} className="btn-ghost p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); setServiceErrors((p) => ({ ...p, category: '' })); }}
                  className={`input-field ${serviceErrors.category ? 'border-red-400' : ''}`}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {selectedCategory && (
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All services in this category</option>
                    {categories.find((c) => c.id === selectedCategory)?.subCategories?.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} {sub.fixedPrice ? `(₹${sub.fixedPrice})` : '(Custom quote)'}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="number"
                  value={price}
                  onChange={(e) => { setPrice(e.target.value); setServiceErrors((p) => ({ ...p, price: '' })); }}
                  className={`input-field ${serviceErrors.price ? 'border-red-400' : ''}`}
                  placeholder="Your price (₹)"
                  min="1"
                />
                {serviceErrors.price && <p className="text-red-500 text-xs">{serviceErrors.price}</p>}
                <div className="flex gap-2">
                  <button onClick={cancelForm} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleSave} className="btn-primary flex-1"><Check className="w-4 h-4 inline" /> Save</button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium truncate">{listing.category?.name}</p>
                  {listing.subCategory && (
                    <p className="text-sm text-gray-500 truncate">{listing.subCategory.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    {listing.price ? (
                      <p className="font-semibold text-brand-600">₹{listing.price}</p>
                    ) : (
                      <p className="text-sm text-gray-400">Custom quote</p>
                    )}
                    <p className="text-xs text-gray-400">{listing.priceUnit}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(listing)}
                      className="btn-ghost p-1.5 text-gray-400 hover:text-brand-600"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id, listing.category?.name || 'this service')}
                      className="btn-ghost p-1.5 text-gray-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {professional.serviceListings?.length === 0 && !addingService && (
          <p className="text-sm text-gray-400 text-center py-4">
            No services added yet. Add your first service to get discovered.
          </p>
        )}
      </div>

      {/* Add Service Form */}
      {addingService && (
        <div className="card mb-4 border-brand-200">
          <h4 className="font-medium mb-3">Add New Service</h4>
          <div className="space-y-3">
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); setServiceErrors((p) => ({ ...p, category: '' })); }}
                className={`input-field ${serviceErrors.category ? 'border-red-400 focus:ring-red-400' : ''}`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {serviceErrors.category && <p className="text-red-500 text-xs mt-1">{serviceErrors.category}</p>}
            </div>

            {selectedCategory && (
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="input-field"
              >
                <option value="">All services in this category</option>
                {categories.find((c) => c.id === selectedCategory)?.subCategories?.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} {sub.fixedPrice ? `(₹${sub.fixedPrice})` : '(Custom quote)'}
                  </option>
                ))}
              </select>
            )}

            <div>
              <input
                type="number"
                value={price}
                onChange={(e) => { setPrice(e.target.value); setServiceErrors((p) => ({ ...p, price: '' })); }}
                className={`input-field ${serviceErrors.price ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="Your price (₹)"
                min="1"
              />
              {serviceErrors.price && <p className="text-red-500 text-xs mt-1">{serviceErrors.price}</p>}
            </div>

            <div className="flex gap-2">
              <button onClick={cancelForm} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1"><Check className="w-4 h-4 inline" /> Add</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
