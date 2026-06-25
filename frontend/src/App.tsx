import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import ProfessionalProfilePage from './pages/ProfessionalProfile';
import ProfessionalPublicProfile from './pages/ProfessionalPublicProfile';
import BookService from './pages/BookService';
import BookingsPage from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import PaymentPage from './pages/Payment';
import ReceiptPage from './pages/Receipt';
import WaitlistPage from './pages/Waitlist';
import DisputesPage from './pages/Disputes';
import CustomerProfile from './pages/CustomerProfile';
import ProfessionalOnboarding from './pages/ProfessionalOnboarding';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import ProfessionalBookings from './pages/ProfessionalBookings';
import ProfProfilePage from './pages/ProfessionalProfile';
import PremiumPage from './pages/Premium';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;
  if (user) return <Navigate to="/" />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#333',
              color: '#fff',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/professional/:id" element={<ProtectedRoute><ProfessionalPublicProfile /></ProtectedRoute>} />
          <Route path="/book/:id" element={<ProtectedRoute><BookService /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
          <Route path="/booking/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
          <Route path="/payment/:bookingId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/receipt/:bookingId" element={<ProtectedRoute><ReceiptPage /></ProtectedRoute>} />
          <Route path="/waitlist" element={<ProtectedRoute><WaitlistPage /></ProtectedRoute>} />
          <Route path="/disputes" element={<ProtectedRoute><DisputesPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><CustomerProfile /></ProtectedRoute>} />

          {/* Professional */}
          <Route path="/professional/onboarding" element={<ProtectedRoute><ProfessionalOnboarding /></ProtectedRoute>} />
          <Route path="/professional/dashboard" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
          <Route path="/professional/bookings" element={<ProtectedRoute><ProfessionalBookings /></ProtectedRoute>} />
          <Route path="/professional/profile" element={<ProtectedRoute><ProfProfilePage /></ProtectedRoute>} />

          {/* Premium */}
          <Route path="/premium" element={<ProtectedRoute><PremiumPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
