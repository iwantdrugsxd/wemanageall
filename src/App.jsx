import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectWorkspace from './pages/ProjectWorkspace';
import Calendar from './pages/Calendar';
import Emotions from './pages/Emotions';
import Money from './pages/Money';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Library from './pages/Library';
import Lists from './pages/Lists';
import Organizations from './pages/Organizations';
import Pricing from './pages/Pricing';
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
    return <Navigate to="/welcome" replace />;
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
      // Always go to welcome page first after login
      return <Navigate to="/welcome" replace />;
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
          <ProtectedRoute>
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
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Dashboard />
            </Layout>
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
      <Route 
        path="/calendar" 
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
        path="/notifications" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Notifications />
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
        path="/library" 
        element={
          <ProtectedRoute requireOnboarding>
            <Layout>
              <Library />
            </Layout>
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
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
