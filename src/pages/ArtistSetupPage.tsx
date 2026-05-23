import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getIndianStates, getCitiesByState } from '@/services/locationService'
import ImageUploader from '@/components/ImageUploader'
import { useApp } from '@/context/AppContext'
import { createArtistProfile } from '@/services/apiDataService'
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react'

// Fallback used only if Firestore categories haven't loaded yet
const FALLBACK_SKILLS = [
  // Drawing & Sketching
  'Sketch', 'Pencil Drawing', 'Charcoal Art', 'Line Art', 'Digital Sketching',

  // Portrait Art
  'Portrait', 'Face Painting', 'Caricature', 'Cartoon Drawing',

  // Painting
  'Oil Painting', 'Watercolor', 'Acrylic Painting', 'Gouache Painting', 'Tempera Art',

  // Digital Art
  'Digital Art', 'Digital Painting', 'Photo Editing', 'Digital Illustration',

  // Vector & Graphic Design
  'Vector Art', 'Graphic Design', 'Logo Design', 'Poster Design', 'UI/UX Design',

  // Lettering & Calligraphy
  'Calligraphy', 'Hand Lettering', 'Typography', 'Script Writing',

  // Indian Art Forms
  'Mandala Art', 'Rangoli Design', 'Mehndi Design', 'Henna Art', 'Kolam Art',
  'Warli Art', 'Madhubani Painting', 'Pichwai Art', 'Tanjore Painting',

  // Murals & Street Art
  'Wall Mural', 'Street Art', 'Graffiti Art', 'Mural Painting',

  // Sculpture & 3D Art
  'Clay Sculpture', 'Stone Carving', 'Wood Carving', '3D Modeling', 'Statue Making',

  // Crafts
  'Paper Craft', 'Paper Mache', 'Origami', 'Quilling', 'Decoupage',
  'Jewelry Design', 'Handmade Jewelry', 'Jewelry Making', 'Bead Work',

  // Textile & Fiber Arts
  'Embroidery', 'Cross Stitch', 'Weaving', 'Knitting', 'Crochet',
  'Fabric Painting', 'Batik Art', 'Tie Dye', 'Block Printing',

  // Mixed Media & Other
  'Mixed Media', 'Collage Art', 'Assemblage Art', 'Resin Art',
  'Pottery', 'Ceramics', 'Glass Painting', 'Stained Glass',
  'Canvas Painting', 'Home Decor', 'Interior Design',
]

export default function ArtistSetupPage() {
  const navigate = useNavigate()
  const { currentUserId, currentUserName, currentUserEmail, becomeArtist, categories } = useApp()

  // Always use FALLBACK_SKILLS as primary source (comprehensive list)
  // Augment with backend categories if available
  const skillOptions = (() => {
    const allSkills = new Set([...FALLBACK_SKILLS]);
    if (categories && categories.length > 0) {
      categories.forEach(c => allSkills.add(c.name));
    }
    return Array.from(allSkills).sort();
  })();
  const [name, setName] = useState(currentUserName || '')
  const [bio, setBio] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [cityLoading, setCityLoading] = useState(false)
   const [citySearch, setCitySearch] = useState('')
   const [skills, setSkills] = useState<string[]>([])
   const [customSkill, setCustomSkill] = useState('')
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

   const addCustomSkill = () => {
     const trimmed = customSkill.trim()
     if (trimmed && !skills.includes(trimmed)) {
       setSkills(prev => [...prev, trimmed])
       setCustomSkill('')
     }
   }

   const removeCustomSkill = (skill: string) => {
     if (!FALLBACK_SKILLS.includes(skill)) {
       setSkills(prev => prev.filter(s => s !== skill))
     }
   }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!selectedState) { setError('Please select your state'); return }
    if (skills.length === 0) { setError('Please select at least one skill'); return }
    if (!priceStart) { setError('Please enter your starting price'); return }

    setSaving(true)
    setError('')

    try {
      // Create artist profile with portfolio items
      const profileData = {
        bio: bio.trim() || 'Artist profile',
        skills: skills || [],
        categories: skills || [],
        startingPrice: parseInt(priceStart) || 500,
        pricingCurrency: 'INR',
        pricingNotes: '',
        availability: 'available',
        portfolio: portfolioImages.map((img, index) => ({
          title: `Artwork ${index + 1}`,
          imageUrl: img,
          category: skills[0] || 'Art',
          description: ''
        }))
      }

      await createArtistProfile(profileData)

      // Update user location in profile
      const userUpdateData = {
        displayName: name.trim(),
        locationCity: selectedCity || null,
        locationState: selectedState || null
      }

      // Call updateUserProfile if available
      const updateUserProfile = (await import('@/services/apiDataService')).updateUserProfile
      await updateUserProfile(userUpdateData).catch(() => {
        // Ignore error, profile was still created
      })

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
    <div className="h-full overflow-y-auto common-page-bg transition-colors">
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
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Display Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Display Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your artist name"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:placeholder-gray-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">About You</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell customers about your art style, experience, and what makes you unique..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none dark:placeholder-gray-500"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">State *</label>
          <select
            value={selectedState}
            onChange={e => handleStateChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">City</label>
            {cityLoading ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading cities...
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={citySearch}
                  onChange={e => setCitySearch(e.target.value)}
                  placeholder="Search city..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 mb-2 dark:placeholder-gray-500"
                />
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
                  {filteredCities.length > 0 ? filteredCities.map(city => (
                    <button
                      key={city}
                      onClick={() => { setSelectedCity(city); setCitySearch(city) }}
                      className={`w-full text-left px-4 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-sm ${selectedCity === city ? 'bg-amber-100 dark:bg-amber-900/40 font-semibold text-amber-800 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {city}
                    </button>
                  )) : (
                    <p className="text-gray-400 dark:text-gray-500 text-sm p-3">No cities found</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Skills */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            ✨ Skills * (select multiple from below or add custom)
          </label>

          {/* Selected Custom Skills */}
          {skills.some(s => !skillOptions.includes(s)) && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">Your Custom Skills:</p>
              <div className="flex flex-wrap gap-2">
                {skills.filter(s => !skillOptions.includes(s)).map(skill => (
                  <button
                    key={skill}
                    onClick={() => removeCustomSkill(skill)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-all flex items-center gap-1.5"
                    title="Click to remove"
                  >
                    {skill}
                    <span>×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Predefined Skills - Always Show All */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-500 mb-2">
              📚 Choose from our list ({skillOptions.length} available):
            </p>
            <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              {skillOptions.length > 0 ? (
                skillOptions.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      skills.includes(skill)
                        ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {skill}
                  </button>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading skills...</p>
              )}
            </div>
          </div>

          {/* Custom Skill Input */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              ➕ Add Custom Skill (if not listed):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCustomSkill()}
                placeholder="e.g., Fresco Painting, Etching, etc."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:placeholder-gray-500 text-sm"
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all font-medium text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {skills.length > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-semibold">
              ✓ {skills.length} skill{skills.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Starting Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Starting Price (₹) *</label>
          <input
            type="number"
            value={priceStart}
            onChange={e => setPriceStart(e.target.value)}
            placeholder="500"
            min="100"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:placeholder-gray-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum price for a custom art piece</p>
        </div>

        {/* Portfolio - Image Uploader */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Portfolio Images</label>
          <ImageUploader
            images={portfolioImages}
            onChange={setPortfolioImages}
            maxImages={10}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload up to 10 images. Max 3MB each.</p>
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