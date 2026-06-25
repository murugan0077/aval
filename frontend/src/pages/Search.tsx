import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import { SearchCard } from '../components/ui/SearchCard';
import { Search as SearchIcon, SlidersHorizontal, MapPin } from 'lucide-react';
import type { SearchResult } from '../types';

export default function SearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (user?.city) params.city = user.city;
    if (searchParams.get('minRating')) params.minRating = searchParams.get('minRating')!;
    if (searchParams.get('sort')) params.sort = searchParams.get('sort')!;

    setLoading(true);
    api.searchProfessionals(params)
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, searchParams, user?.city]);

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (category) params.category = category;
    navigate(`/search?${new URLSearchParams(params).toString()}`);
  };

  return (
    <Layout title="Find Services">
      {/* Search Input */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field pl-10"
            placeholder="Search for a service..."
          />
        </div>
        <button onClick={handleSearch} className="btn-primary px-4">Search</button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setCategory('')}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !category ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.name)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              category === cat.name ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No professionals found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different category or location</p>
          <button
            onClick={() => navigate('/waitlist')}
            className="btn-secondary mt-4 text-sm"
          >
            Join Waitlist
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{results.length} professional(s) found</p>
          {results.map((r) => (
            <SearchCard
              key={r.id}
              result={r}
              onBook={(id) => navigate(`/book/${id}`)}
              onViewProfile={(id) => navigate(`/professional/${id}`)}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
