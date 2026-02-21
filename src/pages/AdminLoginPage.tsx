import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      const adminsRef = collection(db, 'admins')
      const q = query(adminsRef, where('email', '==', email))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        await auth.signOut()
        setError('Access denied. You are not an admin.')
        setLoading(false)
        return
      }

      const adminData = snapshot.docs[0].data()
      sessionStorage.setItem('adminSession', JSON.stringify({
        uid,
        email,
        name: adminData.name || 'Admin',
        role: 'admin',
        loginTime: new Date().toISOString()
      }))

      navigate('/admin/dashboard')
    } catch (err: any) {
      console.error('Admin login error:', err)
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else if (err.code === 'auth/wrong-password') {
        setError('Wrong password')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-amber-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-stone-800 dark:text-white tracking-tight">HunarHub Admin</h1>
          <p className="text-stone-500 dark:text-gray-400 text-sm mt-2">Authorized personnel only</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 shadow-xl border border-stone-200 dark:border-gray-700">

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm mb-5 flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-stone-600 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@hunarhub.com"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-stone-600 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-12 transition-all text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-gray-500 hover:text-stone-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
              ) : (
                <><Shield className="w-5 h-5" /> Login as Admin</>
              )}
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-stone-100 dark:border-gray-700">
            <p className="text-stone-400 dark:text-gray-500 text-xs text-center leading-relaxed">
              🔒 This panel is restricted to authorized administrators only.<br />
              Unauthorized access attempts are logged.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-5">
          <button
            onClick={() => navigate('/login')}
            className="text-stone-400 dark:text-gray-500 text-sm hover:text-stone-600 dark:hover:text-gray-300 transition-colors"
          >
            ← Back to HunarHub
          </button>
        </div>
      </div>
    </div>
  )
}