import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, Calendar, IndianRupee, FileText,
  Loader2, MapPin, Clock, AlertCircle, Sparkles,
  Palette, Star, Zap, X, Image, CheckCircle2
} from 'lucide-react';
import { getArtistById, createOrder } from '@/services/firestoreService';
import { validateImage, imageToBase64 } from '@/services/imageService';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/Avatar';
import { type Artist } from '@/types';

/* ─────────────────────────────────────────
   VALIDATION
───────────────────────────────────────── */
const todayStr = () => new Date().toISOString().split('T')[0];

function validate(f: {
  title: string; category: string; description: string;
  budget: string; deadline: string; artistPriceMin: number;
}) {
  const e: Record<string, string> = {};
  if (!f.title.trim()) e.title = 'Title is required';
  else if (f.title.trim().length < 5) e.title = 'At least 5 characters';
  else if (f.title.trim().length > 100) e.title = 'Max 100 characters';

  if (!f.category) e.category = 'Please select a category';

  if (!f.description.trim()) e.description = 'Description is required';
  else if (f.description.trim().length < 20) e.description = 'Write at least 20 characters';
  else if (f.description.trim().length > 1000) e.description = 'Max 1000 characters';

  const n = Number(f.budget);
  if (!f.budget) e.budget = 'Budget is required';
  else if (isNaN(n) || n <= 0) e.budget = 'Enter a valid amount';
  else if (n < 100) e.budget = 'Minimum ₹100';
  else if (f.artistPriceMin > 0 && n < f.artistPriceMin)
    e.budget = `Artist starts at ₹${f.artistPriceMin.toLocaleString('en-IN')}`;
  else if (n > 1000000) e.budget = 'Max ₹10,00,000';

  if (!f.deadline) e.deadline = 'Deadline is required';
  else if (f.deadline <= todayStr()) e.deadline = 'Must be a future date';

  return e;
}

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const styles = `
  @keyframes rq-up   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes rq-in   { from{opacity:0} to{opacity:1} }
  @keyframes rq-pop  { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes rq-shk  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 60%{transform:translateX(4px)} }
  @keyframes rq-flt  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes rq-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes rq-imgIn{ from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }

  /* ── Page ── */
  .rq-page { min-height:100%; background:#f8fafc; }
  .dark .rq-page { background:#030712; }

  .rq-body { padding:1rem; animation:rq-up 0.4s ease both; }
  @media(min-width:1024px){ .rq-body{padding:2rem;} }

  /* ── Back ── */
  .rq-back {
    display:inline-flex; align-items:center; gap:6px;
    background:none; border:none; cursor:pointer;
    color:#64748b; font-size:0.875rem; font-weight:600;
    padding:0; margin-bottom:18px; transition:color 0.2s;
    font-family:inherit;
  }
  .rq-back:hover{ color:#1e293b; }
  .dark .rq-back{ color:#94a3b8; }
  .dark .rq-back:hover{ color:#f1f5f9; }

  /* ── Header ── */
  .rq-page-title { font-size:1.25rem; font-weight:900; color:#1e293b; margin-bottom:4px; }
  .dark .rq-page-title{ color:#f1f5f9; }
  .rq-page-sub { font-size:0.82rem; color:#64748b; margin-bottom:14px; }
  .dark .rq-page-sub{ color:#94a3b8; }

  /* ── Progress ── */
  .rq-prog-wrap { height:4px; background:#f1f5f9; border-radius:99px; overflow:hidden; margin-bottom:22px; }
  .dark .rq-prog-wrap{ background:#1e293b; }
  .rq-prog-bar {
    height:100%; background:linear-gradient(90deg,#d97706,#ea580c);
    border-radius:99px; transition:width 0.4s ease;
  }

  /* ── Layout ── */
  .rq-layout { display:grid; grid-template-columns:1fr; gap:20px; align-items:start; }
  @media(min-width:768px){ .rq-layout{ grid-template-columns:260px 1fr; } }
  @media(min-width:1024px){ .rq-layout{ grid-template-columns:280px 1fr; gap:24px; } }

  /* ── Artist Card ── */
  .rq-ac {
    background:#fff; border-radius:22px;
    border:1.5px solid #f1f5f9;
    box-shadow:0 2px 10px rgba(0,0,0,0.04);
    overflow:hidden;
    animation:rq-up 0.4s 0.05s ease both;
  }
  .dark .rq-ac{ background:#0f172a; border-color:#1e293b; box-shadow:0 2px 10px rgba(0,0,0,0.25); }
  @media(min-width:768px){ .rq-ac-sticky{ position:sticky; top:16px; } }

  .rq-ac-hero {
    height:76px; position:relative;
    background:linear-gradient(135deg,#7c2d12 0%,#9a3412 25%,#c2410c 60%,#d97706 100%);
  }
  .rq-ac-hero::before {
    content:''; position:absolute; inset:0; pointer-events:none;
    background-image:
      radial-gradient(circle at 15% 50%, rgba(255,255,255,0.08) 0%, transparent 50%),
      repeating-linear-gradient(45deg,transparent,transparent 22px,rgba(255,255,255,0.025) 22px,rgba(255,255,255,0.025) 23px);
  }
  .rq-ac-body{ padding:0 16px 16px; }

  .rq-ac-av-wrap { margin-top: 0px; margin-bottom:10px; display:inline-block; }
  .rq-ac-av-ring {
    width:56px; height:56px; border-radius:40px;
    border:3px solid #fff;
    box-shadow:0 4px 12px rgba(0,0,0,0.1);
    overflow:hidden; background:#fff;
    display:flex; align-items:center; justify-content:center;
  }
  .dark .rq-ac-av-ring{ border-color:#0f172a; }

  .rq-ac-name { font-size:0.95rem; font-weight:900; color:#1e293b; line-height:1.25; }
  .dark .rq-ac-name{ color:#f1f5f9; }
  .rq-ac-loc  { font-size:0.75rem; color:#94a3b8; margin-top:2px; display:flex; align-items:center; gap:3px; }

  .rq-divider { height:1px; background:#f1f5f9; margin:12px 0; }
  .dark .rq-divider{ background:#1e293b; }

  .rq-meta { display:flex; align-items:center; justify-content:space-between; font-size:0.78rem; padding:3px 0; }
  .rq-meta-lbl { color:#94a3b8; font-weight:500; display:flex; align-items:center; gap:4px; }
  .rq-meta-val { color:#1e293b; font-weight:700; }
  .dark .rq-meta-val{ color:#f1f5f9; }

  .rq-price-band {
    margin-top:12px;
    background:linear-gradient(135deg,#fffbeb,#fef3c7);
    border:1.5px solid #fde68a; border-radius:14px; padding:11px 14px;
  }
  .dark .rq-price-band{ background:linear-gradient(135deg,#1c0a00,#251000); border-color:#78350f; }
  .rq-price-lbl { font-size:0.65rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:#b45309; margin-bottom:3px; }
  .dark .rq-price-lbl{ color:#fcd34d; }
  .rq-price-val { font-size:1rem; font-weight:900; color:#d97706; }

  .rq-skills { display:flex; flex-wrap:wrap; gap:5px; margin-top:12px; }
  .rq-skill {
    padding:3px 9px; border-radius:99px;
    background:#f1f5f9; border:1px solid #e2e8f0;
    font-size:0.68rem; font-weight:600; color:#475569;
  }
  .dark .rq-skill{ background:#1e293b; border-color:#334155; color:#94a3b8; }

  /* ── Form side ── */
  .rq-form-side { display:flex; flex-direction:column; gap:16px; animation:rq-up 0.4s 0.08s ease both; }

  /* Card = same as .pp-card */
  .rq-card {
    background:#fff; border-radius:18px;
    border:1.5px solid #f1f5f9;
    box-shadow:0 2px 10px rgba(0,0,0,0.04);
    padding:18px;
  }
  .dark .rq-card{ background:#0f172a; border-color:#1e293b; box-shadow:0 2px 10px rgba(0,0,0,0.25); }

  /* Card heading = same as .pp-card-header */
  .rq-card-hd {
    font-size:0.7rem; font-weight:800; text-transform:uppercase;
    letter-spacing:0.1em; color:#d97706;
    display:flex; align-items:center; gap:6px; margin-bottom:16px;
  }
  .rq-card-hd::after { content:''; flex:1; height:1px; background:linear-gradient(to right,#fde68a,transparent); }
  .dark .rq-card-hd::after{ background:linear-gradient(to right,#78350f,transparent); }

  .rq-field { margin-bottom:14px; }
  .rq-field:last-child{ margin-bottom:0; }

  .rq-label {
    display:flex; align-items:center; gap:5px;
    font-size:0.78rem; font-weight:700; color:#475569; margin-bottom:7px;
    font-family:inherit;
  }
  .dark .rq-label{ color:#94a3b8; }

  /* Input = same as .input-base */
  .rq-input {
    width:100%; padding:12px 16px;
    background:#fff; border:1.5px solid #e2e8f0;
    border-radius:13px; font-family:inherit;
    font-size:0.875rem; color:#1e293b;
    outline:none; transition:border-color 0.2s,box-shadow 0.2s;
    box-sizing:border-box;
  }
  .dark .rq-input{ background:#0f172a; border-color:#1e293b; color:#f1f5f9; }
  .rq-input::placeholder{ color:#94a3b8; }
  .rq-input:focus{ border-color:#d97706; box-shadow:0 0 0 3px rgba(217,119,6,0.15); }
  .rq-input.err{
    border-color:#ef4444; background:#fff5f5;
    box-shadow:0 0 0 3px rgba(239,68,68,0.08);
    animation:rq-shk 0.3s ease;
  }
  .dark .rq-input.err{ background:rgba(239,68,68,0.06); }
  .rq-textarea{ resize:none; min-height:108px; line-height:1.6; }

  .rq-char{ text-align:right; font-size:0.67rem; font-weight:600; color:#cbd5e1; margin-top:4px; transition:color 0.2s; }
  .rq-char.warn{ color:#f59e0b; }
  .rq-char.over{ color:#ef4444; }

  .rq-err-msg{
    display:flex; align-items:center; gap:4px;
    font-size:0.72rem; font-weight:600; color:#ef4444;
    margin-top:5px; animation:rq-in 0.2s ease;
  }

  /* Category chips */
  .rq-cats{ display:flex; flex-wrap:wrap; gap:7px; }
  .rq-cat{
    display:flex; align-items:center; gap:5px;
    padding:7px 13px; border-radius:12px;
    border:1.5px solid #e2e8f0; background:#fff;
    font-size:0.79rem; font-weight:600; color:#475569;
    cursor:pointer; transition:all 0.18s; font-family:inherit;
  }
  .dark .rq-cat{ background:#0f172a; border-color:#1e293b; color:#94a3b8; }
  .rq-cat:hover{ border-color:#fde68a; color:#92400e; background:#fffbeb; }
  .dark .rq-cat:hover{ border-color:#78350f; color:#fbbf24; background:rgba(217,119,6,0.06); }
  .rq-cat.on{
    background:linear-gradient(135deg,#d97706,#ea580c);
    border-color:transparent; color:#fff;
    box-shadow:0 3px 10px rgba(217,119,6,0.3);
  }
  .rq-cat.cat-err{ border-color:#ef4444 !important; }

  /* Budget prefix */
  .rq-budget-wrap{ position:relative; display:flex; align-items:center; }
  .rq-budget-pfx{
    position:absolute; left:14px;
    font-size:0.9rem; font-weight:800; color:#d97706; pointer-events:none;
  }
  .rq-budget-wrap .rq-input{ padding-left:28px; }

  /* Two col */
  .rq-two{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:480px){ .rq-two{ grid-template-columns:1fr; } }

  /* ── IMAGE UPLOAD ZONE ── */
  .rq-upload-zone{
    border:2px dashed #e2e8f0; border-radius:14px;
    background:#f8fafc; transition:all 0.2s; cursor:pointer;
    position:relative; overflow:hidden;
  }
  .dark .rq-upload-zone{ background:#0c1018; border-color:#1e293b; }
  .rq-upload-zone:hover{ border-color:#d97706; background:#fffbeb; }
  .dark .rq-upload-zone:hover{ border-color:#92400e; background:rgba(217,119,6,0.04); }
  .rq-upload-zone.drag{ border-color:#d97706; background:#fffbeb; transform:scale(1.01); }
  .dark .rq-upload-zone.drag{ background:rgba(217,119,6,0.06); }
  .rq-upload-zone.has-imgs{ border-style:solid; border-color:#fde68a; background:#fffbeb; }
  .dark .rq-upload-zone.has-imgs{ border-color:#78350f; background:rgba(120,53,15,0.1); }

  .rq-upload-inner{ padding:22px 16px; text-align:center; pointer-events:none; }
  .rq-upload-icon{
    width:44px; height:44px; border-radius:12px;
    background:linear-gradient(135deg,#fef3c7,#fde68a);
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 8px; color:#d97706; transition:transform 0.2s;
  }
  .rq-upload-zone:hover .rq-upload-icon,
  .rq-upload-zone.drag .rq-upload-icon{ transform:scale(1.1); }
  .rq-upload-text{ font-size:0.82rem; font-weight:600; color:#64748b; }
  .dark .rq-upload-text{ color:#94a3b8; }
  .rq-upload-hint{ font-size:0.7rem; color:#94a3b8; margin-top:3px; }

  /* Processing state */
  .rq-upload-processing{
    display:flex; align-items:center; justify-content:center; gap:10px;
    padding:22px 16px; color:#d97706; font-size:0.82rem; font-weight:600;
  }
  .rq-upload-spinner{
    width:20px; height:20px; border-radius:50%;
    border:2px solid #fde68a; border-top-color:#d97706;
    animation:rq-spin 0.7s linear infinite; flex-shrink:0;
  }

  /* Preview grid */
  .rq-img-grid{ padding:12px; display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  @media(min-width:400px){ .rq-img-grid{ grid-template-columns:repeat(4,1fr); } }

  .rq-img-thumb{
    position:relative; aspect-ratio:1; border-radius:10px; overflow:hidden;
    background:#e2e8f0; animation:rq-imgIn 0.25s ease both;
    border:1.5px solid #fde68a;
  }
  .dark .rq-img-thumb{ background:#1e293b; border-color:#78350f; }
  .rq-img-thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
  .rq-img-del{
    position:absolute; top:4px; right:4px;
    width:22px; height:22px; border-radius:50%;
    background:rgba(0,0,0,0.65); border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    color:#fff; transition:background 0.15s; padding:0;
    opacity:0; transition:opacity 0.15s;
  }
  .rq-img-thumb:hover .rq-img-del{ opacity:1; }
  .rq-img-del:hover{ background:rgba(239,68,68,0.9); }

  /* Add more tile */
  .rq-img-add{
    aspect-ratio:1; border-radius:10px;
    border:2px dashed #e2e8f0; background:#f8fafc;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    cursor:pointer; transition:all 0.18s; gap:4px;
  }
  .dark .rq-img-add{ background:#0c1018; border-color:#1e293b; }
  .rq-img-add:hover{ border-color:#d97706; background:#fffbeb; }
  .dark .rq-img-add:hover{ background:rgba(217,119,6,0.06); border-color:#92400e; }
  .rq-img-add span{ font-size:0.6rem; font-weight:600; color:#94a3b8; }

  /* Upload footer bar */
  .rq-upload-footer{
    padding:8px 12px;
    border-top:1px solid #fde68a;
    display:flex; align-items:center; justify-content:space-between;
    font-size:0.7rem; color:#b45309; font-weight:600;
  }
  .dark .rq-upload-footer{ border-color:#78350f; color:#c2a46a; }

  /* Error pills for images */
  .rq-img-errors{
    margin-top:8px; display:flex; flex-direction:column; gap:4px;
  }
  .rq-img-err-pill{
    display:flex; align-items:center; gap:5px;
    padding:5px 10px; border-radius:9px;
    background:#fff5f5; border:1px solid #fecaca;
    font-size:0.7rem; color:#dc2626; font-weight:600;
    animation:rq-in 0.2s ease;
  }
  .dark .rq-img-err-pill{ background:rgba(239,68,68,0.06); border-color:rgba(239,68,68,0.2); color:#f87171; }

  /* Tip */
  .rq-tip{
    background:#fffbeb; border:1px solid #fde68a;
    border-radius:14px; padding:12px 14px;
    font-size:0.8rem; color:#92400e; line-height:1.5;
    display:flex; gap:8px; align-items:flex-start;
  }
  .dark .rq-tip{ background:rgba(120,53,15,0.15); border-color:#78350f; color:#c2a46a; }

  /* Banner */
  .rq-banner{
    background:#fff5f5; border:1.5px solid #fecaca;
    border-radius:13px; padding:11px 14px;
    display:flex; align-items:flex-start; gap:8px;
    font-size:0.78rem; color:#dc2626; font-weight:600; line-height:1.4;
    animation:rq-in 0.25s ease;
  }
  .dark .rq-banner{ background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.25); color:#f87171; }

  /* Submit = .btn-primary */
  .rq-submit{
    width:100%; padding:14px;
    background:linear-gradient(135deg,#d97706,#ea580c);
    color:#fff; border:none; border-radius:13px;
    font-size:0.875rem; font-weight:800; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    box-shadow:0 4px 14px rgba(217,119,6,0.35);
    transition:all 0.25s; letter-spacing:0.01em; font-family:inherit;
  }
  .rq-submit:hover:not(:disabled){ transform:translateY(-2px); box-shadow:0 8px 22px rgba(217,119,6,0.48); }
  .rq-submit:disabled{ opacity:0.55; cursor:not-allowed; transform:none; box-shadow:none; }

  /* Loading */
  .rq-loading{ display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:50vh; gap:12px; }
  .rq-loading-lbl{ font-size:0.85rem; color:#94a3b8; }

  /* Success */
  .rq-success{ min-height:60vh; display:flex; align-items:center; justify-content:center; padding:40px 20px; animation:rq-in 0.35s ease both; }
  .rq-success-inner{ max-width:400px; width:100%; text-align:center; animation:rq-pop 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  .rq-success-icon{
    width:84px; height:84px; border-radius:26px;
    background:linear-gradient(135deg,#16a34a,#22c55e);
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 20px; font-size:2.2rem;
    box-shadow:0 10px 28px rgba(34,197,94,0.3);
    animation:rq-flt 3s ease-in-out infinite;
  }
  .rq-success-title{ font-size:1.4rem; font-weight:900; color:#1e293b; margin-bottom:8px; }
  .dark .rq-success-title{ color:#f1f5f9; }
  .rq-success-msg{ font-size:0.84rem; color:#64748b; line-height:1.65; margin-bottom:20px; }
  .dark .rq-success-msg{ color:#94a3b8; }

  .rq-success-imgs{
    display:grid; grid-template-columns:repeat(3,1fr); gap:6px;
    margin-bottom:16px;
  }
  .rq-success-imgs img{
    width:100%; aspect-ratio:1; object-fit:cover;
    border-radius:10px; border:1.5px solid #f1f5f9;
    animation:rq-imgIn 0.3s ease both;
  }
  .dark .rq-success-imgs img{ border-color:#1e293b; }

  .rq-ss{
    background:#fff; border:1.5px solid #f1f5f9; border-radius:16px;
    padding:14px 16px; margin-bottom:18px; text-align:left;
    box-shadow:0 2px 8px rgba(0,0,0,0.04);
  }
  .dark .rq-ss{ background:#0f172a; border-color:#1e293b; }
  .rq-ss-row{
    display:flex; align-items:center; justify-content:space-between;
    padding:7px 0; border-bottom:1px solid #f8fafc; font-size:0.78rem;
  }
  .dark .rq-ss-row{ border-color:#1e293b; }
  .rq-ss-row:last-child{ border-bottom:none; }
  .rq-ss-l{ color:#94a3b8; font-weight:500; }
  .rq-ss-v{ color:#1e293b; font-weight:800; }
  .dark .rq-ss-v{ color:#f1f5f9; }

  .rq-success-btns{ display:flex; flex-direction:column; gap:9px; }
  .rq-btn-p{
    width:100%; padding:13px;
    background:linear-gradient(135deg,#d97706,#ea580c);
    color:#fff; border:none; border-radius:13px;
    font-size:0.875rem; font-weight:800; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    box-shadow:0 4px 14px rgba(217,119,6,0.35); transition:all 0.25s;
    font-family:inherit;
  }
  .rq-btn-p:hover{ transform:translateY(-2px); box-shadow:0 8px 22px rgba(217,119,6,0.48); }
  .rq-btn-s{
    width:100%; padding:12px;
    background:#fff; border:1.5px solid #e2e8f0;
    color:#475569; border-radius:13px;
    font-size:0.875rem; font-weight:700; cursor:pointer;
    transition:all 0.2s; font-family:inherit;
  }
  .dark .rq-btn-s{ background:#0f172a; border-color:#1e293b; color:#94a3b8; }
  .rq-btn-s:hover{ background:#fffbeb; border-color:#fde68a; color:#92400e; }
  .dark .rq-btn-s:hover{ background:#1c0a00; border-color:#78350f; color:#fcd34d; }
`;

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export function RequestPage() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { currentUserId, currentUserName, categories } = useApp();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  // Validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBanner, setShowBanner] = useState(false);

  // Images
  const [images, setImages] = useState<{ file: File; preview: string; base64: string }[]>([]);
  const [imgProcessing, setImgProcessing] = useState(false);
  const [imgErrors, setImgErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!artistId) return;
    setLoading(true);
    getArtistById(artistId)
      .then(data => setArtist(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [artistId]);

  const minDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const runValidate = useCallback((patch?: Record<string, string>) => {
    const f = {
      title, category, description, budget, deadline,
      artistPriceMin: artist?.priceRange?.min ?? 0,
      ...patch,
    };
    const e = validate(f);
    setErrors(e);
    return e;
  }, [title, category, description, budget, deadline, artist]);

  const touch = (field: string) => setTouched(p => ({ ...p, [field]: true }));

  // Progress count
  const filled = [
    title.trim().length >= 5,
    !!category,
    description.trim().length >= 20,
    Number(budget) >= 100,
    !!deadline && deadline > todayStr(),
  ].filter(Boolean).length;

  /* ── Process dropped / selected files ── */
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const MAX_IMAGES = 5;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const toProcess = arr.slice(0, remaining);

    setImgProcessing(true);
    setImgErrors([]);
    const newImgErrors: string[] = [];
    const newImages: { file: File; preview: string; base64: string }[] = [];

    for (const file of toProcess) {
      const v = validateImage(file);
      if (!v.valid) { newImgErrors.push(`${file.name}: ${v.error}`); continue; }
      try {
        const base64 = await imageToBase64(file);
        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview, base64 });
      } catch {
        newImgErrors.push(`${file.name}: Failed to process`);
      }
    }

    if (newImgErrors.length) setImgErrors(newImgErrors);
    setImages(prev => [...prev, ...newImages]);
    setImgProcessing(false);
  }, [images.length]);

  const removeImage = (idx: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, category: true, description: true, budget: true, deadline: true });
    const errs = runValidate();
    if (Object.keys(errs).length > 0) {
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 4000);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await createOrder({
        customerId: currentUserId,
        customerName: currentUserName,
        artistId: artist!.id,
        artistName: artist!.name,
        title: title.trim(),
        description: description.trim(),
        referenceImages: images.map(i => i.base64),
        budget: Number(budget),
        deadline,
        category,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('[RequestPage] Order creation failed:', err);
      setSubmitError(err?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="rq-page">
        <style>{styles}</style>
        <div className="rq-loading">
          <Loader2 size={30} style={{ color: '#d97706', animation: 'rq-spin 0.8s linear infinite' }} />
          <span className="rq-loading-lbl">Loading artist details…</span>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!artist) {
    return (
      <div className="rq-page">
        <style>{styles}</style>
        <div className="rq-loading">
          <span style={{ fontSize: '2rem' }}>😶</span>
          <span className="rq-loading-lbl">Artist not found</span>
          <button className="rq-btn-s" style={{ width: 'auto', padding: '9px 20px' }} onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (submitted) {
    return (
      <div className="rq-page">
        <style>{styles}</style>
        <div className="rq-body">
          <div className="rq-success">
            <div className="rq-success-inner">
              <div className="rq-success-icon">🎨</div>
              <div className="rq-success-title">Request Sent!</div>
              <p className="rq-success-msg">
                Your custom art request has been sent to{' '}
                <strong style={{ color: '#d97706' }}>{artist.name}</strong>.
                They'll review it and respond soon!
              </p>

              {/* Show uploaded images in success */}
              {images.length > 0 && (
                <div className="rq-success-imgs" style={{ gridTemplateColumns: `repeat(${Math.min(images.length, 3)}, 1fr)` }}>
                  {images.slice(0, 3).map((img, i) => (
                    <img key={i} src={img.preview} alt={`Reference ${i + 1}`} />
                  ))}
                </div>
              )}

              <div className="rq-ss">
                {[
                  { label: 'Artwork', val: title },
                  { label: 'Category', val: category },
                  { label: 'Budget', val: `₹${Number(budget).toLocaleString('en-IN')}` },
                  {
                    label: 'Deadline',
                    val: new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                  },
                  ...(images.length > 0 ? [{ label: 'References', val: `${images.length} image${images.length > 1 ? 's' : ''} attached` }] : []),
                ].map(row => (
                  <div className="rq-ss-row" key={row.label}>
                    <span className="rq-ss-l">{row.label}</span>
                    <span className="rq-ss-v">{row.val}</span>
                  </div>
                ))}
              </div>

              <div className="rq-success-btns">
                <button className="rq-btn-p" onClick={() => navigate('/orders')}>
                  <Zap size={15} /> View My Orders
                </button>
                <button className="rq-btn-s" onClick={() => navigate('/')}>
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  const E = errors;
  const T = touched;

  return (
    <div className="rq-page">
      <style>{styles}</style>
      <div className="rq-body">

        {/* Back */}
        <button className="rq-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} /> Back
        </button>

        {/* Header */}
        <div className="rq-page-title">Request Custom Art</div>
        <div className="rq-page-sub">
          Sending to <strong style={{ color: '#d97706' }}>{artist.name}</strong>
          <span style={{ color: '#cbd5e1', margin: '0 6px' }}>·</span>
          {filled}/5 fields complete
        </div>

        {/* Progress */}
        <div className="rq-prog-wrap">
          <div className="rq-prog-bar" style={{ width: `${(filled / 5) * 100}%` }} />
        </div>

        <div className="rq-layout">

          {/* ── Artist sidebar ── */}
          <div>
            <div className="rq-ac-sticky">
              <div className="rq-ac">
                <div className="rq-ac-hero" />
                <div className="rq-ac-body">
                  <div className="rq-ac-av-wrap">
                    <div className="rq-ac-av-ring">
                      <Avatar name={artist.name} size="lg" />
                    </div>
                  </div>
                  <div className="rq-ac-name">{artist.name}</div>
                  {artist.location && (
                    <div className="rq-ac-loc"><MapPin size={11} /> {artist.location}</div>
                  )}
                  <div className="rq-divider" />
                  <div className="rq-meta">
                    <span className="rq-meta-lbl">
                      <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} /> Rating
                    </span>
                    <span className="rq-meta-val" style={{ color: '#d97706' }}>
                      {artist.rating}
                      <span style={{ color: '#94a3b8', fontWeight: 500 }}> ({artist.reviewCount})</span>
                    </span>
                  </div>
                  <div className="rq-meta">
                    <span className="rq-meta-lbl"><Clock size={12} /> Response</span>
                    <span className="rq-meta-val">{artist.responseTime}</span>
                  </div>
                  <div className="rq-price-band">
                    <div className="rq-price-lbl">Price Range</div>
                    <div className="rq-price-val">
                      ₹{artist.priceRange.min.toLocaleString('en-IN')} – ₹{artist.priceRange.max.toLocaleString('en-IN')}
                    </div>
                  </div>
                  {artist.skills?.length > 0 && (
                    <div className="rq-skills">
                      {artist.skills.slice(0, 5).map(s => (
                        <span key={s} className="rq-skill">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <div className="rq-form-side">

            {showBanner && (
              <div className="rq-banner">
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                Please fix the highlighted fields before submitting.
              </div>
            )}

            {submitError && (
              <div className="rq-banner">
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* ── Card 1: Basic Details ── */}
              <div className="rq-card" style={{ marginBottom: 14 }}>
                <div className="rq-card-hd"><FileText size={11} /> Basic Details</div>

                {/* Title */}
                <div className="rq-field">
                  <label className="rq-label">
                    <FileText size={13} /> Artwork Title
                    <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>
                  </label>
                  <input
                    className={`rq-input${T.title && E.title ? ' err' : ''}`}
                    placeholder="e.g., Family Portrait, Wedding Invitation Design…"
                    value={title}
                    maxLength={110}
                    onChange={ev => { setTitle(ev.target.value); runValidate({ title: ev.target.value }); }}
                    onBlur={() => touch('title')}
                  />
                  <div className={`rq-char${title.length > 85 ? ' warn' : ''}${title.length > 100 ? ' over' : ''}`}>
                    {title.length}/100
                  </div>
                  {T.title && E.title && <div className="rq-err-msg"><AlertCircle size={12} />{E.title}</div>}
                </div>

                {/* Category */}
                <div className="rq-field" style={{ marginBottom: 0 }}>
                  <label className="rq-label">
                    <Palette size={13} /> Category
                    <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>
                  </label>
                  <div className="rq-cats">
                    {(categories.length > 0 ? categories : [
                      { id: '1', name: 'Portrait', icon: '🎨' },
                      { id: '2', name: 'Digital Art', icon: '💻' },
                      { id: '3', name: 'Watercolor', icon: '🌊' },
                      { id: '4', name: 'Sketch', icon: '✏️' },
                      { id: '5', name: 'Calligraphy', icon: '✒️' },
                      { id: '6', name: 'Mandala', icon: '🌸' },
                      { id: '7', name: 'Oil Painting', icon: '🖼️' },
                      { id: '8', name: 'Caricature', icon: '😄' },
                    ]).slice(0, 10).map((cat: any) => (
                      <button
                        key={cat.id} type="button"
                        className={[
                          'rq-cat',
                          category === cat.name ? 'on' : '',
                          T.category && E.category && !category ? 'cat-err' : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => {
                          setCategory(cat.name);
                          runValidate({ category: cat.name });
                          setTouched(p => ({ ...p, category: true }));
                        }}
                      >
                        <span>{cat.icon}</span> {cat.name}
                      </button>
                    ))}
                  </div>
                  {T.category && E.category && (
                    <div className="rq-err-msg" style={{ marginTop: 8 }}>
                      <AlertCircle size={12} />{E.category}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Card 2: Description ── */}
              <div className="rq-card" style={{ marginBottom: 14 }}>
                <div className="rq-card-hd"><Sparkles size={11} /> Artwork Description</div>

                <div className="rq-field">
                  <label className="rq-label">
                    Description <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>
                  </label>
                  <textarea
                    className={`rq-input rq-textarea${T.description && E.description ? ' err' : ''}`}
                    placeholder="Describe your vision — style, size, colors, mood, occasion, special elements…"
                    value={description}
                    maxLength={1050}
                    rows={5}
                    onChange={ev => { setDescription(ev.target.value); runValidate({ description: ev.target.value }); }}
                    onBlur={() => touch('description')}
                  />
                  <div className={`rq-char${description.length > 800 ? ' warn' : ''}${description.length > 980 ? ' over' : ''}`}>
                    {description.length}/1000
                  </div>
                  {T.description && E.description && (
                    <div className="rq-err-msg"><AlertCircle size={12} />{E.description}</div>
                  )}
                </div>

                {/* ── Image Upload ── */}
                <div className="rq-field" style={{ marginBottom: 0 }}>
                  <label className="rq-label">
                    <Image size={13} /> Reference Images
                    <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 4 }}>(optional · max 5)</span>
                  </label>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => e.target.files && processFiles(e.target.files)}
                  />

                  {/* Drop zone */}
                  <div
                    className={[
                      'rq-upload-zone',
                      dragging ? 'drag' : '',
                      images.length > 0 ? 'has-imgs' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => !imgProcessing && fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                  >
                    {imgProcessing ? (
                      <div className="rq-upload-processing">
                        <div className="rq-upload-spinner" />
                        Processing images…
                      </div>
                    ) : images.length === 0 ? (
                      <div className="rq-upload-inner">
                        <div className="rq-upload-icon"><Upload size={19} /></div>
                        <div className="rq-upload-text">Click or drag & drop images here</div>
                        <div className="rq-upload-hint">JPG, PNG, WebP · max 3MB each · up to 5 images</div>
                      </div>
                    ) : (
                      <>
                        <div className="rq-img-grid" onClick={e => e.stopPropagation()}>
                          {images.map((img, i) => (
                            <div key={i} className="rq-img-thumb">
                              <img src={img.preview} alt={`Reference ${i + 1}`} />
                              <button
                                type="button"
                                className="rq-img-del"
                                onClick={e => { e.stopPropagation(); removeImage(i); }}
                                title="Remove image"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                          {images.length < 5 && (
                            <div
                              className="rq-img-add"
                              onClick={() => fileInputRef.current?.click()}
                              role="button"
                              tabIndex={0}
                            >
                              <Upload size={16} style={{ color: '#94a3b8' }} />
                              <span>Add more</span>
                            </div>
                          )}
                        </div>
                        <div className="rq-upload-footer">
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <CheckCircle2 size={13} style={{ color: '#22c55e' }} />
                            {images.length} image{images.length > 1 ? 's' : ''} ready
                          </span>
                          <span style={{ color: '#94a3b8' }}>{images.length}/5</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Image errors */}
                  {imgErrors.length > 0 && (
                    <div className="rq-img-errors">
                      {imgErrors.map((err, i) => (
                        <div key={i} className="rq-img-err-pill">
                          <AlertCircle size={11} /> {err}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Card 3: Budget & Deadline ── */}
              <div className="rq-card" style={{ marginBottom: 14 }}>
                <div className="rq-card-hd"><IndianRupee size={11} /> Budget & Timeline</div>
                <div className="rq-two">
                  {/* Budget */}
                  <div>
                    <label className="rq-label">
                      <IndianRupee size={13} /> Your Budget
                      <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>
                    </label>
                    <div className="rq-budget-wrap">
                      <span className="rq-budget-pfx">₹</span>
                      <input
                        className={`rq-input${T.budget && E.budget ? ' err' : ''}`}
                        type="number"
                        placeholder={String(artist.priceRange.min || 500)}
                        value={budget}
                        min={artist.priceRange.min}
                        onChange={ev => { setBudget(ev.target.value); runValidate({ budget: ev.target.value }); }}
                        onBlur={() => touch('budget')}
                      />
                    </div>
                    {T.budget && E.budget
                      ? <div className="rq-err-msg"><AlertCircle size={12} />{E.budget}</div>
                      : <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 4 }}>
                          Min ₹{artist.priceRange.min.toLocaleString('en-IN')}
                        </div>
                    }
                  </div>
                  {/* Deadline */}
                  <div>
                    <label className="rq-label">
                      <Calendar size={13} /> Deadline
                      <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>
                    </label>
                    <input
                      className={`rq-input${T.deadline && E.deadline ? ' err' : ''}`}
                      type="date"
                      value={deadline}
                      min={minDate}
                      onChange={ev => { setDeadline(ev.target.value); runValidate({ deadline: ev.target.value }); }}
                      onBlur={() => touch('deadline')}
                    />
                    {T.deadline && E.deadline && (
                      <div className="rq-err-msg"><AlertCircle size={12} />{E.deadline}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tip */}
              <div className="rq-tip" style={{ marginBottom: 16 }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
                <span>
                  <strong>Tip:</strong> The more detail you provide — style, dimensions, colors, references — the better{' '}
                  {artist.name.split(' ')[0]} can match your vision.
                </span>
              </div>

              {/* Submit */}
              <button type="submit" className="rq-submit" disabled={submitting || imgProcessing}>
                {submitting
                  ? <><Loader2 size={17} className="animate-spin" /> Submitting…</>
                  : <>🎨 Send Request to {artist.name.split(' ')[0]}</>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}