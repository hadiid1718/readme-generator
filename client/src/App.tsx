/**
 * App Component
 * Root component with routing, auth initialization, and layout
 */
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import TermOfPolicyPage from './pages/TermOfPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GeneratorPage from './pages/GeneratorPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

/**
 * OAuth Token Handler
 * Extracts token from URL params (after Google OAuth redirect)
 */
const OAuthHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { handleOAuthToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleOAuthToken(token);
      // Remove token from URL
      searchParams.delete('token');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  return null;
};

/**
 * Route-aware shell
 */
const AppShell = () => {
  const { loadUser } = useAuthStore();
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Navbar />}
      <OAuthHandler />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/term-of-policy" element={<TermOfPolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/generator" element={<GeneratorPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboardPage />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
          },
        }}
      />
    </div>
  );
};

/**
 * Main App Layout
 */
const AppLayout = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default AppLayout;
