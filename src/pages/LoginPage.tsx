import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, Eye, EyeOff, Palette, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { type UserRole } from '@/types';
import { cn } from '@/utils/cn';
import {
  loginWithEmail,
  registerWithEmail,
  sendPhoneOTP,
  verifyPhoneOTP,
  loginWithGoogle,
  resetPassword,
} from '@/services/authService';
import { isFirebaseConfigured } from '@/config/firebase';

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [role, setRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useApp();

  const firebaseReady = isFirebaseConfigured();

  const clearMessages = () => { setError(''); setSuccess(''); };

  // ---- Email Login / Register ----
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      let result;
      if (mode === 'register') {
        if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        result = await registerWithEmail(email, password, name, role);
      } else {
        result = await loginWithEmail(email, password, role);
      }

      if (result.success) {
        login(role);
        navigate('/');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---- Phone OTP ----
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!phone.trim()) { setError('Please enter phone number'); return; }
    setLoading(true);

    try {
      const result = await sendPhoneOTP(phone, 'recaptcha-container');
      if (result.success) {
        setOtpSent(true);
        setSuccess('OTP sent successfully!' + (!firebaseReady ? ' Use 123456 for testing.' : ''));
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!otp.trim()) { setError('Please enter OTP'); return; }
    setLoading(true);

    try {
      const result = await verifyPhoneOTP(otp, role);
      if (result.success) {
        login(role);
        navigate('/');
      } else {
        setError(result.error || 'Invalid OTP');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---- Google Login ----
  const handleGoogleLogin = async () => {
    clearMessages();
    setLoading(true);

    try {
      const result = await loginWithGoogle(role);
      if (result.success) {
        login(role);
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

  // ---- Forgot Password ----
  const handleForgotPassword = async () => {
    clearMessages();
    if (!email.trim()) { setError('Please enter your email first'); return; }
    setLoading(true);

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch {
      setError('Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Left Panel - Brand */}
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

        {/* Right Panel - Form */}
        <div className="p-6 sm:p-10 lg:p-12">
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
              <span><strong>Demo Mode:</strong> Firebase not configured. Any credentials will work.</span>
            </div>
          )}

          <h2 className="text-2xl font-bold text-stone-800 mb-1">
            {mode === 'login' ? 'Welcome back!' : 'Create Account'}
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            {mode === 'login' ? 'Sign in to continue your creative journey' : 'Join the creative community'}
          </p>

          {/* Error / Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700 flex items-center gap-2 animate-slide-down">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-700 flex items-center gap-2 animate-slide-down">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Role Selector */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
            <button onClick={() => { setRole('customer'); clearMessages(); }}
              className={cn('flex-1 py-3 rounded-lg text-sm font-semibold transition-all', role === 'customer' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500')}>
              🛒 Customer
            </button>
            <button onClick={() => { setRole('artist'); clearMessages(); }}
              className={cn('flex-1 py-3 rounded-lg text-sm font-semibold transition-all', role === 'artist' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500')}>
              🎨 Artist
            </button>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => { setAuthMethod('email'); clearMessages(); setOtpSent(false); }}
              className={cn('flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all', authMethod === 'email' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}>
              <Mail size={14} /> Email
            </button>
            <button type="button" onClick={() => { setAuthMethod('phone'); clearMessages(); }}
              className={cn('flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all', authMethod === 'phone' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}>
              <Phone size={14} /> Phone
            </button>
          </div>

          {/* ===== EMAIL FORM ===== */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Full Name</label>
                  <input type="text" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400" />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full px-4 py-3 pl-11 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full px-4 py-3 pl-11 pr-11 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="text-right">
                  <button type="button" onClick={handleForgotPassword} disabled={loading}
                    className="text-xs text-amber-600 font-semibold hover:underline disabled:opacity-50">
                    {showForgotPassword ? 'Sending...' : 'Forgot password?'}
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-200/60 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ===== PHONE FORM ===== */}
          {authMethod === 'phone' && (
            <>
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required
                        className="w-full px-4 py-3 pl-11 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-200/60 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Send OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Enter OTP</label>
                    <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400" />
                    <p className="text-xs text-stone-400 mt-2 text-center">
                      OTP sent to {phone} • <button type="button" onClick={() => { setOtpSent(false); clearMessages(); }} className="text-amber-600 font-semibold">Change</button>
                    </p>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-200/60 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Verify & Sign In
                  </button>

                  <button type="button" onClick={handleSendOTP} disabled={loading}
                    className="w-full py-2.5 text-amber-600 text-sm font-semibold hover:underline disabled:opacity-50">
                    Resend OTP
                  </button>
                </form>
              )}
            </>
          )}

          {/* Recaptcha Container (invisible) */}
          <div id="recaptcha-container" />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400">or continue with</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Google Login */}
          <button onClick={handleGoogleLogin} disabled={loading}
            className="w-full py-3.5 border-2 border-stone-200 rounded-xl text-sm font-semibold text-stone-700 flex items-center justify-center gap-2.5 hover:bg-stone-50 hover:border-stone-300 transition-all disabled:opacity-50">
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <p className="text-center text-sm text-stone-500 mt-5">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); clearMessages(); }} className="text-amber-600 font-bold hover:underline">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          {/* Session Info (Debug) */}
          {!firebaseReady && (
            <p className="text-center text-[10px] text-stone-400 mt-4">
              🔧 Demo mode: No Firebase config. Auth uses mock tokens stored in sessionStorage.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
