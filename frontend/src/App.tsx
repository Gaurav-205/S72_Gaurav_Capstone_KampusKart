import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import KampusKartNavbar from './components/KampusKartNavbar';
import BackToTop from './components/common/BackToTop';

// Lazy load all route components
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Landing = React.lazy(() => import('./pages/Landing'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const Home = React.lazy(() => import('./pages/Home'));
const LostFound = React.lazy(() => import('./pages/LostFound'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Complaints = React.lazy(() => import('./pages/Complaints'));
const CampusMap = React.lazy(() => import('./pages/CampusMap'));
const Events = React.lazy(() => import('./pages/Events'));
const News = React.lazy(() => import('./pages/News'));
const Facilities = React.lazy(() => import('./pages/Facilities'));
const Chat = React.lazy(() => import('./pages/Chat'));
const ClubsRecruitment = React.lazy(() => import('./pages/ClubsRecruitment'));
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));

// Centralized lazy loading fallback - simple spinner
const PageLoader = () => (
  <div className="flex justify-center items-center w-full min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C6A7]"></div>
  </div>
);

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/home" />;
  }

  return <>{children}</>;
};

// Google Callback component
const GoogleCallback: React.FC = () => {
  const { handleGoogleCallback } = useAuth();
  const location = useLocation();
  const [done, setDone] = React.useState(false);
  const search = location.search;

  React.useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get('token');
    if (token) {
      handleGoogleCallback(token)
        .catch(() => {})
        .finally(() => setDone(true));
    } else {
      setDone(true);
    }
  }, [handleGoogleCallback, search]);

  if (!done) return null;
  return <Navigate to="/home" />;
};

// Layout wrapper that shows navbar on all pages except login/signup
const AppLayout: React.FC = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/signup', '/forgot-password'];
  const showNavbar = !hideNavbarRoutes.some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  React.useEffect(() => {
    const lockScrollRoutes = ['/login', '/signup'];
    const shouldLockScroll = lockScrollRoutes.some(
      (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
    );

    document.documentElement.style.overflow = shouldLockScroll ? 'hidden' : '';
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <KampusKartNavbar />}
      <div className="flex-grow">
        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lostfound"
              element={
                <ProtectedRoute>
                  <LostFound />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints"
              element={
                <ProtectedRoute>
                  <Complaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campus-map"
              element={
                <ProtectedRoute>
                  <CampusMap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news"
              element={
                <ProtectedRoute>
                  <News />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilities"
              element={
                <ProtectedRoute>
                  <Facilities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clubs-recruitment"
              element={
                <ProtectedRoute>
                  <ClubsRecruitment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </React.Suspense>
      </div>
      {showNavbar && <BackToTop />}
    </div>
  );
};

// Root redirect component
const RootRedirect: React.FC = () => {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/home" />;
  }
  return <Landing />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppLayout />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
