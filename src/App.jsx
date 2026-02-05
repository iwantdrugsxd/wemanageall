import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectWorkspace from './pages/ProjectWorkspace';
import Calendar from './pages/Calendar';
import Emotions from './pages/Emotions';
import Money from './pages/Money';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Library from './pages/Library';
import Lists from './pages/Lists';
import Pricing from './pages/Pricing';
import Work from './pages/Work';
import DocsHub from './pages/DocsHub';
import Admin from './pages/Admin';
import Layout from './components/Layout';

// Loading spinner component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-ofa-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-ofa-ink flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="font-display text-ofa-cream text-xl font-semibold">O</span>
        </div>
        <p className="text-ofa-slate text-sm">Loading...</p>
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

function App() {
  return (
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
      {/* Legacy route redirects - Library */}
      <Route 
        path="/library" 
        element={
          <ProtectedRoute requireOnboarding>
            <Navigate to="/docs?view=library" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/library/:id" 
        element={
          <ProtectedRoute requireOnboarding>
            <Library />
          </ProtectedRoute>
        } 
      />
      {/* Legacy route redirects - Lists */}
      <Route 
        path="/lists" 
        element={
          <ProtectedRoute requireOnboarding>
            <Navigate to="/docs?view=lists" replace />
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
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
