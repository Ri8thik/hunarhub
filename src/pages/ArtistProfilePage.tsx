import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { getArtistById, getArtistReviews } from '@/services/firestoreService'
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, MessageCircle, Loader2, X } from 'lucide-react'

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

export default function ArtistProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userRole } = useApp()
  const [artist, setArtist] = useState<ArtistData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews'>('portfolio')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) return
      try {
        const data = await getArtistById(id)
        console.log('Artist data from Firestore:', data)
        if (data) {
          setArtist(data as unknown as ArtistData)
          console.log('Portfolio items:', (data as any).portfolio?.length || 0)
          const rev = await getArtistReviews(id)
          setReviews(rev as unknown as Review[])
        }
      } catch (err) {
        console.error('Error fetching artist:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchArtist()
  }, [id])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading artist profile...</p>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Artist not found</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full" onClick={() => setSelectedImage(null)}>
            <X className="w-6 h-6" />
          </button>
          <img src={selectedImage} alt="Portfolio" className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Artist Profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {artist.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{artist.name}</h2>
              {artist.verified && <CheckCircle className="w-5 h-5 text-amber-200" />}
            </div>
            {artist.location && (
              <p className="flex items-center gap-1 text-amber-100 mt-1">
                <MapPin className="w-4 h-4" /> {artist.location}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                {artist.rating?.toFixed(1) || '0.0'}
              </span>
              {artist.responseTime && (
                <span className="flex items-center gap-1 text-sm text-amber-200">
                  <Clock className="w-3 h-3" /> {artist.responseTime}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 bg-white border-b">
        <div className="p-4 text-center">
          <p className="text-xl font-bold text-gray-900">{artist.completedOrders || 0}</p>
          <p className="text-xs text-gray-500">Orders</p>
        </div>
        <div className="p-4 text-center border-l">
          <p className="text-xl font-bold text-amber-600 flex items-center justify-center gap-1">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            {artist.rating?.toFixed(1) || '0.0'}
          </p>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
        <div className="p-4 text-center border-l">
          <p className="text-xl font-bold text-gray-900">{artist.reviewCount || reviews.length}</p>
          <p className="text-xs text-gray-500">Reviews</p>
        </div>
        <div className="p-4 text-center border-l">
          <p className="text-xl font-bold text-gray-900">{artist.portfolio?.length || 0}</p>
          <p className="text-xs text-gray-500">Portfolio</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {artist.bio && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">About</h3>
            <p className="text-gray-600 leading-relaxed">{artist.bio}</p>
          </div>
        )}

        {artist.skills && artist.skills.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {artist.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">Pricing</h3>
            <p className="text-2xl font-bold text-amber-600">₹{artist.priceRange?.min || 0}</p>
            <p className="text-xs text-gray-500">Starting price</p>
            {artist.priceRange?.max && (
              <p className="text-sm text-gray-600 mt-1">Up to ₹{artist.priceRange.max}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">Availability</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              artist.availability === 'available'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${artist.availability === 'available' ? 'bg-green-500' : 'bg-red-500'}`} />
              {artist.availability === 'available' ? 'Available' : 'Busy'}
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'portfolio' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            Portfolio ({artist.portfolio?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'reviews' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === 'portfolio' && (
          <div>
            {artist.portfolio && artist.portfolio.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {artist.portfolio.map((item, i) => (
                  <div
                    key={item.id || i}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-gray-100"
                    onClick={() => {
                      if (item.imageUrl) {
                        setSelectedImage(item.imageUrl)
                      }
                    }}
                  >
                    {item.imageUrl ? (
                      <>
                        <img
                          src={item.imageUrl}
                          alt={item.title || `Artwork ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end">
                          <div className="w-full p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs font-medium truncate">{item.title}</p>
                            <p className="text-white/70 text-xs">{item.category}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex flex-col items-center justify-center p-3">
                        <span className="text-3xl mb-2">🎨</span>
                        <p className="text-xs text-amber-800 font-medium text-center truncate w-full">{item.title}</p>
                        <p className="text-xs text-amber-600">{item.category}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <span className="text-4xl mb-3 block">🖼️</span>
                <p className="text-gray-500">No portfolio items yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <div key={review.id || i} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold text-amber-700">
                          {(review.customerName || 'C').charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{review.customerName || 'Customer'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                    {review.createdAt && (
                      <p className="text-xs text-gray-400 mt-2">{review.createdAt}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <span className="text-4xl mb-3 block">⭐</span>
                <p className="text-gray-500">No reviews yet</p>
              </div>
            )}
          </div>
        )}

        {userRole === 'customer' && (
          <div className="sticky bottom-4 flex gap-3">
            <button
              onClick={() => navigate(`/request/${artist.id}`)}
              className="flex-1 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              🎨 Request Custom Art
            </button>
            <button
              onClick={() => navigate(`/chat/${artist.id}`)}
              className="px-4 py-4 bg-white border-2 border-amber-600 text-amber-600 rounded-xl hover:bg-amber-50 transition-all"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}