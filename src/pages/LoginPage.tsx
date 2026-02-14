import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Palette, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword,
} from '@/services/authService';
import { isFirebaseConfigured } from '@/config/firebase';

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showRegisterHint, setShowRegisterHint] = useState(false);

  const navigate = useNavigate();
  const { login } = useApp();
  const firebaseReady = isFirebaseConfigured();

  const clearMessages = () => { setError(''); setSuccess(''); setShowRegisterHint(false); };

  // ============================================================
  // EMAIL LOGIN / REGISTER
  // ============================================================

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      let result;
      if (mode === 'register') {
        if (!name.trim()) { setError('Please enter your full name'); setLoading(false); return; }
        if (!email.trim()) { setError('Please enter your email address'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        // Everyone registers as customer first
        result = await registerWithEmail(email, password, name, 'customer');
      } else {
        if (!email.trim()) { setError('Please enter your email address'); setLoading(false); return; }
        if (!password.trim()) { setError('Please enter your password'); setLoading(false); return; }
        result = await loginWithEmail(email, password, 'customer');
      }

      if (result.success) {
        login('customer');
        navigate('/');
      } else {
        const errMsg = result.error || 'Authentication failed';
        setError(errMsg);
        if (mode === 'login' && (
          errMsg.includes('No account found') ||
          errMsg.includes('Invalid email or password')
        )) {
          setShowRegisterHint(true);
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  const handleGoogleLogin = async () => {
    clearMessages();
    setLoading(true);

    try {
      // Everyone starts as customer
      const result = await loginWithGoogle('customer');
      if (result.success) {
        login('customer');
        navigate('/');
      } else {
        setError(result.error || 'Google sign-in failed');
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!forgotEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(forgotEmail);
      if (result.success) {
        setSuccess('Password reset email sent! Check your inbox.');
        setTimeout(() => setShowForgotPassword(false), 3000);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch {
      setError('Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORGOT PASSWORD MODAL
  // ============================================================

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-scale-in">
          <button onClick={() => { setShowForgotPassword(false); clearMessages(); }}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Login
          </button>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Mail className="text-white" size={28} />
          </div>

          <h2 className="text-2xl font-bold text-center text-stone-800 mb-2">Reset Password</h2>
          <p className="text-stone-500 text-sm text-center mb-6">
            Enter your email and we'll send you a link to reset your password
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" /> <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" /> <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="email" placeholder="you@example.com" value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)} required autoFocus
                  className="w-full px-4 py-3 pl-11 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-200/60 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN LOGIN UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">

        {/* ===== Left Panel - Brand ===== */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/20 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl mx-auto mb-6">
              <Palette className="text-white" size={48} />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">HunarHub</h1>
            <p className="text-amber-200/80 mt-2 text-lg">Custom Art Marketplace</p>
            <p className="text-amber-100/60 mt-4 text-sm max-w-xs mx-auto leading-relaxed">
              Connect with talented artists & craftsmen across India for custom art, portraits, home decor, and handmade products.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 text-left">
              {[
                { emoji: '🎨', text: '500+ Artists' },
                { emoji: '⭐', text: '4.8 Avg Rating' },
                { emoji: '📦', text: '10k+ Orders' },
                { emoji: '🇮🇳', text: 'Pan-India' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <span>{item.emoji}</span>
                  <span className="text-white text-xs font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Firebase Status */}
            <div className={cn(
              'mt-6 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 justify-center',
              firebaseReady ? 'bg-green-500/20 text-green-200' : 'bg-yellow-500/20 text-yellow-200'
            )}>
              {firebaseReady ? (
                <><CheckCircle2 size={14} /> Firebase Connected</>
              ) : (
                <><AlertCircle size={14} /> Demo Mode (Mock Auth)</>
              )}
            </div>
          </div>
        </div>

        {/* ===== Right Panel - Form ===== */}
        <div className="p-6 sm:p-10 lg:p-12 overflow-y-auto max-h-screen">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg">
              <Palette className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold gradient-text">HunarHub</h1>
              <p className="text-xs text-stone-400">Custom Art Marketplace</p>
            </div>
          </div>

          {/* Firebase status on mobile */}
          {!firebaseReady && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800 flex items-center gap-2 lg:hidden">
              <AlertCircle size={14} />
              <span><strong>Demo Mode:</strong> Firebase not configured. Any credentials work.</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-stone-800">
              {mode === 'login' ? 'Welcome back!' : 'Create Account'}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              mode === 'login'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {mode === 'login' ? 'LOGIN' : 'NEW USER'}
            </span>
          </div>
          <p className="text-stone-500 text-sm mb-6">
            {mode === 'login'
              ? 'Sign in to browse artists and order custom art'
              : '🎉 Join HunarHub as a customer — you can become an artist later!'}
          </p>

          {/* Error / Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700 animate-slide-down">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {showRegisterHint && mode === 'login' && (
                <div className="mt-2 pt-2 border-t border-red-200">
                  <p className="text-xs text-red-600 mb-2">👆 It looks like you don't have an account yet.</p>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setShowRegisterHint(false); clearMessages(); }}
                    className="w-full py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-all">
                    Create a New Account Instead →
                  </button>
                </div>
              )}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-700 flex items-start gap-2 animate-slide-down">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* ================================================================ */}
          {/* EMAIL FORM                                                       */}
          {/* ================================================================ */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {/* Name (register only) */}
            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Full Name</label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 transition-all" />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required autoComplete="email"
                  className="w-full px-4 py-3 pl-11 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type={showPassword ? 'text' : 'password'} placeholder={mode === 'register' ? 'Min 6 characters' : 'Enter password'}
                  value={password} onChange={e => setPassword(e.target.value)} required
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className="w-full px-4 py-3 pl-11 pr-11 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-[11px] text-stone-400 mt-1.5">Must be at least 6 characters long</p>
              )}
            </div>

            {/* Forgot Password */}
            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => { setShowForgotPassword(true); setForgotEmail(email); clearMessages(); }}
                  className="text-xs text-amber-600 font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-200/60 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' ? '🔓 Sign In to My Account' : '🚀 Create My Account'}
            </button>
          </form>

          {/* ===== Divider ===== */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400">or continue with</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* ===== Google Login ===== */}
          <button onClick={handleGoogleLogin} disabled={loading}
            className="w-full py-3.5 border-2 border-stone-200 rounded-xl text-sm font-semibold text-stone-700 flex items-center justify-center gap-2.5 hover:bg-stone-50 hover:border-stone-300 transition-all disabled:opacity-50">
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* ===== Toggle Login / Register ===== */}
          <div className="mt-5 p-4 bg-stone-50 rounded-xl border border-stone-200 text-center">
            <p className="text-sm text-stone-600">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); clearMessages(); }}
                className="text-amber-600 font-bold hover:underline">
                {mode === 'login' ? 'Create Account (Sign Up)' : 'Sign In'}
              </button>
            </p>
            {mode === 'login' && (
              <p className="text-[11px] text-stone-400 mt-1">
                ⚡ First time? You need to <strong>Sign Up</strong> first before logging in
              </p>
            )}
          </div>

          {/* Info about becoming artist */}
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-xs text-amber-800">
              🎨 <strong>Are you an artist?</strong> Sign up first as a customer, then go to <strong>Profile → Become an Artist</strong> to create your artist profile and start receiving orders!
            </p>
          </div>

          {/* Demo hint */}
          {!firebaseReady && (
            <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                🔧 <strong>Demo Mode</strong> — Firebase not configured.<br />
                <strong>Email:</strong> Any email & password works<br />
                <strong>Google:</strong> Mock sign-in
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
