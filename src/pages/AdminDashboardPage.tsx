import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import {
  Shield, LogOut, Users, Search, Plus, Edit, Trash2, X, Save,
  Loader2, ChevronDown, ChevronUp, Eye, UserCheck, Palette
} from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  location?: string
  joinedDate?: string
  isArtist?: boolean
  artistProfile?: {
    bio?: string
    skills?: string[]
    priceRange?: { min: number; max: number }
    rating?: number
    reviewCount?: number
    completedOrders?: number
    availability?: string
    verified?: boolean
    portfolio?: any[]
  }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [sortField, setSortField] = useState<string>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState<UserData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ total: 0, customers: 0, artists: 0 })

  // New user form
  const [newUser, setNewUser] = useState({
    name: '', email: '', role: 'customer', phone: '', location: ''
  })

  // Check admin session
  useEffect(() => {
    const session = sessionStorage.getItem('adminSession')
    if (!session) {
      navigate('/admin')
      return
    }
    fetchAllUsers()
  }, [navigate])

  const fetchAllUsers = async () => {
    setLoading(true)
    try {
      const usersMap = new Map<string, UserData>()

      // Fetch from users collection
      const usersSnap = await getDocs(collection(db, 'users'))
      usersSnap.forEach(docSnap => {
        const data = docSnap.data()
        usersMap.set(docSnap.id, {
          id: docSnap.id,
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'customer',
          phone: data.phone || '',
          location: data.location || '',
          joinedDate: data.joinedDate || data.createdAt || '',
          isArtist: false
        })
      })

      // Fetch from artists collection
      const artistsSnap = await getDocs(collection(db, 'artists'))
      artistsSnap.forEach(docSnap => {
        const data = docSnap.data()
        const id = data.userId || docSnap.id
        const existing = usersMap.get(id)

        if (existing) {
          existing.isArtist = true
          existing.artistProfile = {
            bio: data.bio || '',
            skills: data.skills || [],
            priceRange: data.priceRange || { min: 0, max: 0 },
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            completedOrders: data.completedOrders || 0,
            availability: data.availability || 'available',
            verified: data.verified || false,
            portfolio: data.portfolio || []
          }
          if (!existing.location && data.location) existing.location = data.location
          if (!existing.name && data.name) existing.name = data.name
        } else {
          usersMap.set(id, {
            id,
            name: data.name || '',
            email: data.email || '',
            role: 'artist',
            phone: '',
            location: data.location || '',
            joinedDate: data.joinedDate || '',
            isArtist: true,
            artistProfile: {
              bio: data.bio || '',
              skills: data.skills || [],
              priceRange: data.priceRange || { min: 0, max: 0 },
              rating: data.rating || 0,
              reviewCount: data.reviewCount || 0,
              completedOrders: data.completedOrders || 0,
              availability: data.availability || 'available',
              verified: data.verified || false,
              portfolio: data.portfolio || []
            }
          })
        }
      })

      const allUsers = Array.from(usersMap.values())
      setUsers(allUsers)
      setStats({
        total: allUsers.length,
        customers: allUsers.filter(u => !u.isArtist).length,
        artists: allUsers.filter(u => u.isArtist).length
      })
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      setSaving(true)
      // Delete from users collection
      await deleteDoc(doc(db, 'users', userId))
      // Delete from artists collection if exists
      try { await deleteDoc(doc(db, 'artists', userId)) } catch (e) { /* ignore */ }
      setUsers(prev => prev.filter(u => u.id !== userId))
      setDeleteConfirm(null)
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        customers: users.find(u => u.id === userId)?.isArtist ? prev.customers : prev.customers - 1,
        artists: users.find(u => u.id === userId)?.isArtist ? prev.artists - 1 : prev.artists
      }))
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('Failed to delete user')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setSaving(true)
    try {
      // Update users collection
      await updateDoc(doc(db, 'users', editingUser.id), {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        phone: editingUser.phone || '',
        location: editingUser.location || ''
      })

      // If user has artist profile, update that too
      if (editingUser.isArtist && editingUser.artistProfile) {
        await updateDoc(doc(db, 'artists', editingUser.id), {
          name: editingUser.name,
          email: editingUser.email,
          location: editingUser.location || '',
          verified: editingUser.artistProfile.verified || false,
          availability: editingUser.artistProfile.availability || 'available'
        })
      }

      setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u))
      setEditingUser(null)
    } catch (err) {
      console.error('Error updating user:', err)
      alert('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      alert('Name and email are required')
      return
    }
    setSaving(true)
    try {
      const userId = 'user_' + Date.now()
      const userData = {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        phone: newUser.phone.trim(),
        location: newUser.location.trim(),
        joinedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
      await setDoc(doc(db, 'users', userId), userData)

      setUsers(prev => [...prev, { id: userId, ...userData, isArtist: false }])
      setShowAddModal(false)
      setNewUser({ name: '', email: '', role: 'customer', phone: '', location: '' })
      setStats(prev => ({ ...prev, total: prev.total + 1, customers: prev.customers + 1 }))
    } catch (err) {
      console.error('Error adding user:', err)
      alert('Failed to add user')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminSession')
    navigate('/admin')
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery)

      const matchesRole =
        filterRole === 'all' ? true :
        filterRole === 'artist' ? user.isArtist :
        filterRole === 'customer' ? !user.isArtist : true

      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      let valA: any = ''
      let valB: any = ''
      if (sortField === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase() }
      else if (sortField === 'email') { valA = a.email.toLowerCase(); valB = b.email.toLowerCase() }
      else if (sortField === 'role') { valA = a.isArtist ? 'artist' : 'customer'; valB = b.isArtist ? 'artist' : 'customer' }
      else if (sortField === 'location') { valA = (a.location || '').toLowerCase(); valB = (b.location || '').toLowerCase() }
      else if (sortField === 'joinedDate') { valA = a.joinedDate || ''; valB = b.joinedDate || '' }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const SortIcon = ({ field }: { field: string }) => (
    sortField === field ? (
      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    ) : <ChevronDown className="w-3 h-3 opacity-30" />
  )

  const adminSession = JSON.parse(sessionStorage.getItem('adminSession') || '{}')

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className=" mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">HunarHub Admin</h1>
              <p className="text-gray-400 text-xs">Welcome, {adminSession.name || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className=" mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-gray-400 text-sm">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.customers}</p>
                <p className="text-gray-400 text-sm">Customers</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600/20 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.artists}</p>
                <p className="text-gray-400 text-sm">Artists</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, location, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="artist">Artists</option>
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-medium text-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-750 border-b border-gray-700">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">Name <SortIcon field="name" /></div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('email')}>
                      <div className="flex items-center gap-1">Email <SortIcon field="email" /></div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('role')}>
                      <div className="flex items-center gap-1">Role <SortIcon field="role" /></div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('location')}>
                      <div className="flex items-center gap-1">Location <SortIcon field="location" /></div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Artist Info</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('joinedDate')}>
                      <div className="flex items-center gap-1">Joined <SortIcon field="joinedDate" /></div>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white">{user.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{user.email || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.isArtist
                              ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                              : 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                          }`}>
                            {user.isArtist ? '🎨 Artist' : '👤 Customer'}
                          </span>
                          {user.artistProfile?.verified && (
                            <span className="px-1.5 py-0.5 bg-green-600/20 text-green-400 rounded-full text-xs">✓</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{user.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{user.location || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        {user.isArtist && user.artistProfile ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-amber-400">
                              <span>⭐ {user.artistProfile.rating?.toFixed(1) || '0.0'}</span>
                              <span className="text-gray-500">|</span>
                              <span>{user.artistProfile.completedOrders || 0} orders</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {user.artistProfile.skills?.slice(0, 2).map((s, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">{s}</span>
                              ))}
                              {(user.artistProfile.skills?.length || 0) > 2 && (
                                <span className="text-gray-500 text-xs">+{(user.artistProfile.skills?.length || 0) - 2}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{user.joinedDate || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setShowViewModal(user)}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-400 transition-all"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser({ ...user })}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-amber-400 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No users found</p>
              </div>
            )}

            {/* Table Footer */}
            <div className="px-4 py-3 border-t border-gray-700 text-sm text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Delete User?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently delete the user and their artist profile (if any). This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={saving}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="customer">Customer</option>
                  <option value="artist">Artist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={editingUser.location || ''}
                  onChange={e => setEditingUser({ ...editingUser, location: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {editingUser.isArtist && editingUser.artistProfile && (
                <>
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <h4 className="font-semibold text-amber-400 mb-3">Artist Profile</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-300">Verified</label>
                    <button
                      onClick={() => setEditingUser({
                        ...editingUser,
                        artistProfile: {
                          ...editingUser.artistProfile!,
                          verified: !editingUser.artistProfile!.verified
                        }
                      })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        editingUser.artistProfile.verified
                          ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                          : 'bg-gray-700 text-gray-400 border border-gray-600'
                      }`}
                    >
                      {editingUser.artistProfile.verified ? '✓ Verified' : 'Not Verified'}
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Availability</label>
                    <select
                      value={editingUser.artistProfile.availability || 'available'}
                      onChange={e => setEditingUser({
                        ...editingUser,
                        artistProfile: { ...editingUser.artistProfile!, availability: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="customer">Customer</option>
                  <option value="artist">Artist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={newUser.location}
                  onChange={e => setNewUser({ ...newUser, location: e.target.value })}
                  placeholder="City, State"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={saving}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowViewModal(null)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">User Details</h3>
              <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {showViewModal.name.charAt(0).toUpperCase()}
              </div>
              <h4 className="text-xl font-bold text-white">{showViewModal.name}</h4>
              <p className="text-gray-400">{showViewModal.email}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">User ID</span>
                <span className="text-white text-sm font-mono">{showViewModal.id.substring(0, 20)}...</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Role</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  showViewModal.isArtist ? 'bg-amber-600/20 text-amber-400' : 'bg-blue-600/20 text-blue-400'
                }`}>
                  {showViewModal.isArtist ? '🎨 Artist' : '👤 Customer'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Phone</span>
                <span className="text-white">{showViewModal.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Location</span>
                <span className="text-white">{showViewModal.location || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Joined</span>
                <span className="text-white">{showViewModal.joinedDate || '—'}</span>
              </div>

              {showViewModal.isArtist && showViewModal.artistProfile && (
                <>
                  <div className="pt-3">
                    <h5 className="font-semibold text-amber-400 mb-3">Artist Details</h5>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-400">Rating</span>
                    <span className="text-amber-400">⭐ {showViewModal.artistProfile.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-400">Reviews</span>
                    <span className="text-white">{showViewModal.artistProfile.reviewCount || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-400">Completed Orders</span>
                    <span className="text-white">{showViewModal.artistProfile.completedOrders || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-400">Verified</span>
                    <span className={showViewModal.artistProfile.verified ? 'text-green-400' : 'text-gray-500'}>
                      {showViewModal.artistProfile.verified ? '✓ Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-400">Availability</span>
                    <span className={showViewModal.artistProfile.availability === 'available' ? 'text-green-400' : 'text-red-400'}>
                      {showViewModal.artistProfile.availability === 'available' ? '● Available' : '● Busy'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-400">Price Range</span>
                    <span className="text-white">₹{showViewModal.artistProfile.priceRange?.min || 0} - ₹{showViewModal.artistProfile.priceRange?.max || 0}</span>
                  </div>
                  {showViewModal.artistProfile.skills && showViewModal.artistProfile.skills.length > 0 && (
                    <div className="py-2">
                      <span className="text-gray-400 block mb-2">Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {showViewModal.artistProfile.skills.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {showViewModal.artistProfile.portfolio && showViewModal.artistProfile.portfolio.length > 0 && (
                    <div className="py-2">
                      <span className="text-gray-400 block mb-2">Portfolio ({showViewModal.artistProfile.portfolio.length} items)</span>
                      <div className="grid grid-cols-3 gap-2">
                        {showViewModal.artistProfile.portfolio.slice(0, 6).map((item: any, i: number) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-700">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title || ''} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">🎨</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowViewModal(null); setEditingUser({ ...showViewModal }) }}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit User
              </button>
              <button
                onClick={() => setShowViewModal(null)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}