import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { getArtistById, getArtistReviews, addReview, updateArtistRating } from '@/services/firestoreService'
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, MessageCircle, Loader2, X, Send, Briefcase, Award, Image } from 'lucide-react'

interface Review {
  id: string
  customerName?: string
  rating: number
  comment: string
  createdAt?: string
  customerId?: string
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

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes starPop {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.4); }
    100% { transform: scale(1); }
  }

  .ap-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #92400e 0%, #b45309 30%, #d97706 65%, #ea580c 100%);
    padding: 1.5rem;
  }
  .ap-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3Ccircle cx='0' cy='0' r='10'/%3E%3Ccircle cx='60' cy='60' r='10'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }
  .ap-hero::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0; right: 0;
    height: 40px;
    background: var(--ap-bg, #f9fafb);
    clip-path: ellipse(55% 100% at 50% 100%);
  }

  .ap-avatar {
    width: 88px; height: 88px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
    border: 3px solid rgba(255,255,255,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; font-weight: 800; color: #fff;
    position: relative;
    flex-shrink: 0;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    animation: fadeInUp 0.5s ease both;
  }
  .ap-avatar-ring {
    position: absolute; inset: -6px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    animation: pulse-ring 2s ease-out infinite;
  }

  .ap-name {
    font-size: 1.5rem; font-weight: 800;
    color: #fff; line-height: 1.2;
    text-shadow: 0 2px 8px rgba(0,0,0,0.15);
    animation: fadeInUp 0.5s 0.1s ease both;
  }

  .ap-badge-verified {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 99px;
    padding: 2px 10px;
    font-size: 0.7rem; font-weight: 700;
    color: #fff; letter-spacing: 0.05em;
    animation: fadeInUp 0.5s 0.15s ease both;
  }

  .ap-stats-bar {
    display: grid; grid-template-columns: repeat(4, 1fr);
    background: #fff;
    border-bottom: 1px solid #f3f4f6;
    position: relative; z-index: 1;
  }
  .dark .ap-stats-bar { background: #111827; border-color: #1f2937; }

  .ap-stat-item {
    padding: 1rem 0.5rem;
    text-align: center;
    position: relative;
    animation: fadeInUp 0.4s ease both;
  }
  .ap-stat-item + .ap-stat-item::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 1px; background: #e5e7eb;
  }
  .dark .ap-stat-item + .ap-stat-item::before { background: #374151; }

  .ap-stat-num {
    font-size: 1.4rem; font-weight: 800;
    color: #1f2937; line-height: 1;
    margin-bottom: 4px;
  }
  .dark .ap-stat-num { color: #f9fafb; }
  .ap-stat-num.gold { color: #d97706; }
  .ap-stat-label {
    font-size: 0.65rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: #9ca3af;
  }

  .ap-section {
    background: #fff;
    border-radius: 16px;
    padding: 1.25rem;
    border: 1px solid #f3f4f6;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    animation: fadeInUp 0.5s ease both;
    position: relative;
    overflow: hidden;
  }
  .dark .ap-section { background: #111827; border-color: #1f2937; }

  .ap-section-title {
    font-size: 0.8rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: #d97706;
    margin-bottom: 0.75rem;
    display: flex; align-items: center; gap: 6px;
  }
  .ap-section-title::after {
    content: '';
    flex: 1; height: 1px;
    background: linear-gradient(to right, #fde68a, transparent);
  }
  .dark .ap-section-title::after { background: linear-gradient(to right, #78350f, transparent); }

  .ap-bio-text {
    color: #4b5563; font-size: 0.9rem; line-height: 1.7;
    font-style: italic;
  }
  .dark .ap-bio-text { color: #9ca3af; }

  .ap-skill-tag {
    display: inline-flex; align-items: center;
    padding: 6px 14px;
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    border: 1px solid #fde68a;
    border-radius: 99px;
    font-size: 0.8rem; font-weight: 600;
    color: #92400e;
    transition: all 0.2s ease;
    cursor: default;
  }
  .dark .ap-skill-tag {
    background: linear-gradient(135deg, #451a03, #3b1206);
    border-color: #78350f;
    color: #fcd34d;
  }
  .ap-skill-tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(217,119,6,0.25);
  }

  .ap-price-card {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border: 1px solid #fde68a;
    border-radius: 14px; padding: 1.1rem;
    position: relative; overflow: hidden;
  }
  .dark .ap-price-card {
    background: linear-gradient(135deg, #1c0a00 0%, #1f0e00 100%);
    border-color: #78350f;
  }
  .ap-price-card::before {
    content: '₹';
    position: absolute; right: -10px; top: -10px;
    font-size: 5rem; font-weight: 900;
    color: rgba(217,119,6,0.07);
    line-height: 1;
    pointer-events: none;
  }
  .ap-price-amount {
    font-size: 1.8rem; font-weight: 900;
    color: #b45309;
    line-height: 1;
  }
  .dark .ap-price-amount { color: #fbbf24; }

  .ap-avail-card {
    border-radius: 14px; padding: 1.1rem;
    border: 1px solid #e5e7eb;
    background: #fff;
  }
  .dark .ap-avail-card { background: #111827; border-color: #1f2937; }

  .ap-avail-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    position: relative;
  }
  .ap-avail-dot.available { background: #22c55e; }
  .ap-avail-dot.available::after {
    content: '';
    position: absolute; inset: -4px;
    border-radius: 50%;
    background: rgba(34,197,94,0.3);
    animation: pulse-ring 1.5s ease-out infinite;
  }
  .ap-avail-dot.busy { background: #ef4444; }

  .ap-tab-bar {
    display: flex; gap: 4px;
    background: #f3f4f6;
    border-radius: 14px; padding: 4px;
    margin-bottom: 1rem;
  }
  .dark .ap-tab-bar { background: #1f2937; }

  .ap-tab-btn {
    flex: 1; padding: 10px 8px;
    border-radius: 10px;
    font-size: 0.82rem; font-weight: 600;
    border: none; cursor: pointer;
    transition: all 0.25s ease;
    color: #6b7280;
    background: transparent;
  }
  .dark .ap-tab-btn { color: #9ca3af; }
  .ap-tab-btn.active {
    background: #fff;
    color: #b45309;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .dark .ap-tab-btn.active {
    background: #374151;
    color: #fbbf24;
  }

  .ap-portfolio-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  @media (min-width: 768px) {
    .ap-portfolio-grid { grid-template-columns: repeat(3, 1fr); }
  }

  .ap-portfolio-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    background: linear-gradient(#fff, #fff) padding-box,
                linear-gradient(135deg, #fde68a, #fed7aa) border-box;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .dark .ap-portfolio-item {
    background: linear-gradient(#111827, #111827) padding-box,
                linear-gradient(135deg, #78350f, #7c2d12) border-box;
  }
  .ap-portfolio-item:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 32px rgba(217,119,6,0.25);
  }
  .ap-portfolio-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
    opacity: 0; transition: opacity 0.3s ease;
    display: flex; align-items: flex-end; padding: 10px;
  }
  .ap-portfolio-item:hover .ap-portfolio-overlay { opacity: 1; }

  .ap-review-card {
    background: #fff;
    border: 1px solid #f3f4f6;
    border-radius: 14px; padding: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    animation: fadeInUp 0.4s ease both;
    transition: box-shadow 0.2s;
  }
  .dark .ap-review-card { background: #111827; border-color: #1f2937; }
  .ap-review-card:hover { box-shadow: 0 6px 20px rgba(217,119,6,0.12); }

  .ap-reviewer-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #fde68a, #fb923c);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; font-weight: 800;
    color: #92400e;
    flex-shrink: 0;
  }

  .ap-write-review {
    background: linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%);
    border: 1.5px solid #fde68a;
    border-radius: 16px; padding: 1.25rem;
  }
  .dark .ap-write-review {
    background: linear-gradient(135deg, #1c0a00, #1f0e00);
    border-color: #78350f;
  }

  .ap-star-interactive {
    cursor: pointer;
    transition: transform 0.15s ease;
  }
  .ap-star-interactive:hover { transform: scale(1.3); }
  .ap-star-interactive.active { animation: starPop 0.25s ease; }

  .ap-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    font-size: 0.88rem;
    background: #fff;
    color: #1f2937;
    resize: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .ap-textarea:focus {
    outline: none;
    border-color: #d97706;
    box-shadow: 0 0 0 3px rgba(217,119,6,0.15);
  }
  .dark .ap-textarea {
    background: #1f2937; border-color: #374151; color: #f9fafb;
  }
  .dark .ap-textarea:focus { border-color: #d97706; }
  .ap-textarea::placeholder { color: #9ca3af; }

  .ap-submit-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 22px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    color: #fff;
    border: none; border-radius: 12px;
    font-size: 0.85rem; font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(217,119,6,0.35);
  }
  .ap-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(217,119,6,0.45);
  }
  .ap-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .ap-cta-bar {
    position: sticky; bottom: 16px;
    display: flex; gap: 10px;
    padding: 0 1rem;
    animation: fadeInUp 0.5s 0.3s ease both;
  }
  .ap-cta-main {
    flex: 1; padding: 15px 20px;
    background: linear-gradient(135deg, #d97706 0%, #ea580c 100%);
    color: #fff; border: none; border-radius: 16px;
    font-size: 1rem; font-weight: 800;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(217,119,6,0.4);
    transition: all 0.25s ease;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    letter-spacing: 0.01em;
  }
  .ap-cta-main:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(217,119,6,0.55);
  }
  .ap-cta-chat {
    width: 56px; height: 56px;
    border: 2.5px solid #d97706;
    background: #fff; color: #d97706;
    border-radius: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.25s ease;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(217,119,6,0.15);
  }
  .dark .ap-cta-chat { background: #111827; }
  .ap-cta-chat:hover {
    background: #d97706; color: #fff;
    transform: translateY(-3px);
    box-shadow: 0 6px 18px rgba(217,119,6,0.4);
  }

  .ap-image-modal {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.92);
    z-index: 50;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.2s ease;
    backdrop-filter: blur(8px);
  }
  .ap-modal-close {
    position: absolute; top: 16px; right: 16px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 50%; width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; cursor: pointer;
    transition: background 0.2s;
  }
  .ap-modal-close:hover { background: rgba(255,255,255,0.3); }

  .ap-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    height: 100%;
    gap: 12px;
  }
  .ap-loading-icon {
    width: 56px; height: 56px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
    animation: float 2s ease-in-out infinite;
    box-shadow: 0 8px 24px rgba(217,119,6,0.3);
  }

  .ap-empty-state {
    text-align: center; padding: 2.5rem 1rem;
  }
  .ap-empty-icon {
    font-size: 2.5rem; margin-bottom: 0.75rem;
    animation: float 3s ease-in-out infinite;
    display: block;
  }
  .ap-empty-text { color: #6b7280; font-size: 0.9rem; }
  .dark .ap-empty-text { color: #6b7280; }

  .ap-success-banner {
    display: flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    border: 1px solid #6ee7b7;
    border-radius: 12px; padding: 12px 16px;
    color: #065f46; font-weight: 600; font-size: 0.9rem;
  }
  .dark .ap-success-banner {
    background: linear-gradient(135deg, #064e3b, #065f46);
    color: #6ee7b7; border-color: #059669;
  }

  .ap-info-row {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.82rem; color: rgba(255,255,255,0.8);
  }
  .ap-info-row + .ap-info-row { margin-top: 4px; }
`

export default function ArtistProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userRole, currentUserId, currentUserName } = useApp()
  const [artist, setArtist] = useState<ArtistData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews'>('portfolio')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewHover, setReviewHover] = useState(0)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewComment.trim()) return
    if (!currentUserId || !artist) return
    setSubmittingReview(true)
    try {
      const reviewData = {
        artistId: artist.id,
        customerId: currentUserId,
        customerName: currentUserName || 'Anonymous',
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: new Date().toISOString().split('T')[0]
      }
      await addReview(reviewData)
      const newReview = { id: 'new-' + Date.now(), ...reviewData }
      const updatedReviews = [newReview, ...reviews]
      const { newRating, newCount } = await updateArtistRating(artist.id, updatedReviews)
      setReviews(updatedReviews)
      setArtist(prev => prev ? { ...prev, rating: newRating, reviewCount: newCount } : null)
      setReviewRating(0)
      setReviewComment('')
      setReviewSuccess(true)
      setTimeout(() => setReviewSuccess(false), 3000)
    } catch (err) {
      console.error('Error submitting review:', err)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) return
      try {
        const data = await getArtistById(id)
        if (data) {
          setArtist(data as unknown as ArtistData)
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
      <>
        <style>{styles}</style>
        <div className="ap-loading">
          <div className="ap-loading-icon">🎨</div>
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#d97706' }} />
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading artist profile...</p>
        </div>
      </>
    )
  }

  if (!artist) {
    return (
      <>
        <style>{styles}</style>
        <div className="ap-loading">
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <p style={{ color: '#6b7280' }}>Artist not found</p>
          <button onClick={() => navigate(-1)} className="ap-submit-btn">Go Back</button>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors">

        {/* Image Modal */}
        {selectedImage && (
          <div className="ap-image-modal" onClick={() => setSelectedImage(null)}>
            <button className="ap-modal-close" onClick={() => setSelectedImage(null)}>
              <X style={{ width: 18, height: 18 }} />
            </button>
            <img
              src={selectedImage}
              alt="Portfolio"
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12 }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        {/* Hero Header */}
        <div className="ap-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, position: 'relative', zIndex: 1 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 10, padding: '8px', display: 'flex', cursor: 'pointer', color: '#fff',
                backdropFilter: 'blur(4px)', transition: 'background 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <ArrowLeft style={{ width: 18, height: 18 }} />
            </button>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.02em' }}>Artist Profile</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1, paddingBottom: 28 }}>
            <div className="ap-avatar">
              <div className="ap-avatar-ring" />
              {artist.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div className="ap-name">{artist.name}</div>
              {artist.verified && (
                <div className="ap-badge-verified" style={{ marginTop: 4, marginBottom: 6 }}>
                  <CheckCircle style={{ width: 11, height: 11 }} />
                  Verified Artist
                </div>
              )}
              {artist.location && (
                <div className="ap-info-row">
                  <MapPin style={{ width: 13, height: 13 }} />
                  {artist.location}
                </div>
              )}
              {artist.responseTime && (
                <div className="ap-info-row">
                  <Clock style={{ width: 12, height: 12 }} />
                  Responds {artist.responseTime}
                </div>
              )}
              <div className="ap-info-row" style={{ marginTop: 6 }}>
                <Star style={{ width: 13, height: 13, fill: '#fbbf24', color: '#fbbf24' }} />
                <span style={{ fontWeight: 700, color: '#fff' }}>{artist.rating?.toFixed(1) || '0.0'}</span>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>({artist.reviewCount || reviews.length} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="ap-stats-bar">
          {[
            { icon: <Briefcase style={{ width: 14, height: 14, color: '#d97706' }} />, value: artist.completedOrders || 0, label: 'Orders', gold: false },
            { icon: <Star style={{ width: 14, height: 14, fill: '#d97706', color: '#d97706' }} />, value: artist.rating?.toFixed(1) || '0.0', label: 'Rating', gold: true },
            { icon: <Award style={{ width: 14, height: 14, color: '#d97706' }} />, value: artist.reviewCount || reviews.length, label: 'Reviews', gold: false },
            { icon: <Image style={{ width: 14, height: 14, color: '#d97706' }} />, value: artist.portfolio?.length || 0, label: 'Works', gold: false },
          ].map((stat, i) => (
            <div key={i} className="ap-stat-item" style={{ animationDelay: `${i * 0.07}s` }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>{stat.icon}</div>
              <div className={`ap-stat-num ${stat.gold ? 'gold' : ''}`}>{stat.value}</div>
              <div className="ap-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* About */}
          {artist.bio && (
            <div className="ap-section" style={{ animationDelay: '0.1s' }}>
              <div className="ap-section-title">
                <span>✦</span> About
              </div>
              <p className="ap-bio-text">"{artist.bio}"</p>
            </div>
          )}

          {/* Skills */}
          {artist.skills && artist.skills.length > 0 && (
            <div className="ap-section" style={{ animationDelay: '0.15s' }}>
              <div className="ap-section-title">
                <span>✦</span> Skills & Expertise
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {artist.skills.map((skill, i) => (
                  <span key={i} className="ap-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing & Availability */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="ap-price-card">
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b45309', marginBottom: 6 }}>
                Starting at
              </div>
              <div className="ap-price-amount">₹{artist.priceRange?.min || 0}</div>
              {artist.priceRange?.max && (
                <div style={{ fontSize: '0.75rem', color: '#78716c', marginTop: 4 }}>
                  Up to ₹{artist.priceRange.max}
                </div>
              )}
            </div>
            <div className="ap-avail-card">
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 8 }}>
                Availability
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className={`ap-avail-dot ${artist.availability === 'available' ? 'available' : 'busy'}`} />
                <span style={{
                  fontSize: '0.88rem', fontWeight: 700,
                  color: artist.availability === 'available' ? '#16a34a' : '#dc2626'
                }}>
                  {artist.availability === 'available' ? 'Available' : 'Busy'}
                </span>
              </div>
              {artist.joinedDate && (
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 8 }}>
                  Joined {artist.joinedDate}
                </div>
              )}
            </div>
          </div>

          {/* Tab Switch */}
          <div className="ap-tab-bar">
            <button
              className={`ap-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              🖼 Portfolio ({artist.portfolio?.length || 0})
            </button>
            <button
              className={`ap-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              ⭐ Reviews ({reviews.length})
            </button>
          </div>

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div>
              {artist.portfolio && artist.portfolio.length > 0 ? (
                <div className="ap-portfolio-grid">
                  {artist.portfolio.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="ap-portfolio-item"
                      style={{ animationDelay: `${i * 0.06}s` }}
                      onClick={() => { if (item.imageUrl) setSelectedImage(item.imageUrl) }}
                    >
                      {item.imageUrl ? (
                        <>
                          <img
                            src={item.imageUrl}
                            alt={item.title || `Artwork ${i + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                          />
                          <div className="ap-portfolio-overlay">
                            <div>
                              <div style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.2 }}>{item.title}</div>
                              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem' }}>{item.category}</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.75rem'
                        }}>
                          <span style={{ fontSize: '2rem', marginBottom: 6 }}>🎨</span>
                          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textAlign: 'center' }}>{item.title}</p>
                          <p style={{ fontSize: '0.68rem', color: '#b45309' }}>{item.category}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ap-empty-state">
                  <span className="ap-empty-icon">🖼️</span>
                  <p className="ap-empty-text">No portfolio items yet</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Write a Review */}
              {currentUserId && currentUserId !== artist.id && (
                <div className="ap-write-review">
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b45309', marginBottom: 12 }}>
                    ✍ Write a Review
                  </div>
                  {reviewSuccess ? (
                    <div className="ap-success-banner">
                      <CheckCircle style={{ width: 18, height: 18 }} />
                      Review submitted successfully!
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280', marginRight: 4 }}>Rating:</span>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            className={`ap-star-interactive ${star <= reviewRating ? 'active' : ''}`}
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setReviewHover(star)}
                            onMouseLeave={() => setReviewHover(0)}
                            style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer' }}
                          >
                            <Star style={{
                              width: 26, height: 26,
                              fill: star <= (reviewHover || reviewRating) ? '#f59e0b' : 'none',
                              color: star <= (reviewHover || reviewRating) ? '#f59e0b' : '#d1d5db',
                              transition: 'all 0.15s'
                            }} />
                          </button>
                        ))}
                        {reviewRating > 0 && (
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', marginLeft: 6 }}>
                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                          </span>
                        )}
                      </div>
                      <textarea
                        className="ap-textarea"
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this artist..."
                        rows={3}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                        <button
                          className="ap-submit-btn"
                          onClick={handleSubmitReview}
                          disabled={!reviewRating || !reviewComment.trim() || submittingReview}
                        >
                          {submittingReview
                            ? <><Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> Submitting...</>
                            : <><Send style={{ width: 15, height: 15 }} /> Submit Review</>
                          }
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Review List */}
              {reviews.length > 0 ? (
                reviews.map((review, i) => (
                  <div key={review.id || i} className="ap-review-card" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="ap-reviewer-avatar">
                          {(review.customerName || 'C').charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1f2937' }} className="dark:text-gray-100">
                              {review.customerName || 'Customer'}
                            </span>
                            {review.customerId === currentUserId && (
                              <span style={{
                                padding: '1px 8px', background: '#fef3c7', color: '#b45309',
                                borderRadius: 99, fontSize: '0.65rem', fontWeight: 700, border: '1px solid #fde68a'
                              }}>You</span>
                            )}
                          </div>
                          {review.createdAt && (
                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 1 }}>
                              {typeof review.createdAt === 'string'
                                ? review.createdAt
                                : typeof review.createdAt === 'object' && 'seconds' in review.createdAt
                                  ? new Date((review.createdAt as any).seconds * 1000).toLocaleDateString('en-IN')
                                  : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} style={{
                            width: 13, height: 13,
                            fill: j < review.rating ? '#f59e0b' : 'none',
                            color: j < review.rating ? '#f59e0b' : '#d1d5db'
                          }} />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.6 }} className="dark:text-gray-400">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="ap-empty-state">
                  <span className="ap-empty-icon">⭐</span>
                  <p className="ap-empty-text">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          )}

          {/* Bottom CTA */}
          {userRole === 'customer' && (
            <div className="ap-cta-bar">
              <button className="ap-cta-main" onClick={() => navigate(`/request/${artist.id}`)}>
                🎨 Request Custom Art
              </button>
              {/* <button className="ap-cta-chat" onClick={() => navigate(`/chat/${artist.id}`)}>
                <MessageCircle style={{ width: 22, height: 22 }} />
              </button> */}
            </div>
          )}

        </div>
      </div>
    </>
  )
}