import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { getArtistById, getArtistReviews } from '@/services/firestoreService'
import { validateImage, imageToBase64 } from '@/services/imageService'
import { getIndianStates, getCitiesByState } from '@/services/locationService'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import {
  ArrowLeft, MapPin, Star, Clock, CheckCircle, Edit, Loader2, X,
  TrendingUp, Palette, Award, Image, Save, Search, Upload,
  CheckCircle2, AlertCircle, Plus, Trash2, User, BadgeCheck
} from 'lucide-react'

/* ─────────────────────── TYPES ─────────────────────── */
interface Review {
  id: string; customerName?: string; rating: number; comment: string; createdAt?: string;
}
interface PortfolioItem {
  id: string; title: string; imageUrl: string; category: string;
}
interface ArtistData {
  id: string; name: string; email?: string; bio?: string; location?: string;
  skills: string[]; priceRange?: { min: number; max: number };
  rating: number; reviewCount?: number; completedOrders?: number;
  portfolio: PortfolioItem[]; availability?: string;
  verified?: boolean; joinedDate?: string; responseTime?: string;
}

const SKILLS = [
  'Sketch','Pencil Drawing','Charcoal Art','Portrait','Caricature',
  'Oil Painting','Watercolor','Acrylic Painting','Digital Art','Vector Art',
  'Calligraphy','Mandala Art','Rangoli Design','Mehndi Design','Wall Mural',
  'Clay Sculpture','Wood Carving','Paper Craft','Handmade Jewelry','Embroidery',
]

/* ─────────────────────── STYLES ─────────────────────── */
const styles = `
  @keyframes map-up    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes map-in    { from{opacity:0} to{opacity:1} }
  @keyframes map-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes map-ring  { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.9);opacity:0} }
  @keyframes map-pop   { 0%{transform:scale(0) rotate(-10deg)} 60%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0)} }
  @keyframes map-slide { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes map-scale { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
  @keyframes map-spin  { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes map-imgIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
  @keyframes map-cityin{ from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

  /* ── Page ── */
  .map-page { height:100%; overflow-y:auto; background:#f8fafc; transition:background 0.3s; }
  .dark .map-page { background:#030712; }

  /* ── Hero ── */
  .map-hero {
    position:relative; overflow:hidden;
    background:linear-gradient(150deg,#7c2d12 0%,#9a3412 25%,#c2410c 60%,#d97706 100%);
    padding:1.5rem 1.5rem 3rem;
  }
  .map-hero-pattern {
    position:absolute; inset:0; pointer-events:none;
    background-image:
      radial-gradient(circle at 20% 50%,rgba(255,255,255,0.06) 0%,transparent 50%),
      radial-gradient(circle at 80% 20%,rgba(255,255,255,0.04) 0%,transparent 40%),
      repeating-linear-gradient(45deg,transparent,transparent 30px,rgba(255,255,255,0.015) 30px,rgba(255,255,255,0.015) 31px);
  }
  .map-hero-curve { position:absolute; bottom:-1px; left:0; right:0; height:36px; background:#f8fafc; clip-path:ellipse(60% 100% at 50% 100%); }
  .dark .map-hero-curve { background:#030712; }

  .map-topbar { display:flex; align-items:center; gap:12px; margin-bottom:24px; position:relative; z-index:1; }
  .map-back-btn {
    background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2);
    border-radius:11px; padding:8px; display:flex; cursor:pointer; color:#fff;
    backdrop-filter:blur(4px); transition:background 0.2s; flex-shrink:0;
  }
  .map-back-btn:hover { background:rgba(255,255,255,0.22); }
  .map-edit-hero-btn {
    margin-left:auto; display:inline-flex; align-items:center; gap:6px;
    padding:8px 16px; background:rgba(255,255,255,0.18);
    border:1px solid rgba(255,255,255,0.3); border-radius:11px;
    color:#fff; font-size:0.82rem; font-weight:700; cursor:pointer;
    backdrop-filter:blur(4px); transition:all 0.2s; font-family:inherit;
  }
  .map-edit-hero-btn:hover { background:rgba(255,255,255,0.28); transform:translateY(-1px); }
  .map-edit-hero-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

  .map-profile-row { display:flex; align-items:flex-end; gap:16px; position:relative; z-index:1; padding-bottom:12px; }
  .map-avatar {
    width:90px; height:90px; border-radius:50%;
    background:rgba(255,255,255,0.18); backdrop-filter:blur(10px);
    border:3px solid rgba(255,255,255,0.45);
    display:flex; align-items:center; justify-content:center;
    font-size:2.2rem; font-weight:900; color:#fff;
    position:relative; flex-shrink:0; box-shadow:0 8px 28px rgba(0,0,0,0.25);
    animation:map-up 0.45s ease both;
  }
  .map-avatar-ring  { position:absolute; inset:-7px;  border-radius:50%; border:2px solid rgba(255,255,255,0.25); animation:map-ring 2.2s ease-out infinite; }
  .map-avatar-ring2 { position:absolute; inset:-14px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.12); animation:map-ring 2.2s 0.5s ease-out infinite; }
  .map-name { font-size:1.55rem; font-weight:900; color:#fff; line-height:1.15; text-shadow:0 2px 10px rgba(0,0,0,0.2); animation:map-up 0.45s 0.08s ease both; }
  .map-verified-badge {
    display:inline-flex; align-items:center; gap:5px;
    background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.3);
    border-radius:99px; padding:3px 10px; font-size:0.68rem; font-weight:800;
    color:#fff; letter-spacing:0.06em; text-transform:uppercase; margin-top:4px; margin-bottom:6px;
  }
  .map-info-chip { display:inline-flex; align-items:center; gap:5px; font-size:0.8rem; color:rgba(255,255,255,0.8); margin-top:4px; }
  .map-info-chip + .map-info-chip { margin-left:12px; }

  /* ── Stats bar ── */
  .map-stats-bar { display:grid; grid-template-columns:repeat(4,1fr); background:#fff; border-bottom:1px solid #f3f4f6; position:relative; z-index:1; box-shadow:0 4px 16px rgba(0,0,0,0.05); }
  .dark .map-stats-bar { background:#0f172a; border-color:#1e293b; }
  .map-stat { padding:14px 6px; text-align:center; position:relative; animation:map-up 0.4s ease both; cursor:default; transition:background 0.2s; }
  .map-stat:hover { background:#fffbeb; }
  .dark .map-stat:hover { background:rgba(120,53,15,0.1); }
  .map-stat + .map-stat::before { content:''; position:absolute; left:0; top:22%; bottom:22%; width:1px; background:linear-gradient(to bottom,transparent,#e5e7eb,transparent); }
  .dark .map-stat + .map-stat::before { background:linear-gradient(to bottom,transparent,#334155,transparent); }
  .map-stat-icon { width:28px; height:28px; background:linear-gradient(135deg,#fef3c7,#fde68a); border-radius:8px; margin:0 auto 5px; display:flex; align-items:center; justify-content:center; }
  .dark .map-stat-icon { background:linear-gradient(135deg,#3b1c00,#451a03); }
  .map-stat-val { font-size:1.3rem; font-weight:900; color:#1f2937; line-height:1; }
  .dark .map-stat-val { color:#f8fafc; }
  .map-stat-val.amber { color:#d97706; }
  .map-stat-lbl { font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:0.09em; color:#94a3b8; margin-top:3px; }

  /* ── Body ── */
  .map-body { padding:1.25rem; display:flex; flex-direction:column; gap:1rem; }

  .map-card {
    background:#fff; border-radius:18px; border:1px solid #f1f5f9;
    box-shadow:0 2px 12px rgba(0,0,0,0.04); padding:1.25rem;
    animation:map-up 0.45s ease both; overflow:hidden; position:relative;
  }
  .dark .map-card { background:#0f172a; border-color:#1e293b; }

  .map-card-accent { position:absolute; top:0; left:0; width:4px; height:100%; background:linear-gradient(to bottom,#d97706,#ea580c); border-radius:18px 0 0 18px; }

  .map-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.875rem; }
  .map-card-title {
    font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#d97706;
    display:flex; align-items:center; gap:6px;
  }
  .map-card-title::after { content:''; width:32px; height:2px; background:linear-gradient(to right,#fde68a,transparent); border-radius:99px; margin-left:4px; }
  .dark .map-card-title::after { background:linear-gradient(to right,#78350f,transparent); }

  /* Small edit link in card header */
  .map-card-edit-btn {
    display:inline-flex; align-items:center; gap:4px;
    background:none; border:none; cursor:pointer; padding:4px 8px;
    font-size:0.72rem; font-weight:700; color:#d97706;
    border-radius:8px; transition:all 0.18s; font-family:inherit;
  }
  .map-card-edit-btn:hover { background:#fffbeb; color:#b45309; }
  .dark .map-card-edit-btn:hover { background:rgba(217,119,6,0.1); color:#fbbf24; }

  .map-bio { font-size:0.9rem; line-height:1.75; color:#475569; font-style:italic; padding-left:14px; border-left:3px solid #fde68a; }
  .dark .map-bio { color:#94a3b8; border-left-color:#78350f; }

  .map-skill-pill { display:inline-flex; align-items:center; padding:6px 14px; background:linear-gradient(135deg,#fffbeb,#fef9ee); border:1.5px solid #fde68a; border-radius:99px; font-size:0.78rem; font-weight:700; color:#92400e; transition:all 0.2s; }
  .dark .map-skill-pill { background:linear-gradient(135deg,#1c0a00,#2d1106); border-color:#78350f; color:#fcd34d; }
  .map-skill-pill:hover { transform:translateY(-2px) scale(1.04); box-shadow:0 5px 14px rgba(217,119,6,0.22); border-color:#f59e0b; }

  .map-pricing-card { border-radius:14px; padding:1.1rem; background:linear-gradient(135deg,#fffbeb 0%,#fff7ed 100%); border:1.5px solid #fde68a; position:relative; overflow:hidden; cursor:pointer; transition:box-shadow 0.2s; }
  .dark .map-pricing-card { background:linear-gradient(135deg,#1c0a00 0%,#20100a 100%); border-color:#78350f; }
  .map-pricing-card::after { content:'₹'; position:absolute; right:-8px; top:-8px; font-size:5rem; font-weight:900; color:rgba(217,119,6,0.08); line-height:1; pointer-events:none; }
  .map-pricing-card:hover { box-shadow:0 4px 16px rgba(217,119,6,0.2); }
  .map-price-val { font-size:2rem; font-weight:900; color:#b45309; line-height:1; }
  .dark .map-price-val { color:#fbbf24; }

  .map-avail-card { border-radius:14px; padding:1.1rem; background:#fff; border:1.5px solid #e2e8f0; cursor:pointer; transition:box-shadow 0.2s; }
  .dark .map-avail-card { background:#0f172a; border-color:#1e293b; }
  .map-avail-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.08); }

  .map-dot { width:10px; height:10px; border-radius:50%; position:relative; flex-shrink:0; }
  .map-dot.on  { background:#22c55e; }
  .map-dot.on::after { content:''; position:absolute; inset:-4px; border-radius:50%; background:rgba(34,197,94,0.3); animation:map-ring 1.6s ease-out infinite; }
  .map-dot.off { background:#f87171; }

  .map-portfolio-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  @media(min-width:768px){ .map-portfolio-grid{ grid-template-columns:repeat(3,1fr); } }

  .map-portfolio-tile { aspect-ratio:1; border-radius:14px; overflow:hidden; cursor:pointer; position:relative; border:2px solid transparent; background:linear-gradient(#fff,#fff) padding-box,linear-gradient(135deg,#fde68a,#fb923c) border-box; transition:transform 0.3s,box-shadow 0.3s; }
  .dark .map-portfolio-tile { background:linear-gradient(#0f172a,#0f172a) padding-box,linear-gradient(135deg,#78350f,#7c2d12) border-box; }
  .map-portfolio-tile:hover { transform:translateY(-4px) scale(1.02); box-shadow:0 14px 32px rgba(217,119,6,0.28); }
  .map-portfolio-tile img { width:100%; height:100%; object-fit:cover; transition:transform 0.45s; }
  .map-portfolio-tile:hover img { transform:scale(1.1); }
  .map-tile-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 55%); opacity:0; transition:opacity 0.3s; display:flex; align-items:flex-end; padding:10px; }
  .map-portfolio-tile:hover .map-tile-overlay { opacity:1; }

  .map-review-item { padding:1rem 0; border-bottom:1px solid #f1f5f9; animation:map-up 0.4s ease both; }
  .dark .map-review-item { border-color:#1e293b; }
  .map-review-item:last-child { border-bottom:none; padding-bottom:0; }
  .map-rev-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#fde68a,#fb923c); display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:800; color:#7c2d12; flex-shrink:0; }

  .map-empty { text-align:center; padding:2.5rem 1rem; }
  .map-empty-icon { font-size:2.5rem; display:block; margin-bottom:10px; animation:map-float 3s ease-in-out infinite; }
  .map-empty-text { color:#94a3b8; font-size:0.875rem; }

  .map-loading { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
  .map-loading-pill { background:linear-gradient(135deg,#d97706,#ea580c); border-radius:18px; padding:16px 20px; font-size:2rem; box-shadow:0 8px 24px rgba(217,119,6,0.35); animation:map-float 2s ease-in-out infinite; }

  /* Lightbox */
  .map-lightbox { position:fixed; inset:0; background:rgba(0,0,0,0.93); z-index:50; display:flex; align-items:center; justify-content:center; padding:1rem; backdrop-filter:blur(10px); animation:map-in 0.2s ease; }
  .map-lightbox-close { position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; color:#fff; cursor:pointer; transition:background 0.2s; }
  .map-lightbox-close:hover { background:rgba(255,255,255,0.25); }

  .map-edit-cta { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:14px; background:linear-gradient(135deg,#d97706,#ea580c); color:#fff; border:none; border-radius:16px; font-size:0.95rem; font-weight:800; cursor:pointer; box-shadow:0 6px 20px rgba(217,119,6,0.38); transition:all 0.25s; margin-top:0.5rem; font-family:inherit; }
  .map-edit-cta:hover { transform:translateY(-3px); box-shadow:0 10px 28px rgba(217,119,6,0.5); }
  .map-edit-cta:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

  /* ══════════════════════════════════════════
     EDIT MODAL  (em- prefix)
  ══════════════════════════════════════════ */

  .em-overlay {
    position:fixed; inset:0;
    background:rgba(2,6,23,0.75); backdrop-filter:blur(8px);
    z-index:60; display:flex; align-items:flex-end; justify-content:center;
    animation:map-in 0.22s ease;
  }
  @media(min-width:640px){ .em-overlay{ align-items:center; } }

  .em-sheet {
    background:#fff; width:100%; max-width:560px;
    height:92vh;
    border-radius:24px 24px 0 0;
    overflow:hidden;
    display:flex; flex-direction:column;
    animation:map-slide 0.4s cubic-bezier(0.22,1,0.36,1) both;
    box-shadow:0 -8px 48px rgba(0,0,0,0.22);
  }
  @media(min-width:640px){
    .em-sheet{ border-radius:26px; height:auto; max-height:90vh; animation:map-scale 0.35s cubic-bezier(0.22,1,0.36,1) both; }
  }
  .dark .em-sheet { background:#0c1220; }

  /* drag pill — mobile only */
  .em-pill { width:40px; height:4px; border-radius:99px; background:#e2e8f0; margin:10px auto 0; flex-shrink:0; }
  .dark .em-pill { background:#1e293b; }
  @media(min-width:640px){ .em-pill{ display:none; } }

  /* Header */
  .em-header {
    flex-shrink:0; padding:18px 20px 0; background:#fff;
    position:relative; overflow:hidden;
  }
  .dark .em-header { background:#0c1220; }
  .em-header::before { content:''; position:absolute; top:-32px; left:-32px; width:120px; height:120px; border-radius:50%; background:radial-gradient(circle,rgba(217,119,6,0.1) 0%,transparent 70%); pointer-events:none; }

  .em-header-row { display:flex; align-items:center; justify-content:space-between; gap:12px; position:relative; }
  .em-header-icon { width:46px; height:46px; border-radius:14px; background:linear-gradient(135deg,#d97706,#ea580c); display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; box-shadow:0 4px 14px rgba(217,119,6,0.35); }
  .em-header-title { font-size:1.05rem; font-weight:900; color:#0f172a; letter-spacing:-0.01em; }
  .dark .em-header-title { color:#f8fafc; }
  .em-header-sub { font-size:0.72rem; color:#94a3b8; margin-top:2px; }

  .em-close { width:34px; height:34px; border-radius:50%; background:#f1f5f9; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; color:#64748b; flex-shrink:0; font-family:inherit; }
  .dark .em-close { background:#1e293b; color:#94a3b8; }
  .em-close:hover { background:#fee2e2; color:#dc2626; transform:rotate(90deg); }
  .dark .em-close:hover { background:rgba(239,68,68,0.1); color:#f87171; }

  /* Tabs */
  .em-tabs { display:flex; gap:2px; padding:12px 20px 0; border-bottom:1px solid #f1f5f9; flex-shrink:0; background:#fff; overflow-x:auto; scrollbar-width:none; }
  .em-tabs::-webkit-scrollbar { display:none; }
  .dark .em-tabs { background:#0c1220; border-color:#1e293b; }

  .em-tab { flex:1; min-width:90px; display:flex; align-items:center; justify-content:center; gap:5px; padding:9px 8px 11px; font-size:0.78rem; font-weight:700; background:none; border:none; cursor:pointer; color:#94a3b8; border-bottom:2px solid transparent; margin-bottom:-1px; white-space:nowrap; transition:color 0.2s; font-family:inherit; position:relative; }
  .em-tab:hover { color:#d97706; }
  .em-tab.active { color:#d97706; border-bottom-color:#d97706; }
  .dark .em-tab { color:#475569; }
  .dark .em-tab:hover { color:#fbbf24; }
  .dark .em-tab.active { color:#fbbf24; border-bottom-color:#fbbf24; }

  /* Body scroll area */
  .em-body { flex:1; min-height:0; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:20px; display:flex; flex-direction:column; gap:16px; scrollbar-width:thin; scrollbar-color:#e2e8f0 transparent; }
  .dark .em-body { scrollbar-color:#1e293b transparent; }

  /* Field group — same as ep-group in ProfilePage */
  .em-group { background:#f8fafc; border:1.5px solid #f1f5f9; border-radius:18px; transition:border-color 0.2s; }
  .dark .em-group { background:#111827; border-color:#1e293b; }
  .em-group:focus-within { border-color:rgba(217,119,6,0.4); }

  .em-field { padding:13px 16px; border-bottom:1px solid #f1f5f9; position:relative; }
  .dark .em-field { border-color:#1e293b; }
  .em-field:last-child { border-bottom:none; }

  .em-lbl { display:block; font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#94a3b8; margin-bottom:5px; }
  .dark .em-lbl { color:#475569; }

  .em-row { display:flex; align-items:center; gap:8px; }

  .em-input {
    flex:1; background:none; border:none; outline:none;
    font-size:0.9rem; font-weight:600; color:#0f172a;
    padding:0; min-width:0; font-family:inherit;
  }
  .dark .em-input { color:#f1f5f9; }
  .em-input::placeholder { color:#cbd5e1; font-weight:400; }
  .dark .em-input::placeholder { color:#374151; }

  .em-select { flex:1; background:none; border:none; outline:none; font-size:0.9rem; font-weight:600; color:#0f172a; padding:0; cursor:pointer; appearance:none; font-family:inherit; min-width:0; }
  .dark .em-select { color:#f1f5f9; }
  .em-select option { background:#fff; color:#0f172a; }
  .dark .em-select option { background:#1e293b; color:#f1f5f9; }

  .em-textarea { flex:1; background:none; border:none; outline:none; font-size:0.875rem; font-weight:500; color:#0f172a; resize:none; line-height:1.65; font-family:inherit; padding:0; min-height:80px; }
  .dark .em-textarea { color:#f1f5f9; }
  .em-textarea::placeholder { color:#cbd5e1; }
  .dark .em-textarea::placeholder { color:#374151; }

  .em-char { text-align:right; font-size:0.65rem; color:#cbd5e1; margin-top:3px; transition:color 0.2s; }
  .em-char.warn { color:#f59e0b; }

  /* Section label */
  .em-section-lbl { font-size:0.68rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8; display:flex; align-items:center; gap:6px; }
  .em-section-lbl::after { content:''; flex:1; height:1px; background:#f1f5f9; }
  .dark .em-section-lbl::after { background:#1e293b; }

  /* City dropdown */
  .em-city-drop { border:1.5px solid #e2e8f0; border-radius:14px; max-height:160px; overflow-y:auto; margin-top:6px; background:#fff; box-shadow:0 8px 24px rgba(0,0,0,0.1); animation:map-cityin 0.2s ease; }
  .dark .em-city-drop { background:#1e293b; border-color:#334155; box-shadow:0 8px 24px rgba(0,0,0,0.4); }
  .em-city-item { width:100%; text-align:left; padding:9px 14px; font-size:0.84rem; font-weight:500; color:#334155; background:none; border:none; cursor:pointer; border-bottom:1px solid #f8fafc; display:flex; align-items:center; gap:8px; transition:all 0.15s; font-family:inherit; }
  .dark .em-city-item { color:#94a3b8; border-color:#1e293b; }
  .em-city-item:last-child { border-bottom:none; }
  .em-city-item:hover { background:#fffbeb; color:#92400e; padding-left:18px; }
  .dark .em-city-item:hover { background:rgba(217,119,6,0.08); color:#fbbf24; padding-left:18px; }
  .em-city-item.picked { background:#fef3c7; color:#b45309; font-weight:700; }
  .dark .em-city-item.picked { background:rgba(217,119,6,0.12); color:#fcd34d; }

  /* Skill chips */
  .em-skills-wrap { display:flex; flex-wrap:wrap; gap:7px; }
  .em-skill { padding:6px 13px; border-radius:99px; font-size:0.75rem; font-weight:700; cursor:pointer; border:1.5px solid; transition:all 0.18s; user-select:none; font-family:inherit; }
  .em-skill.on  { background:linear-gradient(135deg,#d97706,#ea580c); color:#fff; border-color:transparent; box-shadow:0 3px 10px rgba(217,119,6,0.35); transform:scale(1.04); }
  .em-skill.off { background:#fff; color:#64748b; border-color:#e2e8f0; }
  .dark .em-skill.off { background:#111827; color:#94a3b8; border-color:#1e293b; }
  .em-skill.off:hover { border-color:#fde68a; color:#d97706; background:#fffbeb; }
  .dark .em-skill.off:hover { border-color:#78350f; color:#fbbf24; background:rgba(217,119,6,0.06); }

  /* Availability */
  .em-avail-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .em-avail-card { padding:14px 12px; border-radius:14px; border:2px solid; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; align-items:center; gap:6px; user-select:none; background:none; font-family:inherit; }
  .em-avail-card.green-on { background:linear-gradient(135deg,#f0fdf4,#dcfce7); border-color:#86efac; box-shadow:0 4px 14px rgba(34,197,94,0.2); }
  .dark .em-avail-card.green-on { background:rgba(20,83,45,0.15); border-color:rgba(34,197,94,0.35); }
  .em-avail-card.red-on { background:linear-gradient(135deg,#fff1f2,#fee2e2); border-color:#fca5a5; box-shadow:0 4px 14px rgba(239,68,68,0.15); }
  .dark .em-avail-card.red-on { background:rgba(127,29,29,0.15); border-color:rgba(239,68,68,0.35); }
  .em-avail-card.off-state { background:#f8fafc; border-color:#e2e8f0; }
  .dark .em-avail-card.off-state { background:#111827; border-color:#1e293b; }
  .em-avail-icon { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1rem; }
  .em-avail-lbl { font-size:0.82rem; font-weight:800; }
  .em-avail-desc { font-size:0.66rem; color:#94a3b8; text-align:center; line-height:1.3; }

  /* Portfolio grid inside modal */
  .em-port-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }

  .em-port-tile { aspect-ratio:1; border-radius:12px; overflow:hidden; position:relative; background:#f1f5f9; border:1.5px solid #e2e8f0; animation:map-imgIn 0.25s ease both; }
  .dark .em-port-tile { background:#1e293b; border-color:#334155; }
  .em-port-tile img { width:100%; height:100%; object-fit:cover; display:block; }

  .em-port-del { position:absolute; top:4px; right:4px; width:24px; height:24px; border-radius:50%; background:rgba(15,23,42,0.75); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff; opacity:0; transition:opacity 0.15s; padding:0; }
  .em-port-tile:hover .em-port-del { opacity:1; }
  .em-port-del:hover { background:rgba(239,68,68,0.9); }

  /* Upload drop zone */
  .em-port-drop { border:2px dashed #e2e8f0; border-radius:14px; background:#f8fafc; cursor:pointer; transition:all 0.2s; }
  .dark .em-port-drop { background:#111827; border-color:#1e293b; }
  .em-port-drop:hover { border-color:#d97706; background:#fffbeb; }
  .dark .em-port-drop:hover { background:rgba(217,119,6,0.04); border-color:#92400e; }
  .em-port-drop.drag { border-color:#d97706; background:#fffbeb; transform:scale(1.01); }
  .dark .em-port-drop.drag { background:rgba(217,119,6,0.06); }

  .em-port-drop-inner { padding:22px 16px; text-align:center; pointer-events:none; }
  .em-port-drop-icon { width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg,#fef3c7,#fde68a); display:flex; align-items:center; justify-content:center; margin:0 auto 8px; color:#d97706; transition:transform 0.2s; }
  .em-port-drop:hover .em-port-drop-icon { transform:scale(1.08); }
  .em-port-drop-text { font-size:0.8rem; font-weight:600; color:#64748b; }
  .dark .em-port-drop-text { color:#94a3b8; }
  .em-port-drop-hint { font-size:0.68rem; color:#94a3b8; margin-top:3px; }

  .em-port-processing { display:flex; align-items:center; justify-content:center; gap:8px; padding:22px 16px; color:#d97706; font-size:0.8rem; font-weight:600; }
  .em-port-spinner { width:18px; height:18px; border-radius:50%; border:2px solid #fde68a; border-top-color:#d97706; animation:map-spin 0.7s linear infinite; flex-shrink:0; }

  .em-port-err { display:flex; align-items:center; gap:5px; padding:5px 10px; border-radius:9px; background:#fff5f5; border:1px solid #fecaca; font-size:0.68rem; color:#dc2626; font-weight:600; margin-top:6px; animation:map-in 0.2s ease; }
  .dark .em-port-err { background:rgba(239,68,68,0.06); border-color:rgba(239,68,68,0.2); color:#f87171; }

  .em-port-count { text-align:right; font-size:0.68rem; color:#94a3b8; font-weight:600; margin-bottom:8px; }

  /* Footer */
  .em-footer { padding:12px 20px 16px; border-top:1px solid #f1f5f9; display:flex; gap:10px; flex-shrink:0; background:#fff; }
  .dark .em-footer { background:#0c1220; border-color:#1e293b; }

  .em-cancel { padding:12px 18px; background:#f1f5f9; color:#475569; border:none; border-radius:14px; font-size:0.875rem; font-weight:700; cursor:pointer; transition:all 0.2s; flex-shrink:0; font-family:inherit; }
  .dark .em-cancel { background:#1e293b; color:#94a3b8; }
  .em-cancel:hover { background:#e2e8f0; color:#334155; }
  .dark .em-cancel:hover { background:#334155; color:#e2e8f0; }

  .em-save { flex:1; padding:13px; background:linear-gradient(135deg,#d97706,#ea580c); color:#fff; border:none; border-radius:14px; font-size:0.9rem; font-weight:800; cursor:pointer; transition:all 0.25s; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 16px rgba(217,119,6,0.4); letter-spacing:0.01em; font-family:inherit; }
  .em-save:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(217,119,6,0.5); }
  .em-save:disabled { opacity:0.45; cursor:not-allowed; box-shadow:none; transform:none; }

  /* Success screen inside modal */
  .em-success { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2.5rem 2rem; gap:10px; text-align:center; }
  .em-success-icon { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#d1fae5,#a7f3d0); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 28px rgba(34,197,94,0.3); animation:map-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both; margin-bottom:4px; }
  .em-success-title { font-size:1.2rem; font-weight:900; color:#0f172a; }
  .dark .em-success-title { color:#f8fafc; }
  .em-success-sub { font-size:0.85rem; color:#94a3b8; line-height:1.5; max-width:240px; }
  .em-success-emoji { font-size:2rem; animation:map-float 2s ease-in-out infinite; }
`

/* ─────────────────────── COMPONENT ─────────────────────── */
export default function MyArtistProfilePage() {
  const navigate = useNavigate()
  const { currentUserId } = useApp()
  const [artist, setArtist] = useState<ArtistData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<string | null>(null)

  /* ── Edit Modal ── */
  const [showModal, setShowModal]       = useState(false)
  const [tab, setTab]                   = useState<'basic'|'skills'|'portfolio'>('basic')
  const [saving, setSaving]             = useState(false)
  const [saveSuccess, setSaveSuccess]   = useState(false)
  const [openLoading, setOpenLoading]   = useState(false)

  /* Basic */
  const [eName, setEName]   = useState('')
  const [eBio,  setEBio]    = useState('')
  const [eState, setEState] = useState('')
  const [eCity,  setECity]  = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [citySearch, setCitySearch]   = useState('')
  const [cityLoading, setCityLoading] = useState(false)
  const [ePrice, setEPrice] = useState('')
  const [eAvail, setEAvail] = useState<'available'|'busy'>('available')

  /* Skills */
  const [eSkills, setESkills] = useState<string[]>([])

  /* Portfolio */
  const [ePortfolio, setEPortfolio]     = useState<PortfolioItem[]>([])
  const [portUploading, setPortUploading] = useState(false)
  const [portDragging, setPortDragging]  = useState(false)
  const [portErrors, setPortErrors]      = useState<string[]>([])
  const portRef = useRef<HTMLInputElement>(null)

  const allStates = getIndianStates()

  /* ── Load ── */
  useEffect(() => {
    if (!currentUserId) { setLoading(false); return }
    const load = async () => {
      try {
        const data = await getArtistById(currentUserId)
        if (data) {
          setArtist(data as unknown as ArtistData)
          const rev = await getArtistReviews(currentUserId)
          setReviews(rev as unknown as Review[])
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [currentUserId])

  /* ── Open modal — pre-fill from DB data ── */
  const openModal = async (startTab?: 'basic'|'skills'|'portfolio') => {
    if (!artist) return
    setOpenLoading(true)
    // Pre-fill all fields
    setEName(artist.name || '')
    setEBio(artist.bio || '')
    setEPrice(String(artist.priceRange?.min || ''))
    setEAvail((artist.availability as 'available'|'busy') || 'available')
    setESkills([...(artist.skills || [])])
    setEPortfolio([...(artist.portfolio || [])])
    setPortErrors([])
    setSaveSuccess(false)
    setTab(startTab || 'basic')

    // Parse stored location  "City, State"
    if (artist.location) {
      const parts = artist.location.split(', ')
      if (parts.length >= 2) {
        const st = parts[parts.length - 1]
        const ct = parts.slice(0, parts.length - 1).join(', ')
        setEState(st); setECity(ct); setCitySearch(ct)
        setCityLoading(true)
        const cl = await getCitiesByState(st)
        setCities(cl); setCityLoading(false)
      } else {
        setEState(artist.location); setECity(''); setCitySearch('')
        setCities([])
      }
    } else { setEState(''); setECity(''); setCitySearch(''); setCities([]) }

    setOpenLoading(false)
    setShowModal(true)
  }

  const closeModal = () => { if (!saving) setShowModal(false) }

  /* ── State change in modal ── */
  const handleStateChange = async (st: string) => {
    setEState(st); setECity(''); setCitySearch('')
    setCityLoading(true)
    const cl = await getCitiesByState(st)
    setCities(cl); setCityLoading(false)
  }

  const filteredCities = citySearch
    ? cities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
    : cities

  /* ── Portfolio upload ── */
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files)
    const remaining = 10 - ePortfolio.length
    if (remaining <= 0) return
    setPortUploading(true); setPortErrors([])
    const errors: string[] = []
    const newItems: PortfolioItem[] = []

    for (let i = 0; i < arr.slice(0, remaining).length; i++) {
      const file = arr[i]
      const v = validateImage(file)
      if (!v.valid) { errors.push(`${file.name}: ${v.error}`); continue }
      try {
        const base64 = await imageToBase64(file)
        newItems.push({ id: `p-${Date.now()}-${i}`, title: `Artwork ${ePortfolio.length + newItems.length + 1}`, imageUrl: base64, category: 'Art' })
      } catch { errors.push(`${file.name}: Failed`) }
    }
    if (errors.length) setPortErrors(errors)
    setEPortfolio(prev => [...prev, ...newItems])
    setPortUploading(false)
  }, [ePortfolio.length])

  /* ── Save to Firestore ── */
  const handleSave = async () => {
    if (!currentUserId || !eName.trim()) return
    setSaving(true)
    try {
      const location = eCity ? `${eCity}, ${eState}` : eState
      const priceMin = parseInt(ePrice) || artist?.priceRange?.min || 500
      const updates = {
        name:       eName.trim(),
        bio:        eBio.trim(),
        location,
        skills:     eSkills,
        priceRange: { min: priceMin, max: priceMin * 5 },
        availability: eAvail,
        portfolio:  ePortfolio,
        updatedAt:  serverTimestamp(),
      }
      await updateDoc(doc(db, 'artists', currentUserId), updates)
      // Instant local update — no need to refetch
      setArtist(prev => prev ? { ...prev, ...updates } : prev)
      setSaveSuccess(true)
      setTimeout(() => { setShowModal(false); setSaveSuccess(false) }, 2200)
    } catch (e) {
      console.error('[MyArtistProfile] Save failed:', e)
    } finally { setSaving(false) }
  }

  /* ── Loading / not found screens ── */
  if (loading) return (
    <><style>{styles}</style>
      <div className="map-loading">
        <div className="map-loading-pill">🎨</div>
        <Loader2 style={{ color: '#d97706', animation: 'map-spin 0.8s linear infinite', width: 22, height: 22 }} />
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading your profile…</p>
      </div>
    </>
  )

  if (!artist) return (
    <><style>{styles}</style>
      <div className="map-loading">
        <span style={{ fontSize: '3rem', display: 'block', animation: 'map-float 3s ease-in-out infinite' }}>🖌️</span>
        <p style={{ color: '#64748b', fontWeight: 600 }}>No artist profile found.</p>
        <button onClick={() => navigate('/become-artist')} style={{ marginTop: 12, padding: '12px 28px', background: 'linear-gradient(135deg,#d97706,#ea580c)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 6px 18px rgba(217,119,6,0.35)' }}>
          Create Artist Profile
        </button>
      </div>
    </>
  )

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : (artist.rating?.toFixed(1) || '0.0')

  return (
    <>
      <style>{styles}</style>
      <div className="map-page">

        {/* ── Lightbox ── */}
        {lightbox && (
          <div className="map-lightbox" onClick={() => setLightbox(null)}>
            <button className="map-lightbox-close"><X style={{ width: 18, height: 18 }} /></button>
            <img src={lightbox} alt="Portfolio" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 14 }} onClick={e => e.stopPropagation()} />
          </div>
        )}

        {/* ══════════════════════════════════
            EDIT MODAL
        ══════════════════════════════════ */}
        {showModal && (
          <div className="em-overlay" onClick={closeModal}>
            <div className="em-sheet" onClick={e => e.stopPropagation()}>
              <div className="em-pill" />

              {/* Header */}
              <div className="em-header">
                <div className="em-header-row">
                  <div className="em-header-icon">✏️</div>
                  <div style={{ flex: 1 }}>
                    <div className="em-header-title">Edit Artist Profile</div>
                    <div className="em-header-sub">Changes go live instantly on your profile</div>
                  </div>
                  <button className="em-close" onClick={closeModal}><X size={16} /></button>
                </div>

                {/* Tabs */}
                <div className="em-tabs">
                  {([
                    { key: 'basic' as const,     icon: '👤', label: 'Basic Info'    },
                    { key: 'skills' as const,    icon: '🎯', label: 'Skills & Price' },
                    { key: 'portfolio' as const, icon: '🖼️', label: 'Portfolio'      },
                  ]).map(t => (
                    <button key={t.key} className={`em-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Success Screen ── */}
              {saveSuccess ? (
                <div className="em-success">
                  <div className="em-success-icon"><CheckCircle2 size={36} style={{ color: '#16a34a' }} /></div>
                  <div className="em-success-emoji">🎉</div>
                  <div className="em-success-title">Profile Updated!</div>
                  <p className="em-success-sub">Your artist profile has been saved and is now live for customers to see.</p>
                </div>
              ) : (
                <>
                  {/* ── Body ── */}
                  <div className="em-body">

                    {/* ══ TAB: BASIC INFO ══ */}
                    {tab === 'basic' && <>

                      {/* Name */}
                      <div className="em-section-lbl"><User size={11} /> Identity</div>
                      <div className="em-group">
                        <div className="em-field">
                          <label className="em-lbl">Artist Display Name *</label>
                          <div className="em-row">
                            <User size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                            <input className="em-input" value={eName} onChange={e => setEName(e.target.value)} placeholder="Your artist name" maxLength={60} />
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="em-section-lbl"><Palette size={11} /> About You</div>
                      <div className="em-group">
                        <div className="em-field">
                          <label className="em-lbl">
                            Bio / About
                            <span style={{ float: 'right', textTransform: 'none', letterSpacing: 0, fontWeight: 500, color: eBio.length > 270 ? '#f59e0b' : '#cbd5e1' }}>{eBio.length}/300</span>
                          </label>
                          <textarea className="em-textarea" rows={4} value={eBio} onChange={e => setEBio(e.target.value.slice(0, 300))} placeholder="Describe your art style, experience, what makes your work unique…" />
                        </div>
                      </div>

                      {/* Location */}
                      <div className="em-section-lbl"><MapPin size={11} /> Location</div>
                      <div className="em-group">
                        <div className="em-field">
                          <label className="em-lbl">State</label>
                          <div className="em-row">
                            <MapPin size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                            <select className="em-select" value={eState} onChange={e => handleStateChange(e.target.value)}>
                              <option value="">Select state…</option>
                              {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                        {eState && (
                          <div className="em-field">
                            <label className="em-lbl">
                              City
                              {cityLoading && <Loader2 size={11} style={{ marginLeft: 6, display: 'inline', animation: 'map-spin 0.8s linear infinite' }} />}
                              {eCity && !cityLoading && <CheckCircle2 size={11} style={{ marginLeft: 6, display: 'inline', color: '#22c55e' }} />}
                            </label>
                            <div className="em-row">
                              <Search size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                              <input className="em-input" value={citySearch} onChange={e => { setCitySearch(e.target.value); setECity('') }} placeholder="Search city…" />
                            </div>
                            {citySearch && !eCity && filteredCities.length > 0 && (
                              <div className="em-city-drop">
                                {filteredCities.slice(0, 25).map(c => (
                                  <button key={c} className={`em-city-item${eCity === c ? ' picked' : ''}`} onClick={() => { setECity(c); setCitySearch(c) }}>
                                    <MapPin size={11} style={{ opacity: 0.4 }} /> {c}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Availability */}
                      <div className="em-section-lbl">Availability</div>
                      <div className="em-avail-grid">
                        <button className={`em-avail-card${eAvail === 'available' ? ' green-on' : ' off-state'}`} onClick={() => setEAvail('available')}>
                          <div className="em-avail-icon" style={{ background: eAvail === 'available' ? 'rgba(34,197,94,0.15)' : '#f1f5f9' }}>🟢</div>
                          <div className="em-avail-lbl" style={{ color: eAvail === 'available' ? '#15803d' : '#94a3b8' }}>Available</div>
                          <div className="em-avail-desc">Open for new orders</div>
                        </button>
                        <button className={`em-avail-card${eAvail === 'busy' ? ' red-on' : ' off-state'}`} onClick={() => setEAvail('busy')}>
                          <div className="em-avail-icon" style={{ background: eAvail === 'busy' ? 'rgba(239,68,68,0.1)' : '#f1f5f9' }}>🔴</div>
                          <div className="em-avail-lbl" style={{ color: eAvail === 'busy' ? '#b91c1c' : '#94a3b8' }}>Busy</div>
                          <div className="em-avail-desc">Not taking orders now</div>
                        </button>
                      </div>

                    </>}

                    {/* ══ TAB: SKILLS & PRICE ══ */}
                    {tab === 'skills' && <>

                      <div className="em-section-lbl"><Award size={11} /> Skills & Expertise</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Tap to select / deselect</span>
                        {eSkills.length > 0 && (
                          <span style={{ padding: '2px 9px', borderRadius: 99, background: 'linear-gradient(135deg,#d97706,#ea580c)', color: '#fff', fontSize: '0.62rem', fontWeight: 800 }}>
                            {eSkills.length} selected
                          </span>
                        )}
                      </div>
                      <div className="em-skills-wrap">
                        {SKILLS.map(skill => (
                          <button key={skill} className={`em-skill${eSkills.includes(skill) ? ' on' : ' off'}`}
                            onClick={() => setESkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])}>
                            {skill}
                          </button>
                        ))}
                      </div>

                      <div className="em-section-lbl" style={{ marginTop: 8 }}>💰 Starting Price</div>
                      <div className="em-group">
                        <div className="em-field">
                          <label className="em-lbl">Minimum Price for a Custom Piece (₹)</label>
                          <div className="em-row">
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#d97706', flexShrink: 0 }}>₹</span>
                            <input className="em-input" type="number" value={ePrice} onChange={e => setEPrice(e.target.value)} placeholder="500" min={0} />
                            {ePrice && parseInt(ePrice) > 0 && (
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                → up to ₹{(parseInt(ePrice) * 5).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                    </>}

                    {/* ══ TAB: PORTFOLIO ══ */}
                    {tab === 'portfolio' && <>

                      <div className="em-section-lbl"><Image size={11} /> Portfolio Images</div>
                      <div className="em-port-count">{ePortfolio.length}/10 images</div>

                      {/* Image grid */}
                      {ePortfolio.length > 0 && (
                        <div className="em-port-grid">
                          {ePortfolio.map((item, i) => (
                            <div key={item.id || i} className="em-port-tile">
                              {item.imageUrl
                                ? <img src={item.imageUrl} alt={item.title} />
                                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#fef3c7,#fed7aa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image size={20} style={{ color: '#d97706' }} /></div>
                              }
                              <button className="em-port-del" onClick={() => setEPortfolio(prev => prev.filter((_, idx) => idx !== i))} title="Remove image">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Hidden file input */}
                      <input ref={portRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple style={{ display: 'none' }}
                        onChange={e => e.target.files && processFiles(e.target.files)} />

                      {/* Drop zone */}
                      {ePortfolio.length < 10 && (
                        <div
                          className={`em-port-drop${portDragging ? ' drag' : ''}`}
                          onClick={() => !portUploading && portRef.current?.click()}
                          onDragOver={e => { e.preventDefault(); setPortDragging(true) }}
                          onDragLeave={() => setPortDragging(false)}
                          onDrop={e => { e.preventDefault(); setPortDragging(false); e.dataTransfer.files?.length && processFiles(e.dataTransfer.files) }}
                        >
                          {portUploading ? (
                            <div className="em-port-processing">
                              <div className="em-port-spinner" /> Processing images…
                            </div>
                          ) : (
                            <div className="em-port-drop-inner">
                              <div className="em-port-drop-icon"><Upload size={18} /></div>
                              <div className="em-port-drop-text">{ePortfolio.length === 0 ? 'Upload your portfolio images' : 'Add more images'}</div>
                              <div className="em-port-drop-hint">Click or drag & drop · JPG, PNG · max 3MB each</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upload errors */}
                      {portErrors.map((err, i) => (
                        <div key={i} className="em-port-err"><AlertCircle size={11} /> {err}</div>
                      ))}

                      {ePortfolio.length === 0 && !portUploading && (
                        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem', padding: '8px 0' }}>
                          No images yet — upload your best work to attract more customers!
                        </p>
                      )}

                    </>}

                  </div>

                  {/* Footer */}
                  <div className="em-footer">
                    <button className="em-cancel" onClick={closeModal}>Cancel</button>
                    <button className="em-save" onClick={handleSave} disabled={saving || !eName.trim() || portUploading}>
                      {saving
                        ? <><Loader2 size={16} style={{ animation: 'map-spin 0.8s linear infinite' }} /> Saving…</>
                        : <><Save size={16} /> Save Changes</>
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            PROFILE VIEW
        ══════════════════════════════════ */}

        {/* Hero */}
        <div className="map-hero">
          <div className="map-hero-pattern" />
          <div className="map-topbar">
            <button className="map-back-btn" onClick={() => navigate(-1)}><ArrowLeft style={{ width: 18, height: 18 }} /></button>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>My Artist Profile</span>
            <button className="map-edit-hero-btn" onClick={() => openModal('basic')} disabled={openLoading}>
              {openLoading
                ? <><Loader2 size={13} style={{ animation: 'map-spin 0.8s linear infinite' }} /> Loading…</>
                : <><Edit style={{ width: 14, height: 14 }} /> Edit Profile</>
              }
            </button>
          </div>

          <div className="map-profile-row">
            <div className="map-avatar">
              <div className="map-avatar-ring" /><div className="map-avatar-ring2" />
              {artist.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div className="map-name">{artist.name}</div>
              {artist.verified && (
                <div className="map-verified-badge"><CheckCircle style={{ width: 11, height: 11 }} /> Verified Artist</div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {artist.location && <span className="map-info-chip"><MapPin style={{ width: 12, height: 12 }} /> {artist.location}</span>}
                {artist.responseTime && <span className="map-info-chip"><Clock style={{ width: 11, height: 11 }} /> Responds {artist.responseTime}</span>}
              </div>
            </div>
          </div>
          <div className="map-hero-curve" />
        </div>

        {/* Stats */}
        <div className="map-stats-bar">
          {[
            { icon: <TrendingUp style={{ width:13,height:13,color:'#d97706' }} />, val: artist.completedOrders||0, lbl:'Orders',  amber:false },
            { icon: <Star style={{ width:13,height:13,fill:'#d97706',color:'#d97706' }} />, val: avgRating, lbl:'Rating', amber:true  },
            { icon: <Award style={{ width:13,height:13,color:'#d97706' }} />, val: artist.reviewCount??reviews.length, lbl:'Reviews', amber:false },
            { icon: <Image style={{ width:13,height:13,color:'#d97706' }} />, val: artist.portfolio?.length||0, lbl:'Works',   amber:false },
          ].map((s, i) => (
            <div key={i} className="map-stat" style={{ animationDelay:`${i*0.07}s` }}>
              <div className="map-stat-icon">{s.icon}</div>
              <div className={`map-stat-val${s.amber?' amber':''}`}>{s.val}</div>
              <div className="map-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="map-body">

          {/* About */}
          <div className="map-card" style={{ animationDelay:'0.08s' }}>
            <div className="map-card-accent" />
            <div className="map-card-header">
              <div className="map-card-title"><Palette style={{ width:13,height:13 }} /> About Me</div>
              <button className="map-card-edit-btn" onClick={() => openModal('basic')}><Edit size={12} /> Edit</button>
            </div>
            {artist.bio
              ? <p className="map-bio">{artist.bio}</p>
              : <p style={{ color:'#94a3b8', fontSize:'0.85rem', fontStyle:'italic' }}>No bio yet — <button onClick={() => openModal('basic')} style={{ color:'#d97706', background:'none', border:'none', cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>add one</button></p>
            }
          </div>

          {/* Skills */}
          <div className="map-card" style={{ animationDelay:'0.12s' }}>
            <div className="map-card-accent" />
            <div className="map-card-header">
              <div className="map-card-title"><Award style={{ width:13,height:13 }} /> Skills & Expertise</div>
              <button className="map-card-edit-btn" onClick={() => openModal('skills')}><Edit size={12} /> Edit</button>
            </div>
            {artist.skills?.length > 0
              ? <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>{artist.skills.map((s,i) => <span key={i} className="map-skill-pill">{s}</span>)}</div>
              : <p style={{ color:'#94a3b8', fontSize:'0.85rem', fontStyle:'italic' }}>No skills added yet.</p>
            }
          </div>

          {/* Pricing + Availability */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="map-pricing-card" onClick={() => openModal('skills')}>
              <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#b45309', marginBottom:6 }}>Starting at</div>
              <div className="map-price-val">₹{(artist.priceRange?.min||0).toLocaleString('en-IN')}</div>
              {artist.priceRange?.max && <div style={{ fontSize:'0.75rem', color:'#a16207', marginTop:4 }}>Up to ₹{artist.priceRange.max.toLocaleString('en-IN')}</div>}
              <div style={{ fontSize:'0.65rem', color:'#b45309', marginTop:10, fontWeight:600, display:'flex', alignItems:'center', gap:3 }}><Edit size={10} /> Tap to edit</div>
            </div>
            <div className="map-avail-card" onClick={() => openModal('basic')}>
              <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#94a3b8', marginBottom:10 }}>Availability</div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div className={`map-dot ${artist.availability==='available'?'on':'off'}`} />
                <span style={{ fontSize:'0.9rem', fontWeight:800, color:artist.availability==='available'?'#16a34a':'#dc2626' }}>
                  {artist.availability==='available'?'Available':'Busy'}
                </span>
              </div>
              {artist.joinedDate && <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginTop:8 }}>Member since {artist.joinedDate}</div>}
              <div style={{ fontSize:'0.65rem', color:'#94a3b8', marginTop:8, fontWeight:600, display:'flex', alignItems:'center', gap:3 }}><Edit size={10} /> Tap to edit</div>
            </div>
          </div>

          {/* Portfolio */}
          <div className="map-card" style={{ animationDelay:'0.2s' }}>
            <div className="map-card-accent" />
            <div className="map-card-header">
              <div className="map-card-title"><Image style={{ width:13,height:13 }} /> Portfolio {artist.portfolio?.length > 0 ? `(${artist.portfolio.length})` : ''}</div>
              <button className="map-card-edit-btn" onClick={() => openModal('portfolio')}><Plus size={12} /> Add / Edit</button>
            </div>

            {artist.portfolio?.length > 0 ? (
              <div className="map-portfolio-grid">
                {artist.portfolio.map((item, i) => (
                  <div key={item.id||i} className="map-portfolio-tile" onClick={() => item.imageUrl && setLightbox(item.imageUrl)}>
                    {item.imageUrl
                      ? <><img src={item.imageUrl} alt={item.title||`Artwork ${i+1}`} /><div className="map-tile-overlay"><div><div style={{ color:'#fff', fontSize:'0.78rem', fontWeight:700 }}>{item.title}</div><div style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.68rem' }}>{item.category}</div></div></div></>
                      : <div style={{ width:'100%',height:'100%',background:'linear-gradient(135deg,#fef3c7,#fed7aa)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6 }}><span style={{ fontSize:'2rem' }}>🎨</span><p style={{ fontSize:'0.72rem',fontWeight:700,color:'#92400e',textAlign:'center',padding:'0 8px' }}>{item.title}</p></div>
                    }
                  </div>
                ))}
              </div>
            ) : (
              <div className="map-empty">
                <span className="map-empty-icon">🖼️</span>
                <p style={{ fontWeight:700, color:'#334155', marginBottom:4 }}>No Portfolio Yet</p>
                <p className="map-empty-text">Add your artworks to showcase your talent</p>
                <button onClick={() => openModal('portfolio')} style={{ marginTop:14, padding:'10px 22px', background:'linear-gradient(135deg,#d97706,#ea580c)', color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:'0.85rem', cursor:'pointer', boxShadow:'0 4px 12px rgba(217,119,6,0.3)' }}>
                  Add Portfolio Images
                </button>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="map-card" style={{ animationDelay:'0.25s' }}>
            <div className="map-card-accent" />
            <div className="map-card-header">
              <div className="map-card-title"><Star style={{ width:13,height:13 }} /> Customer Reviews</div>
              {reviews.length > 0 && <span style={{ fontSize:'0.7rem', fontWeight:800, color:'#d97706', background:'#fef3c7', border:'1px solid #fde68a', borderRadius:99, padding:'2px 8px' }}>{reviews.length}</span>}
            </div>
            {reviews.length > 0 ? (
              <div>{reviews.map((review, i) => (
                <div key={review.id||i} className="map-review-item" style={{ animationDelay:`${i*0.06}s` }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:6 }}>
                    <div className="map-rev-avatar">{(review.customerName||'C').charAt(0)}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontWeight:700, fontSize:'0.875rem', color:'#1e293b' }}>{review.customerName||'Customer'}</span>
                        <div style={{ display:'flex', gap:2 }}>{[...Array(5)].map((_,j) => <Star key={j} style={{ width:12,height:12, fill:j<review.rating?'#f59e0b':'none', color:j<review.rating?'#f59e0b':'#cbd5e1' }} />)}</div>
                      </div>
                      {review.createdAt && <span style={{ fontSize:'0.7rem', color:'#94a3b8' }}>{review.createdAt}</span>}
                    </div>
                  </div>
                  <p style={{ fontSize:'0.875rem', color:'#475569', lineHeight:1.65, paddingLeft:48 }}>{review.comment}</p>
                </div>
              ))}</div>
            ) : (
              <div className="map-empty">
                <span className="map-empty-icon">⭐</span>
                <p style={{ fontWeight:700, color:'#334155', marginBottom:4 }}>No Reviews Yet</p>
                <p className="map-empty-text">Complete orders to receive reviews from customers</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}