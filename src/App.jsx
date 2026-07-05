import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
// Landing/Login/Signup stay eager: they sit on the critical path for a
// cold visit and lazy-loading them would just add a round trip with no
// benefit. Everything behind auth is lazy-loaded so a first-time visitor
// (or someone who never leaves Home) never downloads code for Money,
// Emotions, Admin, etc. - smaller initial bundle, faster first paint.
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';

const Onboarding = lazy(() => import('./pages/Onboarding'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectWorkspace = lazy(() => import('./pages/ProjectWorkspace'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Emotions = lazy(() => import('./pages/Emotions'));
const Money = lazy(() => import('./pages/Money'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Library = lazy(() => import('./pages/Library'));
const Lists = lazy(() => import('./pages/Lists'));
const ListShare = lazy(() => import('./pages/ListShare'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Work = lazy(() => import('./pages/Work'));
const DocsHub = lazy(() => import('./pages/DocsHub'));
const Admin = lazy(() => import('./pages/Admin'));
const Organizations = lazy(() => import('./pages/Organizations'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Loading spinner component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-[breathe_1.6s_ease-in-out_infinite]"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <span className="text-white text-xl font-semibold">W</span>
        </div>
        <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children, requireOnboarding = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If onboarding required but not completed, redirect to onboarding
  if (requireOnboarding && !user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding completed but trying to access onboarding page
  if (!requireOnboarding && user.onboardingCompleted && window.location.pathname === '/onboarding') {
    return <Navigate to="/home" replace />;
  }

  return children;
}

// Auth route wrapper (redirect if already logged in)
function AuthRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    // Redirect based on onboarding status
    if (user.onboardingCompleted) {
      // Go to home after onboarding is completed
      return <Navigate to="/home" replace />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return children;
}

// Redirect component for /library/:id to /resources/:id
function LibraryRedirect() {
  const { id } = useParams();
  return <Navigate to={`/resources/${id}`} replace />;
}

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      
      {/* Auth routes (redirect if logged in) */}
      <Route 
        path="/login" 
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <AuthRoute>
            <Signup />
          </AuthRoute>
        } 
      />
      
      {/* Onboarding (no layout) */}
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute requireOnboarding={false}>
            <Onboarding />
          </ProtectedRoute>
        } 
      />

      {/* Welcome (no layout) */}
      <Route 
        path="/welcome" 
        element={
          <ProtectedRoute requireOnboarding>
            <Welcome />
          </ProtectedRoute>
        } 
      />
      
      {/* Main app routes (with layout) */}
      {/* New primary routes */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/work" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Work />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/docs" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <DocsHub />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Legacy route redirects */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requireOnboarding>
            <Navigate to="/home" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Projects />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects/:id" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <ProjectWorkspace />
            </Layout>
          </ProtectedRoute>
        } 
      />
      {/* Legacy route redirects - Calendar */}
      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute requireOnboarding>
            <Navigate to="/work?view=calendar" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/calendar/legacy" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Calendar />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/emotions" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Emotions />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/money" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Money />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Admin />
            </Layout>
          </ProtectedRoute>
        } 
      />
      {/* Legacy route redirects - Notifications */}
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute requireOnboarding>
            <Navigate to="/work?view=notifications" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications/legacy" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Notifications />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pricing" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Pricing />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organizations" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Organizations />
            </Layout>
          </ProtectedRoute>
        } 
      />
      {/* Library routes - redirect to Resources */}
      <Route 
        path="/library" 
        element={
          <ProtectedRoute requireOnboarding>
            <Navigate to="/resources" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/library/:id" 
        element={
          <ProtectedRoute requireOnboarding>
            <LibraryRedirect />
          </ProtectedRoute>
        } 
      />
      {/* Lists routes */}
      <Route 
        path="/lists" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Lists />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/lists/:id" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Lists />
            </Layout>
          </ProtectedRoute>
        } 
      />
      {/* Public shared list route (no auth required) */}
      <Route 
        path="/lists/share/:code" 
        element={<ListShare />} 
      />
      {/* Resources route (alias to Library) */}
      <Route 
        path="/resources" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Library />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/resources/:id" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Library />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Legal Pages (no auth required) */}
      <Route 
        path="/terms" 
        element={<Terms />} 
      />
      <Route 
        path="/privacy" 
        element={<Privacy />} 
      />
      
      {/* Password Reset (no auth required) */}
      <Route 
        path="/reset-password" 
        element={<ResetPassword />} 
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

export default App;
