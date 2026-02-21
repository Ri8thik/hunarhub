import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { getArtistById, getArtistReviews } from '@/services/firestoreService'
import { ArrowLeft, MapPin, Star, Clock, CheckCircle, Edit, Loader2, X, TrendingUp, Palette, Award, Image } from 'lucide-react'

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

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.5; }
    100% { transform: scale(1.9); opacity: 0; }
  }
  @keyframes shimmer-line {
    0%   { background-position: -300% center; }
    100% { background-position: 300% center; }
  }

  .map-page {
    height: 100%;
    overflow-y: auto;
    background: #f9fafb;
    transition: background 0.3s;
  }
  .dark .map-page { background: #030712; }

  /* ── Hero ── */
  .map-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(150deg, #7c2d12 0%, #9a3412 25%, #c2410c 60%, #d97706 100%);
    padding: 1.5rem 1.5rem 3rem;
  }
  .map-hero-pattern {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 40%),
      repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.015) 30px, rgba(255,255,255,0.015) 31px);
  }
  .map-hero-curve {
    position: absolute; bottom: -1px; left: 0; right: 0; height: 36px;
    background: #f9fafb;
    clip-path: ellipse(60% 100% at 50% 100%);
  }
  .dark .map-hero-curve { background: #030712; }

  .map-topbar {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px; position: relative; z-index: 1;
  }
  .map-back-btn {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 11px; padding: 8px;
    display: flex; cursor: pointer; color: #fff;
    backdrop-filter: blur(4px);
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .map-back-btn:hover { background: rgba(255,255,255,0.22); }

  .map-edit-btn {
    margin-left: auto;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 11px;
    color: #fff; font-size: 0.82rem; font-weight: 700;
    cursor: pointer; backdrop-filter: blur(4px);
    transition: all 0.2s;
  }
  .map-edit-btn:hover {
    background: rgba(255,255,255,0.25);
    transform: translateY(-1px);
  }

  .map-profile-row {
    display: flex; align-items: flex-end; gap: 16px;
    position: relative; z-index: 1;
    padding-bottom: 12px;
  }

  .map-avatar {
    width: 90px; height: 90px;
    border-radius: 50%;
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(10px);
    border: 3px solid rgba(255,255,255,0.45);
    display: flex; align-items: center; justify-content: center;
    font-size: 2.2rem; font-weight: 900; color: #fff;
    position: relative; flex-shrink: 0;
    box-shadow: 0 8px 28px rgba(0,0,0,0.25);
    animation: fadeInUp 0.45s ease both;
  }
  .map-avatar-ring {
    position: absolute; inset: -7px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.25);
    animation: pulse-ring 2.2s ease-out infinite;
  }
  .map-avatar-ring2 {
    position: absolute; inset: -14px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.12);
    animation: pulse-ring 2.2s ease-out 0.5s infinite;
  }

  .map-name {
    font-size: 1.55rem; font-weight: 900;
    color: #fff; line-height: 1.15;
    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: fadeInUp 0.45s 0.08s ease both;
  }
  .map-verified-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 99px; padding: 3px 10px;
    font-size: 0.68rem; font-weight: 800;
    color: #fff; letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 4px; margin-bottom: 6px;
    animation: fadeInUp 0.45s 0.12s ease both;
  }
  .map-info-chip {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.8rem; color: rgba(255,255,255,0.8);
    margin-top: 4px;
  }
  .map-info-chip + .map-info-chip { margin-left: 12px; }

  /* ── Stats ── */
  .map-stats-bar {
    display: grid; grid-template-columns: repeat(4, 1fr);
    background: #fff;
    border-bottom: 1px solid #f3f4f6;
    position: relative; z-index: 1;
    box-shadow: 0 4px 16px rgba(0,0,0,0.05);
  }
  .dark .map-stats-bar { background: #0f172a; border-color: #1e293b; }

  .map-stat {
    padding: 14px 6px;
    text-align: center;
    position: relative;
    animation: fadeInUp 0.4s ease both;
    cursor: default;
    transition: background 0.2s;
  }
  .map-stat:hover { background: #fffbeb; }
  .dark .map-stat:hover { background: #1c1012; }

  .map-stat + .map-stat::before {
    content: '';
    position: absolute; left: 0; top: 22%; bottom: 22%;
    width: 1px;
    background: linear-gradient(to bottom, transparent, #e5e7eb, transparent);
  }
  .dark .map-stat + .map-stat::before { background: linear-gradient(to bottom, transparent, #334155, transparent); }

  .map-stat-icon {
    width: 28px; height: 28px;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-radius: 8px; margin: 0 auto 5px;
    display: flex; align-items: center; justify-content: center;
  }
  .dark .map-stat-icon { background: linear-gradient(135deg, #3b1c00, #451a03); }

  .map-stat-val {
    font-size: 1.3rem; font-weight: 900;
    color: #1f2937; line-height: 1;
  }
  .dark .map-stat-val { color: #f8fafc; }
  .map-stat-val.amber { color: #d97706; }

  .map-stat-lbl {
    font-size: 0.62rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.09em;
    color: #94a3b8; margin-top: 3px;
  }

  /* ── Body ── */
  .map-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }

  .map-card {
    background: #fff;
    border-radius: 18px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    padding: 1.25rem;
    animation: fadeInUp 0.45s ease both;
    overflow: hidden;
    position: relative;
  }
  .dark .map-card { background: #0f172a; border-color: #1e293b; }

  .map-card-accent {
    position: absolute; top: 0; left: 0;
    width: 4px; height: 100%;
    background: linear-gradient(to bottom, #d97706, #ea580c);
    border-radius: 18px 0 0 18px;
  }

  .map-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 0.875rem;
  }
  .map-card-title {
    font-size: 0.75rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: #d97706;
    display: flex; align-items: center; gap: 6px;
  }
  .map-card-title::after {
    content: '';
    width: 32px; height: 2px;
    background: linear-gradient(to right, #fde68a, transparent);
    border-radius: 99px;
    margin-left: 4px;
  }
  .dark .map-card-title::after { background: linear-gradient(to right, #78350f, transparent); }

  .map-bio {
    font-size: 0.9rem; line-height: 1.75;
    color: #475569; font-style: italic;
    padding-left: 14px;
    border-left: 3px solid #fde68a;
  }
  .dark .map-bio { color: #94a3b8; border-left-color: #78350f; }

  .map-skill-pill {
    display: inline-flex; align-items: center;
    padding: 6px 14px;
    background: linear-gradient(135deg, #fffbeb, #fef9ee);
    border: 1.5px solid #fde68a;
    border-radius: 99px;
    font-size: 0.78rem; font-weight: 700;
    color: #92400e;
    transition: all 0.2s;
    cursor: default;
  }
  .dark .map-skill-pill {
    background: linear-gradient(135deg, #1c0a00, #2d1106);
    border-color: #78350f; color: #fcd34d;
  }
  .map-skill-pill:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 5px 14px rgba(217,119,6,0.22);
    border-color: #f59e0b;
  }

  /* ── Price / Availability cards ── */
  .map-pricing-card {
    border-radius: 14px; padding: 1.1rem;
    background: linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%);
    border: 1.5px solid #fde68a;
    position: relative; overflow: hidden;
  }
  .dark .map-pricing-card {
    background: linear-gradient(135deg, #1c0a00 0%, #20100a 100%);
    border-color: #78350f;
  }
  .map-pricing-card::after {
    content: '₹';
    position: absolute; right: -8px; top: -8px;
    font-size: 5rem; font-weight: 900;
    color: rgba(217,119,6,0.08);
    line-height: 1; pointer-events: none;
  }
  .map-price-val {
    font-size: 2rem; font-weight: 900;
    color: #b45309; line-height: 1;
  }
  .dark .map-price-val { color: #fbbf24; }

  .map-avail-card {
    border-radius: 14px; padding: 1.1rem;
    background: #fff;
    border: 1.5px solid #e2e8f0;
  }
  .dark .map-avail-card { background: #0f172a; border-color: #1e293b; }

  .map-dot {
    width: 10px; height: 10px; border-radius: 50%;
    position: relative; flex-shrink: 0;
  }
  .map-dot.on { background: #22c55e; }
  .map-dot.on::after {
    content: ''; position: absolute; inset: -4px;
    border-radius: 50%;
    background: rgba(34,197,94,0.3);
    animation: pulse-ring 1.6s ease-out infinite;
  }
  .map-dot.off { background: #f87171; }

  /* ── Portfolio ── */
  .map-portfolio-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
  }
  @media (min-width: 768px) {
    .map-portfolio-grid { grid-template-columns: repeat(3, 1fr); }
  }
  .map-portfolio-tile {
    aspect-ratio: 1; border-radius: 14px; overflow: hidden;
    cursor: pointer; position: relative;
    border: 2px solid transparent;
    background: linear-gradient(#fff, #fff) padding-box,
                linear-gradient(135deg, #fde68a, #fb923c) border-box;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .dark .map-portfolio-tile {
    background: linear-gradient(#0f172a, #0f172a) padding-box,
                linear-gradient(135deg, #78350f, #7c2d12) border-box;
  }
  .map-portfolio-tile:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 14px 32px rgba(217,119,6,0.28);
  }
  .map-portfolio-tile img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.45s ease;
  }
  .map-portfolio-tile:hover img { transform: scale(1.1); }
  .map-tile-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%);
    opacity: 0; transition: opacity 0.3s;
    display: flex; align-items: flex-end; padding: 10px;
  }
  .map-portfolio-tile:hover .map-tile-overlay { opacity: 1; }

  /* ── Reviews ── */
  .map-review-item {
    padding: 1rem 0;
    border-bottom: 1px solid #f1f5f9;
    animation: fadeInUp 0.4s ease both;
  }
  .dark .map-review-item { border-color: #1e293b; }
  .map-review-item:last-child { border-bottom: none; padding-bottom: 0; }

  .map-rev-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, #fde68a, #fb923c);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; font-weight: 800; color: #7c2d12;
    flex-shrink: 0;
  }

  /* ── Empty / Loading ── */
  .map-empty {
    text-align: center; padding: 2.5rem 1rem;
  }
  .map-empty-icon {
    font-size: 2.5rem; display: block; margin-bottom: 10px;
    animation: float 3s ease-in-out infinite;
  }
  .map-empty-text { color: #94a3b8; font-size: 0.875rem; }

  .map-loading {
    height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 14px;
  }
  .map-loading-pill {
    background: linear-gradient(135deg, #d97706, #ea580c);
    border-radius: 18px; padding: 16px 20px;
    font-size: 2rem; box-shadow: 0 8px 24px rgba(217,119,6,0.35);
    animation: float 2s ease-in-out infinite;
  }

  /* ── Add More btn ── */
  .map-add-more {
    font-size: 0.8rem; font-weight: 700;
    color: #d97706; background: none; border: none;
    cursor: pointer; padding: 0;
    display: flex; align-items: center; gap: 4px;
    transition: color 0.2s;
  }
  .map-add-more:hover { color: #b45309; }

  /* ── Image modal ── */
  .map-modal {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.93);
    z-index: 50; display: flex;
    align-items: center; justify-content: center;
    padding: 1rem; backdrop-filter: blur(10px);
    animation: fadeIn 0.2s ease;
  }
  .map-modal-close {
    position: absolute; top: 16px; right: 16px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 50%; width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; cursor: pointer; transition: background 0.2s;
  }
  .map-modal-close:hover { background: rgba(255,255,255,0.25); }

  /* ── CTA (edit profile bottom) ── */
  .map-edit-cta {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    color: #fff; border: none; border-radius: 16px;
    font-size: 0.95rem; font-weight: 800; cursor: pointer;
    box-shadow: 0 6px 20px rgba(217,119,6,0.38);
    transition: all 0.25s ease;
    margin-top: 0.5rem;
  }
  .map-edit-cta:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(217,119,6,0.5);
  }
`

export default function MyArtistProfilePage() {
  const navigate = useNavigate()
  const { currentUserId } = useApp()
  const [artist, setArtist] = useState<ArtistData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUserId) { setLoading(false); return }
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
      <>
        <style>{styles}</style>
        <div className="map-loading">
          <div className="map-loading-pill">🎨</div>
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#d97706' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading your profile...</p>
        </div>
      </>
    )
  }

  if (!artist) {
    return (
      <>
        <style>{styles}</style>
        <div className="map-loading">
          <span style={{ fontSize: '3rem', animation: 'float 3s ease-in-out infinite', display: 'block' }}>🖌️</span>
          <p style={{ color: '#64748b', fontWeight: 600 }}>No artist profile found.</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Create one to start showcasing your talent!</p>
          <button
            onClick={() => navigate('/become-artist')}
            style={{
              marginTop: 8, padding: '12px 28px',
              background: 'linear-gradient(135deg, #d97706, #ea580c)',
              color: '#fff', border: 'none', borderRadius: 14,
              fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(217,119,6,0.35)'
            }}
          >
            Create Artist Profile
          </button>
        </div>
      </>
    )
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : (artist.rating?.toFixed(1) || '0.0')

  return (
    <>
      <style>{styles}</style>
      <div className="map-page">

        {/* Image Modal */}
        {selectedImage && (
          <div className="map-modal" onClick={() => setSelectedImage(null)}>
            <button className="map-modal-close" onClick={() => setSelectedImage(null)}>
              <X style={{ width: 18, height: 18 }} />
            </button>
            <img
              src={selectedImage} alt="Portfolio"
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 14 }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        {/* Hero */}
        <div className="map-hero">
          <div className="map-hero-pattern" />

          {/* Top bar */}
          <div className="map-topbar">
            <button className="map-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft style={{ width: 18, height: 18 }} />
            </button>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>
              My Artist Profile
            </span>
          </div>

          {/* Profile row */}
          <div className="map-profile-row">
            <div className="map-avatar">
              <div className="map-avatar-ring" />
              <div className="map-avatar-ring2" />
              {artist.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div className="map-name">{artist.name}</div>
              {artist.verified && (
                <div className="map-verified-badge">
                  <CheckCircle style={{ width: 11, height: 11 }} />
                  Verified Artist
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {artist.location && (
                  <span className="map-info-chip">
                    <MapPin style={{ width: 12, height: 12 }} />
                    {artist.location}
                  </span>
                )}
                {artist.responseTime && (
                  <span className="map-info-chip">
                    <Clock style={{ width: 11, height: 11 }} />
                    Responds {artist.responseTime}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="map-hero-curve" />
        </div>

        {/* Stats */}
        <div className="map-stats-bar">
          {[
            { icon: <TrendingUp style={{ width: 13, height: 13, color: '#d97706' }} />, val: artist.completedOrders || 0, lbl: 'Orders', amber: false },
            { icon: <Star style={{ width: 13, height: 13, fill: '#d97706', color: '#d97706' }} />, val: avgRating, lbl: 'Rating', amber: true },
            { icon: <Award style={{ width: 13, height: 13, color: '#d97706' }} />, val: artist.reviewCount ?? reviews.length, lbl: 'Reviews', amber: false },
            { icon: <Image style={{ width: 13, height: 13, color: '#d97706' }} />, val: artist.portfolio?.length || 0, lbl: 'Works', amber: false },
          ].map((s, i) => (
            <div key={i} className="map-stat" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="map-stat-icon">{s.icon}</div>
              <div className={`map-stat-val ${s.amber ? 'amber' : ''}`}>{s.val}</div>
              <div className="map-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="map-body">

          {/* About */}
          {artist.bio && (
            <div className="map-card" style={{ animationDelay: '0.1s' }}>
              <div className="map-card-accent" />
              <div className="map-card-header">
                <div className="map-card-title">
                  <Palette style={{ width: 13, height: 13 }} />
                  About Me
                </div>
              </div>
              <p className="map-bio">{artist.bio}</p>
            </div>
          )}

          {/* Skills */}
          {artist.skills && artist.skills.length > 0 && (
            <div className="map-card" style={{ animationDelay: '0.15s' }}>
              <div className="map-card-accent" />
              <div className="map-card-header">
                <div className="map-card-title">
                  <Award style={{ width: 13, height: 13 }} />
                  Skills & Expertise
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {artist.skills.map((s, i) => (
                  <span key={i} className="map-skill-pill">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing + Availability */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="map-pricing-card">
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b45309', marginBottom: 6 }}>
                Starting at
              </div>
              <div className="map-price-val">₹{artist.priceRange?.min || 0}</div>
              {artist.priceRange?.max && (
                <div style={{ fontSize: '0.75rem', color: '#a16207', marginTop: 4 }}>Up to ₹{artist.priceRange.max}</div>
              )}
            </div>
            <div className="map-avail-card">
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 10 }}>
                Availability
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className={`map-dot ${artist.availability === 'available' ? 'on' : 'off'}`} />
                <span style={{
                  fontSize: '0.9rem', fontWeight: 800,
                  color: artist.availability === 'available' ? '#16a34a' : '#dc2626'
                }}>
                  {artist.availability === 'available' ? 'Available' : 'Busy'}
                </span>
              </div>
              {artist.joinedDate && (
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 8 }}>
                  Member since {artist.joinedDate}
                </div>
              )}
            </div>
          </div>

          {/* Portfolio */}
          <div className="map-card" style={{ animationDelay: '0.2s' }}>
            <div className="map-card-accent" />
            <div className="map-card-header">
              <div className="map-card-title">
                <Image style={{ width: 13, height: 13 }} />
                Portfolio {artist.portfolio?.length > 0 ? `(${artist.portfolio.length})` : ''}
              </div>
              {artist.portfolio?.length > 0 && (
                <button className="map-add-more" onClick={() => navigate('/become-artist')}>
                  + Add More
                </button>
              )}
            </div>

            {artist.portfolio && artist.portfolio.length > 0 ? (
              <div className="map-portfolio-grid">
                {artist.portfolio.map((item, i) => (
                  <div
                    key={item.id || i}
                    className="map-portfolio-tile"
                    onClick={() => { if (item.imageUrl) setSelectedImage(item.imageUrl) }}
                  >
                    {item.imageUrl ? (
                      <>
                        <img src={item.imageUrl} alt={item.title || `Artwork ${i + 1}`} />
                        <div className="map-tile-overlay">
                          <div>
                            <div style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700 }}>{item.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.68rem' }}>{item.category}</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6
                      }}>
                        <span style={{ fontSize: '2rem' }}>🎨</span>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textAlign: 'center', padding: '0 8px' }}>{item.title}</p>
                        <p style={{ fontSize: '0.67rem', color: '#b45309' }}>{item.category}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="map-empty">
                <span className="map-empty-icon">🖼️</span>
                <p style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }} className="dark:text-gray-200">No Portfolio Yet</p>
                <p className="map-empty-text">Add your artworks to showcase your talent</p>
                <button
                  onClick={() => navigate('/become-artist')}
                  style={{
                    marginTop: 14, padding: '10px 22px',
                    background: 'linear-gradient(135deg, #d97706, #ea580c)',
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(217,119,6,0.3)'
                  }}
                >
                  Add Portfolio Images
                </button>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="map-card" style={{ animationDelay: '0.25s' }}>
            <div className="map-card-accent" />
            <div className="map-card-header">
              <div className="map-card-title">
                <Star style={{ width: 13, height: 13 }} />
                Customer Reviews
              </div>
              {reviews.length > 0 && (
                <span style={{
                  fontSize: '0.7rem', fontWeight: 800, color: '#d97706',
                  background: '#fef3c7', border: '1px solid #fde68a',
                  borderRadius: 99, padding: '2px 8px'
                }}>{reviews.length}</span>
              )}
            </div>

            {reviews.length > 0 ? (
              <div>
                {reviews.map((review, i) => (
                  <div key={review.id || i} className="map-review-item" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                      <div className="map-rev-avatar">
                        {(review.customerName || 'C').charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }} className="dark:text-gray-100">
                            {review.customerName || 'Customer'}
                          </span>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} style={{
                                width: 12, height: 12,
                                fill: j < review.rating ? '#f59e0b' : 'none',
                                color: j < review.rating ? '#f59e0b' : '#cbd5e1'
                              }} />
                            ))}
                          </div>
                        </div>
                        {review.createdAt && (
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{review.createdAt}</span>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.65, paddingLeft: 48 }} className="dark:text-gray-400">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="map-empty">
                <span className="map-empty-icon">⭐</span>
                <p style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }} className="dark:text-gray-200">No Reviews Yet</p>
                <p className="map-empty-text">Complete orders to start receiving reviews from customers</p>
              </div>
            )}
          </div>

          {/* Edit Profile CTA */}
          <button className="map-edit-cta" onClick={() => navigate('/become-artist')}>
            <Edit style={{ width: 18, height: 18 }} />
            Edit & Update My Profile
          </button>

        </div>
      </div>
    </>
  )
}