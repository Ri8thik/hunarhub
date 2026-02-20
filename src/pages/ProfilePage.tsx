import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getArtistById } from '@/services/firestoreService';
import { getIndianStates, getCitiesByState } from '@/services/locationService';
import { User, Settings, LogOut, ChevronRight, Shield, Bell, HelpCircle, Moon, Globe, Palette, Star, MapPin } from 'lucide-react';
import { X, CheckCircle, Loader2, Save } from 'lucide-react'
import { seedDatabase } from '@/services/seedService';
import { getSessionDebugInfo } from '@/services/sessionManager';

export default function ProfilePage() {
  const { currentUserName, currentUserEmail, currentUserId, userRole, switchRole, isArtist, artistChecked, logout, artists, darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const [seedingStatus, setSeedingStatus] = useState('');
  const [seedingProgress, setSeedingProgress] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  const sessionInfo = getSessionDebugInfo();

  const myArtistProfile = artists.find(a => a.id === currentUserId);


  const handleSeedDatabase = async () => {
    setSeedingStatus('');
    setSeedingProgress('Starting...');
    try {
      const result = await seedDatabase(
        (step) => setSeedingProgress(step),
        currentUserId || undefined
      );
      if (result.success) {
        setSeedingStatus('✅ Database seeded successfully! Refresh the page.');
      } else {
        setSeedingStatus('⚠️ Completed with errors: ' + result.errors.join(', '));
      }
      setSeedingProgress('');
    } catch (error) {
      setSeedingStatus('❌ Error seeding database. Check console.');
      setSeedingProgress('');
      console.error(error);
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', action: () => handleOpenEdit(), toggle: null },
        { icon: Bell, label: 'Notifications', action: () => navigate('/notifications'), toggle: null },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Moon, label: 'Dark Mode', action: toggleDarkMode, toggle: darkMode },
      ]
    },
  ];


    // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSelectedState, setEditSelectedState] = useState('')
  const [editSelectedCity, setEditSelectedCity] = useState('')
  const [editCities, setEditCities] = useState<string[]>([])
  const [editCityLoading, setEditCityLoading] = useState(false)
  const [editCitySearch, setEditCitySearch] = useState('')
  // Artist edit fields
  const [editBio, setEditBio] = useState('')
  const [editSkills, setEditSkills] = useState<string[]>([])
  const [editPriceMin, setEditPriceMin] = useState('')
  const [editAvailability, setEditAvailability] = useState('available')

  const skillOptions = [
    'Sketch', 'Pencil Drawing', 'Charcoal Art', 'Portrait', 'Caricature',
    'Oil Painting', 'Watercolor', 'Acrylic Painting', 'Digital Art', 'Vector Art',
    'Calligraphy', 'Mandala Art', 'Rangoli Design', 'Mehndi Design', 'Wall Mural',
    'Clay Sculpture', 'Wood Carving', 'Paper Craft', 'Handmade Jewelry', 'Embroidery'
  ]

  const handleOpenEdit = async () => {
    setEditName(currentUserName || '')
    setEditPhone('')
    setEditSelectedState('')
    setEditSelectedCity('')
    setEditBio('')
    setEditSkills([])
    setEditPriceMin('')
    setEditAvailability('available')

    // Load current user data from Firestore
    try {
      if (currentUserId) {
        const userDoc = await getDoc(doc(db, 'users', currentUserId))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setEditName(data.name || currentUserName || '')
          setEditPhone(data.phone || '')
          if (data.location) {
            const parts = data.location.split(', ')
            if (parts.length === 2) {
              setEditSelectedCity(parts[0])
              setEditSelectedState(parts[1])
              setEditCitySearch(parts[0])
              const cities = await getCitiesByState(parts[1])
              setEditCities(cities)
            } else {
              setEditSelectedState(data.location)
            }
          }
        }

        // Load artist data if artist
        if (isArtist) {
          const artistData = await getArtistById(currentUserId)
          if (artistData) {
            setEditBio((artistData as any).bio || '')
            setEditSkills((artistData as any).skills || [])
            setEditPriceMin(String((artistData as any).priceRange?.min || ''))
            setEditAvailability((artistData as any).availability || 'available')
          }
        }
      }
    } catch (err) {
      console.error('Error loading profile for edit:', err)
    }

    setShowEditModal(true)
    setEditSuccess(false)
  }

  const handleEditStateChange = async (state: string) => {
    setEditSelectedState(state)
    setEditSelectedCity('')
    setEditCitySearch('')
    setEditCityLoading(true)
    const cities = await getCitiesByState(state)
    setEditCities(cities)
    setEditCityLoading(false)
  }

  const toggleEditSkill = (skill: string) => {
    setEditSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const handleSaveEdit = async () => {
    if (!currentUserId) return
    setEditLoading(true)
    try {
      const location = editSelectedCity && editSelectedState
        ? `${editSelectedCity}, ${editSelectedState}`
        : editSelectedState || ''

      // Update users collection
      await updateDoc(doc(db, 'users', currentUserId), {
        name: editName.trim(),
        phone: editPhone.trim(),
        location: location,
        updatedAt: new Date().toISOString()
      })

      // Update artists collection if artist
      if (isArtist) {
        try {
          await updateDoc(doc(db, 'artists', currentUserId), {
            name: editName.trim(),
            location: location,
            bio: editBio.trim(),
            skills: editSkills,
            priceRange: { min: parseInt(editPriceMin) || 500, max: (parseInt(editPriceMin) || 500) * 5 },
            availability: editAvailability,
            updatedAt: new Date().toISOString()
          })
        } catch (err) {
          console.error('Error updating artist profile:', err)
        }
      }

      setEditSuccess(true)
      setTimeout(() => {
        setShowEditModal(false)
        setEditSuccess(false)
        window.location.reload()
      }, 1500)
    } catch (err) {
      console.error('Error saving profile:', err)
      alert('Failed to save profile. Please try again.')
    } finally {
      setEditLoading(false)
    }
  }

  const filteredEditCities = editCitySearch
    ? editCities.filter(c => c.toLowerCase().includes(editCitySearch.toLowerCase()))
    : editCities

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className=" mx-auto p-4 lg:p-8 space-y-6">

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl lg:text-3xl font-bold">
              {currentUserName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{currentUserName || 'User'}</h1>
              <p className="text-gray-500 dark:text-gray-400">{currentUserEmail || 'user@example.com'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  userRole === 'artist'
                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'
                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                }`}>
                  {userRole === 'artist' ? '🎨 Artist Mode' : '👤 Customer Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View My Artist Profile - ONLY shows if user has artist profile */}
        {artistChecked && isArtist && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 shadow-sm text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Palette size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">My Artist Profile</h3>
                {myArtistProfile && (
                  <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
                    {myArtistProfile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {myArtistProfile.location}
                      </span>
                    )}
                    {myArtistProfile.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-yellow-300 text-yellow-300" />
                        {myArtistProfile.rating}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-white/70 text-sm mt-1">View and manage your portfolio & reviews</p>
              </div>
              <button
                onClick={() => navigate('/my-artist-profile')}
                className="px-4 py-2 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors text-sm"
              >
                View Profile →
              </button>
            </div>
          </div>
        )}

        {/* Role Switcher - ONLY shows if user has artist profile */}
        {artistChecked && isArtist && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Switch Mode</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Currently in {userRole === 'artist' ? 'Artist' : 'Customer'} mode
                </p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => switchRole('customer')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    userRole === 'customer' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  👤 Customer
                </button>
                <button
                  onClick={() => switchRole('artist')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    userRole === 'artist' ? 'bg-purple-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  🎨 Artist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Become an Artist - ONLY shows if NO artist profile */}
        {artistChecked && !isArtist && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
                <Palette size={28} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Become an Artist 🎨</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Create your artist profile, showcase your portfolio, and start receiving custom art requests from customers.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/become-artist')}
              className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              Create Artist Profile →
            </button>
          </div>
        )}

        {/* Checking artist status */}
        {!artistChecked && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Checking artist profile...</span>
            </div>
          </div>
        )}

        {/* Settings */}
        {settingsGroups.map(group => (
          <div key={group.title} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{group.title}</h3>
            </div>
            {group.items.map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
              >
                <item.icon size={20} className="text-gray-400 dark:text-gray-500" />
                <span className="flex-1 text-left text-gray-700 dark:text-gray-200 font-medium">{item.label}</span>
                {item.toggle !== null && item.toggle !== undefined ? (
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${item.toggle ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.toggle ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                ) : (
                  <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                )}
              </button>
            ))}
          </div>
        ))}

        {/* Seed Database */}
        {/* <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">🌱 Database</h3>
          <p className="text-sm text-gray-500 mb-4">Populate Firestore with sample artists, categories, and earnings data.</p>
          <button
            onClick={handleSeedDatabase}
            className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
          >
            🌱 Seed Database with Sample Data
          </button>
          {seedingProgress && (
            <p className="mt-3 text-sm text-center text-amber-600 animate-pulse">{seedingProgress}</p>
          )}
          {seedingStatus && (
            <p className="mt-3 text-sm text-center text-gray-600">{seedingStatus}</p>
          )}
        </div> */}

        {/* Session Debug */}
        {/* <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="w-full flex items-center justify-between px-6 py-4"
          >
            <span className="font-semibold text-gray-700">🔧 Session Debug</span>
            <ChevronRight size={16} className={`text-gray-400 transition-transform ${showDebug ? 'rotate-90' : ''}`} />
          </button>
          {showDebug && (
            <div className="px-6 pb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">User ID:</span>
                <span className="text-gray-700 font-mono text-xs">{currentUserId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role:</span>
                <span className="text-gray-700">{userRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Is Artist:</span>
                <span className={isArtist ? 'text-green-600' : 'text-red-500'}>{isArtist ? '✅ Yes' : '❌ No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Artist Checked:</span>
                <span className={artistChecked ? 'text-green-600' : 'text-yellow-500'}>{artistChecked ? '✅ Done' : '⏳ Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Has Token:</span>
                <span className="text-gray-700">{sessionInfo?.hasAccessToken ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Token Expired:</span>
                <span className="text-gray-700">{sessionInfo?.isExpired ? '❌ Yes' : '✅ No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Login Method:</span>
                <span className="text-gray-700">{String(sessionInfo?.loginMethod || 'N/A')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time to Expiry:</span>
                <span className="text-gray-700">{String(sessionInfo?.timeToExpiry || 'N/A')}</span>
              </div>
            </div>
          )}
        </div> */}

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm text-red-500 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit Profile</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {editSuccess ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Profile Updated!</h3>
                  <p className="text-gray-500 text-sm mt-1">Your changes have been saved.</p>
                </div>
              ) : (
                <div className="p-6 space-y-5">
                  {/* Customer Fields - Always shown */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-800 text-sm mb-3">👤 Basic Info</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Display Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Email (cannot change)</label>
                        <input
                          type="email"
                          value={currentUserEmail}
                          disabled
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                        <select
                          value={editSelectedState}
                          onChange={e => handleEditStateChange(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          <option value="">Select State</option>
                          {getIndianStates().map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      {editSelectedState && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                          {editCityLoading ? (
                            <p className="text-xs text-gray-400 py-2">Loading cities...</p>
                          ) : (
                            <>
                              <input
                                type="text"
                                value={editCitySearch}
                                onChange={e => setEditCitySearch(e.target.value)}
                                placeholder="Search city..."
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 mb-1"
                              />
                              {editCitySearch && filteredEditCities.length > 0 && (
                                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-xl">
                                  {filteredEditCities.slice(0, 20).map(city => (
                                    <button
                                      key={city}
                                      onClick={() => { setEditSelectedCity(city); setEditCitySearch(city) }}
                                      className={`w-full text-left px-3 py-1.5 hover:bg-amber-50 text-xs ${editSelectedCity === city ? 'bg-amber-100 font-semibold text-amber-800' : 'text-gray-700'}`}
                                    >
                                      {city}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Artist Fields - Only shown if user is an artist */}
                  {isArtist && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <h3 className="font-semibold text-amber-800 text-sm mb-3">🎨 Artist Info</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Bio / About You</label>
                          <textarea
                            value={editBio}
                            onChange={e => setEditBio(e.target.value)}
                            rows={3}
                            placeholder="Tell about your art style and experience..."
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Skills</label>
                          <div className="flex flex-wrap gap-1.5">
                            {skillOptions.map(skill => (
                              <button
                                key={skill}
                                onClick={() => toggleEditSkill(skill)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${editSkills.includes(skill)
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
                                  }`}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Starting Price (₹)</label>
                          <input
                            type="number"
                            value={editPriceMin}
                            onChange={e => setEditPriceMin(e.target.value)}
                            placeholder="500"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Availability</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditAvailability('available')}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${editAvailability === 'available'
                                  ? 'bg-green-100 text-green-700 border-2 border-green-400'
                                  : 'bg-white text-gray-500 border border-gray-200'
                                }`}
                            >🟢 Available</button>
                            <button
                              onClick={() => setEditAvailability('busy')}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${editAvailability === 'busy'
                                  ? 'bg-red-100 text-red-700 border-2 border-red-400'
                                  : 'bg-white text-gray-500 border border-gray-200'
                                }`}
                            >🔴 Busy</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={editLoading || !editName.trim()}
                      className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {editLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4" /> Update Profile</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 pb-4">
          HunarHub v1.0.0 • Made with ❤️ in India
        </div>
      </div>
    </div>
  );
}