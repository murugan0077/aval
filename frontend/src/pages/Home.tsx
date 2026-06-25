import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Layout } from '../components/ui/Layout';
import { Search, MapPin, Zap, ChevronRight, Wrench, PenTool, PaintBucket, BookOpen, Smartphone, Sparkles, Calendar } from 'lucide-react';

const iconMap: Record<string, any> = {
  '🔧': Wrench,
  '⚡': Zap,
  '🪚': PenTool,
  '📚': BookOpen,
  '🖌️': PaintBucket,
  '🧹': Sparkles,
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-brand-600 to-brand-800">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2">NearSkill</h1>
          <p className="text-brand-100 mb-8">Find verified local professionals for every need</p>
          <Link to="/login" className="block w-full bg-white text-brand-600 px-8 py-3 rounded-xl font-semibold mb-3">
            Sign In
          </Link>
          <Link to="/register" className="block w-full border-2 border-white text-white px-8 py-3 rounded-xl font-semibold">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {/* Location Bar */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
        <span>{user?.city || 'Showing services in all cities'}</span>
        <button onClick={() => navigate('/profile')} className="text-brand-600 font-medium ml-auto shrink-0">Change</button>
      </div>

      {/* Search Bar */}
      <button
        onClick={() => navigate('/search')}
        className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 mb-6 text-gray-400 hover:border-brand-300 transition-colors"
      >
        <Search className="w-5 h-5" />
        <span>What service do you need?</span>
      </button>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => navigate('/search?instant=1')}
          className="card flex items-center gap-3 hover:border-brand-200"
        >
          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">Instant Service</p>
            <p className="text-xs text-gray-500">Available now</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/bookings')}
          className="card flex items-center gap-3 hover:border-brand-200"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">My Bookings</p>
            <p className="text-xs text-gray-500">View all</p>
          </div>
        </button>
      </div>

      {/* Categories */}
      <h2 className="font-semibold text-lg mb-3">Services</h2>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Wrench;
          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/search?category=${cat.name}`)}
              className="card flex items-center gap-3 hover:border-brand-200 text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">{cat.name}</p>
                <p className="text-xs text-gray-400">{cat.subCategories?.length || 0} services</p>
              </div>
            </button>
          );
        })}
      </div>
    </Layout>
  );
}


