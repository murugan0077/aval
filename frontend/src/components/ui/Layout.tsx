import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Search, Calendar, User, LogOut, ChevronLeft,
  Briefcase, Star, Shield, Settings,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function Layout({ children, title, showBack, onBack }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = user?.role === 'PROFESSIONAL'
    ? [
        { path: '/professional/dashboard', label: 'Dashboard', icon: Home },
        { path: '/professional/bookings', label: 'Bookings', icon: Calendar },
        { path: '/professional/profile', label: 'Profile', icon: User },
      ]
    : [
        { path: '/', label: 'Home', icon: Home },
        { path: '/search', label: 'Search', icon: Search },
        { path: '/bookings', label: 'Bookings', icon: Calendar },
        { path: '/profile', label: 'Profile', icon: User },
      ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={onBack || (() => navigate(-1))} className="btn-ghost p-1">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="text-xl font-bold text-brand-600">
            NearSkill
          </Link>
          {title && <span className="text-gray-400">/</span>}
          {title && <span className="text-sm text-gray-600 font-medium">{title}</span>}
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <button onClick={logout} className="btn-ghost text-gray-400 hover:text-red-500" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-24 pt-4">
        {children}
      </main>

      {/* Bottom Nav */}
      {user && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-100 px-2 py-1 z-50">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-brand-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-0.5 font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
