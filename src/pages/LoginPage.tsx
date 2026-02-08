import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, Eye, EyeOff, Palette } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { type UserRole } from '@/types';
import { cn } from '@/utils/cn';

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [role, setRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { login } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    navigate('/');
  };

  const handleGoogleLogin = () => {
    login(role);
    navigate('/');
  };

  return (
    <div className="h-full native-scroll bg-gradient-to-b from-amber-50 via-orange-50 to-stone-50">
      {/* Header */}
      <div className="flex flex-col items-center justify-center px-6 pt-12 pb-6">
        <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-xl shadow-amber-200/50 mb-4">
          <Palette className="text-white" size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">HunarHub</h1>
        <p className="text-stone-500 mt-1 text-sm">Connect with Artists & Craftsmen</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-t-[32px] shadow-[0_-4px_30px_rgba(0,0,0,0.06)] px-6 pt-7 pb-10 min-h-[55vh]">
        <h2 className="text-xl font-bold text-stone-800 mb-0.5">
          {mode === 'login' ? 'Welcome back!' : 'Create Account'}
        </h2>
        <p className="text-stone-500 text-sm mb-5">
          {mode === 'login' ? 'Sign in to continue' : 'Join the creative community'}
        </p>

        {/* Role Selector */}
        <div className="flex bg-stone-100 rounded-2xl p-1 mb-5">
          <button
            onClick={() => setRole('customer')}
            className={cn(
              'flex-1 py-3 rounded-xl text-sm font-semibold transition-all',
              role === 'customer' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500'
            )}
          >🛒 Customer</button>
          <button
            onClick={() => setRole('artist')}
            className={cn(
              'flex-1 py-3 rounded-xl text-sm font-semibold transition-all',
              role === 'artist' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500'
            )}
          >🎨 Artist</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div className="relative">
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3.5 pl-11 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
              <span className="absolute left-3.5 top-3.5 text-stone-400 text-lg">👤</span>
            </div>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={() => setAuthMethod('email')}
              className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold', authMethod === 'email' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500')}>
              <Mail size={14} /> Email
            </button>
            <button type="button" onClick={() => setAuthMethod('phone')}
              className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold', authMethod === 'phone' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500')}>
              <Phone size={14} /> Phone
            </button>
          </div>

          {authMethod === 'email' ? (
            <>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-4 text-stone-400" />
                <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 pl-11 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-4 text-stone-400" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pl-11 pr-11 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-4 text-stone-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </>
          ) : (
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-4 text-stone-400" />
              <input type="tel" placeholder="+91 Phone number" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3.5 pl-11 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
            </div>
          )}

          {mode === 'login' && authMethod === 'email' && (
            <div className="text-right">
              <button type="button" className="text-xs text-amber-600 font-semibold">Forgot password?</button>
            </div>
          )}

          <button type="submit"
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-amber-200/60 active:scale-[0.97] transition-transform">
            {mode === 'login' ? (authMethod === 'phone' ? 'Send OTP' : 'Sign In') : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">or</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <button onClick={handleGoogleLogin}
          className="w-full py-3.5 border-2 border-stone-200 rounded-2xl text-sm font-semibold text-stone-700 flex items-center justify-center gap-2.5 active:bg-stone-50">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-stone-500 mt-5">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-amber-600 font-bold">
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
