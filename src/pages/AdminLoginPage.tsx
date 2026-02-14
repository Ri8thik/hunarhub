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
      // First authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      // Check if this user is an admin in Firestore
      const adminsRef = collection(db, 'admins')
      const q = query(adminsRef, where('email', '==', email))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        // Not an admin - sign out and show error
        await auth.signOut()
        setError('Access denied. You are not an admin.')
        setLoading(false)
        return
      }

      // Save admin session
      const adminData = snapshot.docs[0].data()
      sessionStorage.setItem('adminSession', JSON.stringify({
        uid,
        email,
        name: adminData.name || 'Admin',
        role: 'admin',
        loginTime: new Date().toISOString()
      }))

      // Navigate to admin dashboard
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-600/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">HunarHub Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Admin access only</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@hunarhub.com"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-12"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
              ) : (
                <><Shield className="w-5 h-5" /> Login as Admin</>
              )}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-gray-500 text-xs text-center">
              This panel is restricted to authorized administrators only.
              Unauthorized access attempts are logged.
            </p>
          </div>
        </div>

        {/* Back to main app */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-500 text-sm hover:text-gray-400"
          >
            ← Back to HunarHub
          </button>
        </div>
      </div>
    </div>
  )
}