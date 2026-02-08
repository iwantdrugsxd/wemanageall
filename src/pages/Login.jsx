import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      // Let AuthRoute handle the redirect based on onboarding status
      // The backend returns the correct redirect, but AuthRoute will override if needed
      if (result.redirect) {
        navigate(result.redirect);
      } else {
        // Fallback: let AuthRoute handle it
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 -left-24 w-96 h-96 bg-black rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-black rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <span className="font-display text-ofa-cream text-xl font-semibold">O</span>
            </div>
            <span className="font-display text-2xl font-semibold text-ofa-cream">OFA</span>
          </Link>
          
          <blockquote className="mb-12">
            <p className="font-display text-4xl xl:text-5xl text-ofa-cream leading-tight mb-6">
              "The best time to plant a tree was 20 years ago. The second best time is <span className="text-black italic">now</span>."
            </p>
            <footer className="text-ofa-cloud/60 text-sm">— Chinese Proverb</footer>
          </blockquote>
          
          <div className="space-y-4">
            {['Design your life with intention', 'See patterns you never noticed', 'Make decisions with clarity'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-ofa-cloud/80">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
              <span className="font-display text-ofa-cream text-lg font-semibold">O</span>
            </div>
            <span className="font-display text-xl font-semibold text-black">OFA</span>
          </Link>
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl text-black mb-3">Welcome back</h1>
            <p className="text-gray-600">Continue designing your life.</p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-gray-100 border text-black text-black text-sm">
              {error}
            </div>
          )}
          
          {/* Google OAuth Button */}
          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </a>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">Email</label>
              <input 
                type="email" 
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="input-field"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-black">Password</label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-black hover:text-black-deep transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-field pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 justify-center"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                <>
                  Log in
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-black font-medium hover:text-black transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-black">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail('');
                  setForgotSuccess(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  If an account exists, a reset link was sent to <strong>{forgotEmail}</strong>.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail('');
                    setForgotSuccess(false);
                  }}
                  className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setForgotLoading(true);
                  try {
                    const response = await fetch('/api/auth/forgot-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ email: forgotEmail }),
                    });

                    if (response.ok) {
                      setForgotSuccess(true);
                    } else {
                      const data = await response.json();
                      setError(data.error || 'Failed to send reset email');
                    }
                  } catch (err) {
                    setError('Network error. Please try again.');
                  } finally {
                    setForgotLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
