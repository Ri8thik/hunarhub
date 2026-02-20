import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { getArtistById, getArtistReviews } from '@/services/firestoreService'
import { ArrowLeft, MapPin, Star, Clock, CheckCircle, Edit, Loader2, X } from 'lucide-react'

interface Review {
  id: string
  customerName?: string
  rating: number
  comment: string
  createdAt?: string
}

interface PortfolioItem {
  id: string
  title: string
  imageUrl: string
  category: string
}

interface ArtistData {
  id: string
  name: string
  email?: string
  bio?: string
  location?: string
  skills: string[]
  priceRange?: { min: number; max: number }
  rating: number
  reviewCount?: number
  completedOrders?: number
  portfolio: PortfolioItem[]
  availability?: string
  verified?: boolean
  joinedDate?: string
  responseTime?: string
}

export default function MyArtistProfilePage() {
  const navigate = useNavigate()
  const { currentUserId } = useApp()
  const [artist, setArtist] = useState<ArtistData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUserId) {
        setLoading(false)
        return
      }
      try {
        const data = await getArtistById(currentUserId)
        if (data) {
          setArtist(data as unknown as ArtistData)
          const rev = await getArtistReviews(currentUserId)
          setReviews(rev as unknown as Review[])
        }
      } catch (err) {
        console.error('Error fetching artist profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [currentUserId])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No artist profile found. Create one first!</p>
          <button
            onClick={() => navigate('/become-artist')}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold"
          >
            Create Artist Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full" onClick={() => setSelectedImage(null)}>
            <X className="w-6 h-6" />
          </button>
          <img src={selectedImage} alt="Portfolio" className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">My Artist Profile</h1>
          <button
            onClick={() => navigate('/become-artist')}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30"
          >
            <Edit className="w-4 h-4" /> Edit
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {artist.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{artist.name}</h2>
              {artist.verified && <CheckCircle className="w-5 h-5 text-amber-200" />}
            </div>
            {artist.location && (
              <p className="flex items-center gap-1 text-amber-100 mt-1">
                <MapPin className="w-4 h-4" /> {artist.location}
              </p>
            )}
            {artist.responseTime && (
              <p className="flex items-center gap-1 text-amber-200 text-sm mt-1">
                <Clock className="w-3 h-3" /> Responds {artist.responseTime}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
        <div className="p-4 text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{artist.completedOrders || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
        </div>
        <div className="p-4 text-center border-l dark:border-gray-700">
          <p className="text-xl font-bold text-amber-600 flex items-center justify-center gap-1">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            {artist.rating?.toFixed(1) || '0.0'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
        </div>
        <div className="p-4 text-center border-l dark:border-gray-700">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{artist.reviewCount ?? 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Reviews</p>
        </div>
        <div className="p-4 text-center border-l dark:border-gray-700">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{artist.portfolio?.length || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Portfolio</p>
        </div>
      </div>

      <div className="mx-auto p-6 space-y-6">
        {/* About */}
        {artist.bio && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">About Me</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{artist.bio}</p>
          </div>
        )}

        {/* Skills */}
        {artist.skills && artist.skills.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {artist.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium border border-amber-200 dark:border-amber-800">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pricing & Availability */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Pricing</h3>
            <p className="text-2xl font-bold text-amber-600">₹{artist.priceRange?.min || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Starting price</p>
            {artist.priceRange?.max && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Up to ₹{artist.priceRange.max}</p>
            )}
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Availability</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              artist.availability === 'available'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${artist.availability === 'available' ? 'bg-green-500' : 'bg-red-500'}`} />
              {artist.availability === 'available' ? 'Available' : 'Busy'}
            </div>
            {artist.joinedDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Joined {artist.joinedDate}</p>
            )}
          </div>
        </div>

        {/* Portfolio */}
        {artist.portfolio && artist.portfolio.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Portfolio ({artist.portfolio.length})</h3>
              <button onClick={() => navigate('/become-artist')} className="text-sm text-amber-600 dark:text-amber-400 font-medium hover:underline">
                + Add More
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {artist.portfolio.map((item, i) => (
                <div
                  key={item.id || i}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-gray-100 dark:border-gray-700"
                  onClick={() => { if (item.imageUrl && item.imageUrl.startsWith('data:')) setSelectedImage(item.imageUrl) }}
                >
                  {item.imageUrl && item.imageUrl.startsWith('data:') ? (
                    <>
                      <img src={item.imageUrl} alt={item.title || `Artwork ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end">
                        <div className="w-full p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-medium truncate">{item.title}</p>
                          <p className="text-white/70 text-xs">{item.category}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex flex-col items-center justify-center p-3">
                      <span className="text-3xl mb-2">🎨</span>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium text-center truncate w-full">{item.title}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">{item.category}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Portfolio */}
        {(!artist.portfolio || artist.portfolio.length === 0) && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border dark:border-gray-700 text-center">
            <span className="text-4xl mb-3 block">🖼️</span>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">No Portfolio Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Add your artworks to showcase your talent</p>
            <button onClick={() => navigate('/become-artist')} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium">
              Add Portfolio Images
            </button>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Customer Reviews ({reviews.length})</h3>
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div key={review.id || i} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-400">
                        {(review.customerName || 'C').charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{review.customerName || 'Customer'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300 dark:text-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
                  {review.createdAt && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{review.createdAt}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Reviews */}
        {reviews.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border dark:border-gray-700 text-center">
            <span className="text-3xl mb-2 block">⭐</span>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">No Reviews Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Complete orders to start receiving reviews from customers</p>
          </div>
        )}
      </div>
    </div>
  )
}