import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getIndianStates, getCitiesByState } from '@/services/locationService'
import ImageUploader from '@/components/ImageUploader'
import { useApp } from '@/context/AppContext'
import { addArtist } from '@/services/firestoreService'
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react'

const skillOptions = [
  'Sketch', 'Pencil Drawing', 'Charcoal Art', 'Portrait', 'Caricature',
  'Oil Painting', 'Watercolor', 'Acrylic Painting', 'Digital Art', 'Vector Art',
  'Calligraphy', 'Mandala Art', 'Rangoli Design', 'Mehndi Design', 'Wall Mural',
  'Clay Sculpture', 'Wood Carving', 'Paper Craft', 'Handmade Jewelry', 'Embroidery'
]

export default function ArtistSetupPage() {
  const navigate = useNavigate()
  const { currentUserId, currentUserName, currentUserEmail, becomeArtist } = useApp()
  const [name, setName] = useState(currentUserName || '')
  const [bio, setBio] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [cityLoading, setCityLoading] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [priceStart, setPriceStart] = useState('')
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleStateChange = async (state: string) => {
    setSelectedState(state)
    setSelectedCity('')
    setCitySearch('')
    setCityLoading(true)
    const cityList = await getCitiesByState(state)
    setCities(cityList)
    setCityLoading(false)
  }

  const filteredCities = citySearch
    ? cities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
    : cities

  const toggleSkill = (skill: string) => {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!selectedState) { setError('Please select your state'); return }
    if (skills.length === 0) { setError('Please select at least one skill'); return }
    if (!priceStart) { setError('Please enter your starting price'); return }

    setSaving(true)
    setError('')

    try {
      const location = selectedCity ? `${selectedCity}, ${selectedState}` : selectedState

      const artistData = {
        id: currentUserId || 'demo-artist',
        userId: currentUserId || 'demo-artist',
        name: name.trim(),
        email: currentUserEmail || '',
        bio: bio.trim(),
        location,
        skills,
        priceRange: { min: parseInt(priceStart) || 500, max: (parseInt(priceStart) || 500) * 5 },
        rating: 0,
        reviewCount: 0,
        completedOrders: 0,
        portfolio: portfolioImages.map((img, index) => ({
          id: `portfolio-${index + 1}`,
          title: `Artwork ${index + 1}`,
          imageUrl: img,
          category: skills[0] || 'Art'
        })),
        availability: 'available' as const,
        verified: false,
        joinedDate: new Date().toISOString().split('T')[0],
        responseTime: '< 2 hours'
      }

      await addArtist(artistData)
      becomeArtist()
      setSaved(true)

      setTimeout(() => {
        navigate('/my-artist-profile')
      }, 2000)
    } catch (err) {
      setError('Failed to save profile. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Created!</h2>
          <p className="text-gray-600">Your artist profile is now live. Customers can find you!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Become an Artist</h1>
        </div>
        <p className="text-amber-100 text-sm">Create your professional profile and start receiving custom art requests</p>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Display Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your artist name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">About You</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell customers about your art style, experience, and what makes you unique..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
          <select
            value={selectedState}
            onChange={e => handleStateChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
          >
            <option value="">Select State</option>
            {getIndianStates().map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* City */}
        {selectedState && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
            {cityLoading ? (
              <div className="flex items-center gap-2 text-gray-500 py-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading cities...
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={citySearch}
                  onChange={e => setCitySearch(e.target.value)}
                  placeholder="Search city..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 mb-2"
                />
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                  {filteredCities.length > 0 ? filteredCities.map(city => (
                    <button
                      key={city}
                      onClick={() => { setSelectedCity(city); setCitySearch(city) }}
                      className={`w-full text-left px-4 py-2 hover:bg-amber-50 text-sm ${selectedCity === city ? 'bg-amber-100 font-semibold text-amber-800' : 'text-gray-700'}`}
                    >
                      {city}
                    </button>
                  )) : (
                    <p className="text-gray-400 text-sm p-3">No cities found</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Skills */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Skills * (select multiple)</label>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  skills.includes(skill)
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {skills.length > 0 && (
            <p className="text-xs text-amber-600 mt-2">{skills.length} skills selected</p>
          )}
        </div>

        {/* Starting Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Price (₹) *</label>
          <input
            type="number"
            value={priceStart}
            onChange={e => setPriceStart(e.target.value)}
            placeholder="500"
            min="100"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum price for a custom art piece</p>
        </div>

        {/* Portfolio - Image Uploader */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio Images</label>
          <ImageUploader
            images={portfolioImages}
            onChange={setPortfolioImages}
            maxImages={10}
          />
          <p className="text-xs text-gray-500 mt-1">Upload up to 10 images. Max 3MB each.</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Creating Profile...</>
          ) : (
            <><Save className="w-5 h-5" /> Create Artist Profile</>
          )}
        </button>
      </div>
    </div>
  )
}