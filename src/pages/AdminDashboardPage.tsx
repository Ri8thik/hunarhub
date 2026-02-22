import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import {
  Shield, LogOut, Users, Search, Plus, Edit, Trash2, X, Save,
  Loader2, ChevronDown, ChevronUp, Eye, UserCheck, Palette,
  Bell, CheckCheck, Activity, TrendingUp, RefreshCw, Filter,
  Star, MapPin, Phone, Calendar, Briefcase, ChevronRight,
  ArrowUpRight, MoreHorizontal, AlertTriangle
} from 'lucide-react'
import { subscribeToAdminNotifications, markNotificationRead, type NotificationData } from '@/services/firestoreService'

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

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .adm-root {
    min-height: 100vh;
    background: #080c12;
    color: #e2e8f0;
    font-family: 'Space Grotesk', sans-serif;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
  }

  /* Subtle grid background */
  .adm-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  /* Glow orb top-left */
  .adm-root::after {
    content: '';
    position: fixed;
    top: -200px; left: -200px;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── TOPBAR ── */
  .adm-topbar {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,12,18,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 0 24px;
    height: 60px;
    display: flex; align-items: center; gap: 16px;
    flex-shrink: 0;
  }

  .adm-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none;
  }
  .adm-logo-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px rgba(217,119,6,0.4);
  }
  .adm-logo-text {
    font-size: 0.95rem; font-weight: 700;
    color: #f1f5f9; letter-spacing: -0.3px;
  }
  .adm-logo-badge {
    font-size: 0.6rem; font-weight: 700; letter-spacing: 1px;
    color: #d97706; border: 1px solid rgba(217,119,6,0.4);
    padding: 2px 6px; border-radius: 4px;
    background: rgba(217,119,6,0.1);
  }

  .adm-topbar-spacer { flex: 1; }

  .adm-topbar-greeting {
    font-size: 0.78rem; color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }

  .adm-topbar-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: #94a3b8; font-size: 0.8rem; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
    font-family: 'Space Grotesk', sans-serif;
    position: relative;
  }
  .adm-topbar-btn:hover {
    background: rgba(255,255,255,0.08);
    color: #e2e8f0; border-color: rgba(255,255,255,0.15);
  }
  .adm-topbar-btn.notif-btn.has-unread {
    border-color: rgba(239,68,68,0.4);
    background: rgba(239,68,68,0.06);
    color: #fca5a5;
  }

  .adm-notif-badge {
    position: absolute; top: -6px; right: -6px;
    min-width: 18px; height: 18px;
    background: #ef4444; color: #fff;
    font-size: 10px; font-weight: 800;
    border-radius: 99px; display: flex;
    align-items: center; justify-content: center;
    padding: 0 4px; border: 2px solid #080c12;
    box-shadow: 0 0 8px rgba(239,68,68,0.6);
  }

  .adm-logout-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px;
    border: 1px solid rgba(239,68,68,0.2);
    background: rgba(239,68,68,0.06);
    color: #fca5a5; font-size: 0.8rem; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
    font-family: 'Space Grotesk', sans-serif;
  }
  .adm-logout-btn:hover {
    background: rgba(239,68,68,0.12);
    border-color: rgba(239,68,68,0.4);
    color: #fecaca;
  }

  /* ── MAIN CONTENT ── */
  .adm-body {
    flex: 1; position: relative; z-index: 1;
    padding: 28px 24px;
    max-width: 1400px; width: 100%; margin: 0 auto;
  }

  /* ── PAGE HEADER ── */
  .adm-page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 28px; gap: 16px;
  }
  .adm-page-title {
    font-size: 1.6rem; font-weight: 700;
    color: #f1f5f9; letter-spacing: -0.5px;
    line-height: 1.2;
  }
  .adm-page-subtitle {
    font-size: 0.8rem; color: #475569; margin-top: 4px;
    font-family: 'JetBrains Mono', monospace;
  }
  .adm-live-dot {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.72rem; color: #22c55e;
    font-family: 'JetBrains Mono', monospace;
  }
  .adm-live-dot::before {
    content: '';
    width: 6px; height: 6px; border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px #22c55e;
    animation: adm-pulse 2s ease-in-out infinite;
  }

  @keyframes adm-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }
  @keyframes adm-fade-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes adm-slide-in {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  /* ── STATS GRID ── */
  .adm-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  @media (max-width: 768px) { .adm-stats { grid-template-columns: 1fr; } }

  .adm-stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 20px 22px;
    position: relative; overflow: hidden;
    animation: adm-fade-in 0.4s ease both;
    transition: border-color 0.2s, transform 0.2s;
    cursor: default;
  }
  .adm-stat-card:hover {
    border-color: rgba(217,119,6,0.25);
    transform: translateY(-2px);
  }
  .adm-stat-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--accent-grad);
    opacity: 0; transition: opacity 0.2s;
  }
  .adm-stat-card:hover::before { opacity: 1; }

  .adm-stat-label {
    font-size: 0.72rem; font-weight: 600; letter-spacing: 0.8px;
    text-transform: uppercase; color: #475569; margin-bottom: 10px;
    font-family: 'JetBrains Mono', monospace;
  }
  .adm-stat-value {
    font-size: 2.4rem; font-weight: 700; color: #f1f5f9;
    letter-spacing: -1px; line-height: 1;
  }
  .adm-stat-sub {
    font-size: 0.75rem; color: #475569; margin-top: 6px;
  }
  .adm-stat-icon {
    position: absolute; right: 18px; top: 50%;
    transform: translateY(-50%);
    opacity: 0.08; font-size: 3.5rem; pointer-events: none;
  }

  /* ── TOOLBAR ── */
  .adm-toolbar {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px; flex-wrap: wrap;
  }
  .adm-search-wrap {
    flex: 1; min-width: 220px; position: relative;
  }
  .adm-search-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: #475569; pointer-events: none;
  }
  .adm-search {
    width: 100%; padding: 9px 12px 9px 38px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 9px; color: #e2e8f0;
    font-size: 0.85rem; font-family: 'Space Grotesk', sans-serif;
    transition: all 0.2s; outline: none;
  }
  .adm-search::placeholder { color: #475569; }
  .adm-search:focus {
    border-color: rgba(217,119,6,0.4);
    background: rgba(217,119,6,0.04);
    box-shadow: 0 0 0 3px rgba(217,119,6,0.08);
  }

  .adm-filter-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 14px; border-radius: 9px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: #94a3b8; font-size: 0.82rem; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
    font-family: 'Space Grotesk', sans-serif; white-space: nowrap;
  }
  .adm-filter-btn:hover, .adm-filter-btn.active {
    border-color: rgba(217,119,6,0.4);
    background: rgba(217,119,6,0.08);
    color: #fbbf24;
  }

  .adm-add-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 9px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    color: #fff; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.2s;
    font-family: 'Space Grotesk', sans-serif; white-space: nowrap;
    box-shadow: 0 4px 14px rgba(217,119,6,0.35);
  }
  .adm-add-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(217,119,6,0.5);
  }

  .adm-refresh-btn {
    display: flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; border-radius: 9px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: #64748b; cursor: pointer; transition: all 0.2s;
  }
  .adm-refresh-btn:hover { color: #94a3b8; border-color: rgba(255,255,255,0.15); }
  .adm-refresh-btn.spinning svg { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── TABLE ── */
  .adm-table-wrap {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; overflow: hidden;
    animation: adm-fade-in 0.5s ease both;
  }

  .adm-table { width: 100%; border-collapse: collapse; }

  .adm-th {
    padding: 11px 16px;
    background: rgba(255,255,255,0.03);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    text-align: left;
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.8px;
    color: #475569; text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
    cursor: pointer; user-select: none; white-space: nowrap;
    transition: color 0.2s;
  }
  .adm-th:hover { color: #94a3b8; }
  .adm-th-actions { text-align: right; cursor: default; }
  .adm-th-inner { display: flex; align-items: center; gap: 5px; }

  .adm-tr {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.15s;
    animation: adm-fade-in 0.3s ease both;
  }
  .adm-tr:last-child { border-bottom: none; }
  .adm-tr:hover { background: rgba(255,255,255,0.03); }

  .adm-td { padding: 13px 16px; vertical-align: middle; }

  .adm-user-cell { display: flex; align-items: center; gap: 11px; }
  .adm-avatar {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 0.85rem; font-weight: 700;
    flex-shrink: 0; box-shadow: 0 2px 8px rgba(217,119,6,0.3);
  }
  .adm-user-name {
    font-size: 0.875rem; font-weight: 600; color: #e2e8f0;
    white-space: nowrap;
  }
  .adm-user-id {
    font-size: 0.65rem; color: #334155;
    font-family: 'JetBrains Mono', monospace;
  }

  .adm-email { font-size: 0.8rem; color: #64748b; white-space: nowrap; }

  .adm-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 6px;
    font-size: 0.72rem; font-weight: 600; white-space: nowrap;
  }
  .adm-badge-artist {
    background: rgba(217,119,6,0.12);
    color: #fbbf24; border: 1px solid rgba(217,119,6,0.25);
  }
  .adm-badge-customer {
    background: rgba(59,130,246,0.1);
    color: #93c5fd; border: 1px solid rgba(59,130,246,0.2);
  }
  .adm-badge-verified {
    background: rgba(34,197,94,0.1);
    color: #86efac; border: 1px solid rgba(34,197,94,0.2);
    font-size: 0.65rem; padding: 2px 6px; margin-left: 5px;
  }

  .adm-artist-info { display: flex; flex-direction: column; gap: 3px; }
  .adm-rating { font-size: 0.78rem; color: #fbbf24; white-space: nowrap; }
  .adm-skills { display: flex; gap: 4px; flex-wrap: wrap; }
  .adm-skill-tag {
    font-size: 0.65rem; padding: 2px 6px; border-radius: 4px;
    background: rgba(255,255,255,0.06); color: #64748b;
  }

  .adm-date { font-size: 0.78rem; color: #475569; font-family: 'JetBrains Mono', monospace; white-space: nowrap; }

  .adm-actions { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
  .adm-action-btn {
    width: 30px; height: 30px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    border: none; cursor: pointer; background: transparent;
    color: #334155; transition: all 0.15s;
  }
  .adm-action-btn:hover.view  { color: #93c5fd; background: rgba(59,130,246,0.1); }
  .adm-action-btn:hover.edit  { color: #fbbf24; background: rgba(217,119,6,0.1); }
  .adm-action-btn:hover.del   { color: #fca5a5; background: rgba(239,68,68,0.1); }

  .adm-table-footer {
    padding: 12px 16px;
    border-top: 1px solid rgba(255,255,255,0.04);
    font-size: 0.75rem; color: #334155;
    font-family: 'JetBrains Mono', monospace;
    display: flex; align-items: center; justify-content: space-between;
  }

  .adm-empty {
    padding: 60px 16px; text-align: center;
    color: #334155; font-size: 0.875rem;
  }

  /* ── NOTIFICATION DRAWER ── */
  .adm-notif-backdrop {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    animation: adm-fade-backdrop 0.2s ease;
  }
  @keyframes adm-fade-backdrop {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .adm-notif-drawer {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 380px; max-width: 100%;
    background: #0d1117;
    border-left: 1px solid rgba(255,255,255,0.08);
    display: flex; flex-direction: column;
    z-index: 201;
    animation: adm-slide-in 0.25s ease;
  }
  .adm-notif-header {
    padding: 20px 20px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; gap: 10px;
    flex-shrink: 0;
  }
  .adm-notif-title {
    flex: 1; font-size: 1rem; font-weight: 700; color: #f1f5f9;
  }
  .adm-notif-count {
    font-size: 0.7rem; font-weight: 700;
    background: rgba(239,68,68,0.2); color: #fca5a5;
    padding: 2px 8px; border-radius: 99px;
    border: 1px solid rgba(239,68,68,0.3);
  }
  .adm-notif-mark-btn {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.75rem; color: #64748b;
    background: none; border: none; cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    transition: color 0.2s; padding: 4px 8px; border-radius: 6px;
  }
  .adm-notif-mark-btn:hover { color: #fbbf24; background: rgba(217,119,6,0.08); }
  .adm-notif-close {
    width: 28px; height: 28px; border-radius: 7px;
    background: rgba(255,255,255,0.06); border: none;
    color: #64748b; cursor: pointer; display: flex;
    align-items: center; justify-content: center; transition: all 0.2s;
  }
  .adm-notif-close:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }

  .adm-notif-list { flex: 1; overflow-y: auto; }
  .adm-notif-list::-webkit-scrollbar { width: 4px; }
  .adm-notif-list::-webkit-scrollbar-track { background: transparent; }
  .adm-notif-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

  .adm-notif-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04);
    cursor: pointer; transition: background 0.15s; position: relative;
  }
  .adm-notif-item:hover { background: rgba(255,255,255,0.03); }
  .adm-notif-item.unread { background: rgba(217,119,6,0.03); }
  .adm-notif-item.unread::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 2px; background: #d97706;
  }
  .adm-notif-emoji {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(217,119,6,0.1); border: 1px solid rgba(217,119,6,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
  }
  .adm-notif-body { flex: 1; min-width: 0; }
  .adm-notif-item-title {
    font-size: 0.825rem; font-weight: 600; color: #e2e8f0;
    margin-bottom: 3px; display: flex; align-items: center; gap: 6px;
  }
  .adm-notif-unread-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #d97706; flex-shrink: 0;
    box-shadow: 0 0 6px rgba(217,119,6,0.6);
  }
  .adm-notif-item-body { font-size: 0.75rem; color: #475569; line-height: 1.5; }
  .adm-notif-item-time { font-size: 0.68rem; color: #334155; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }

  .adm-notif-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 20px; color: #334155;
  }
  .adm-notif-empty span { font-size: 2.5rem; margin-bottom: 12px; }
  .adm-notif-empty p { font-size: 0.825rem; }

  /* ── MODAL OVERLAY ── */
  .adm-modal-backdrop {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: adm-fade-backdrop 0.2s ease;
  }
  .adm-modal {
    background: #0d1117;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 18px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    overflow: hidden;
    animation: adm-fade-in 0.25s ease;
  }
  .adm-modal-header {
    padding: 20px 24px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: space-between;
  }
  .adm-modal-title { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
  .adm-modal-close {
    width: 30px; height: 30px; border-radius: 8px;
    background: rgba(255,255,255,0.06); border: none;
    color: #64748b; cursor: pointer; display: flex;
    align-items: center; justify-content: center; transition: all 0.2s;
  }
  .adm-modal-close:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }

  .adm-modal-body { padding: 24px; overflow-y: auto; max-height: 70vh; }
  .adm-modal-body::-webkit-scrollbar { width: 4px; }
  .adm-modal-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

  .adm-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex; gap: 10px;
  }

  /* ── FORM ELEMENTS ── */
  .adm-form-group { margin-bottom: 16px; }
  .adm-label {
    display: block; font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.5px; color: #475569; margin-bottom: 7px;
    text-transform: uppercase; font-family: 'JetBrains Mono', monospace;
  }
  .adm-input, .adm-select, textarea.adm-input {
    width: 100%; padding: 10px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 9px; color: #e2e8f0;
    font-size: 0.875rem; font-family: 'Space Grotesk', sans-serif;
    transition: all 0.2s; outline: none;
  }
  .adm-input::placeholder { color: #334155; }
  .adm-input:focus, .adm-select:focus {
    border-color: rgba(217,119,6,0.4);
    background: rgba(217,119,6,0.04);
    box-shadow: 0 0 0 3px rgba(217,119,6,0.08);
  }
  .adm-select option { background: #0d1117; }

  .adm-btn-primary {
    flex: 1; padding: 11px 20px; border-radius: 9px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    color: #fff; font-size: 0.875rem; font-weight: 600;
    border: none; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    font-family: 'Space Grotesk', sans-serif;
    box-shadow: 0 4px 14px rgba(217,119,6,0.3);
  }
  .adm-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(217,119,6,0.45);
  }
  .adm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .adm-btn-ghost {
    flex: 1; padding: 11px 20px; border-radius: 9px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #64748b; font-size: 0.875rem; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
    font-family: 'Space Grotesk', sans-serif;
  }
  .adm-btn-ghost:hover { background: rgba(255,255,255,0.07); color: #94a3b8; }

  .adm-btn-danger {
    flex: 1; padding: 11px 20px; border-radius: 9px;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    color: #fca5a5; font-size: 0.875rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    font-family: 'Space Grotesk', sans-serif;
  }
  .adm-btn-danger:hover:not(:disabled) {
    background: rgba(239,68,68,0.18);
    border-color: rgba(239,68,68,0.4);
    color: #fecaca;
  }
  .adm-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── DIVIDER ── */
  .adm-divider {
    border: none; border-top: 1px solid rgba(255,255,255,0.06);
    margin: 16px 0;
  }

  /* ── DETAIL ROWS (view modal) ── */
  .adm-detail-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
    gap: 12px;
  }
  .adm-detail-label { font-size: 0.75rem; color: #475569; flex-shrink: 0; }
  .adm-detail-value { font-size: 0.825rem; color: #94a3b8; text-align: right; }
  .adm-detail-value.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; }

  .adm-section-label {
    font-size: 0.68rem; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: #d97706;
    font-family: 'JetBrains Mono', monospace;
    margin: 16px 0 8px;
  }

  /* Toggle button for verified */
  .adm-toggle {
    display: flex; align-items: center; gap: 8px; cursor: pointer;
    padding: 8px 12px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: #64748b; font-size: 0.825rem;
    transition: all 0.2s; font-family: 'Space Grotesk', sans-serif;
  }
  .adm-toggle.on {
    border-color: rgba(34,197,94,0.3);
    background: rgba(34,197,94,0.06);
    color: #86efac;
  }

  /* ── LOADING ── */
  .adm-loading {
    display: flex; align-items: center; justify-content: center;
    padding: 80px 0; gap: 12px; color: #475569;
  }

  /* ── WARNING BOX (delete) ── */
  .adm-warning-box {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; border-radius: 10px;
    background: rgba(239,68,68,0.06);
    border: 1px solid rgba(239,68,68,0.2);
    margin-bottom: 20px;
  }
  .adm-warning-text { font-size: 0.825rem; color: #fca5a5; line-height: 1.5; }
`

// ── Helpers ──────────────────────────────────────────────────
function formatTime(createdAt: unknown): string {
  if (!createdAt) return ''
  try {
    const ts = createdAt as { seconds?: number; toDate?: () => Date }
    const date = ts.toDate ? ts.toDate() : ts.seconds ? new Date(ts.seconds * 1000) : new Date(createdAt as string)
    const diff = Math.floor((Date.now() - date.getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  } catch { return '' }
}

const emojiMap: Record<string, string> = { order: '📦', review: '⭐', status_update: '✅', message: '💬', system: '🔔' }

// ── Main Component ────────────────────────────────────────────
export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
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
  const [adminNotifs, setAdminNotifs] = useState<NotificationData[]>([])
  const [showNotifDrawer, setShowNotifDrawer] = useState(false)
  // newUser state — includes all artist fields for when role === 'artist'
  const [newUser, setNewUser] = useState({
    name: '', email: '', role: 'customer', phone: '', location: '',
    bio: '', skills: '', priceMin: '', priceMax: '',
  })
  // comma-separated skill string used in edit modal
  const [editSkillsInput, setEditSkillsInput] = useState('')
  const adminSession = JSON.parse(sessionStorage.getItem('adminSession') || '{}')

  useEffect(() => {
    const session = sessionStorage.getItem('adminSession')
    if (!session) { navigate('/admin'); return }
    fetchAllUsers()
  }, [navigate])

  useEffect(() => {
    const unsub = subscribeToAdminNotifications(setAdminNotifs)
    return () => unsub()
  }, [])

  const fetchAllUsers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const usersMap = new Map<string, UserData>()
      const usersSnap = await getDocs(collection(db, 'users'))
      usersSnap.forEach(docSnap => {
        const d = docSnap.data()
        usersMap.set(docSnap.id, {
          id: docSnap.id, name: d.name || '', email: d.email || '',
          role: d.role || 'customer', phone: d.phone || '',
          location: d.location || '', joinedDate: d.joinedDate || d.createdAt || '', isArtist: false
        })
      })
      const artistsSnap = await getDocs(collection(db, 'artists'))
      artistsSnap.forEach(docSnap => {
        const d = docSnap.data()
        const id = d.userId || docSnap.id
        const existing = usersMap.get(id)
        const profile = {
          bio: d.bio || '', skills: d.skills || [],
          priceRange: d.priceRange || { min: 0, max: 0 },
          rating: d.rating || 0, reviewCount: d.reviewCount || 0,
          completedOrders: d.completedOrders || 0,
          availability: d.availability || 'available', verified: d.verified || false, portfolio: d.portfolio || []
        }
        if (existing) {
          existing.isArtist = true; existing.artistProfile = profile
          if (!existing.location && d.location) existing.location = d.location
          if (!existing.name && d.name) existing.name = d.name
        } else {
          usersMap.set(id, { id, name: d.name || '', email: d.email || '', role: 'artist', phone: '', location: d.location || '', joinedDate: d.joinedDate || '', isArtist: true, artistProfile: profile })
        }
      })
      const allUsers = Array.from(usersMap.values())
      setUsers(allUsers)
      setStats({ total: allUsers.length, customers: allUsers.filter(u => !u.isArtist).length, artists: allUsers.filter(u => u.isArtist).length })
    } catch (err) { console.error('Error fetching users:', err) }
    finally { setLoading(false); setRefreshing(false) }
  }

  const handleDelete = async (userId: string) => {
    setSaving(true)
    try {
      await deleteDoc(doc(db, 'users', userId))
      try { await deleteDoc(doc(db, 'artists', userId)) } catch { /* ok */ }
      const wasArtist = users.find(u => u.id === userId)?.isArtist
      setUsers(prev => prev.filter(u => u.id !== userId))
      setStats(prev => ({ total: prev.total - 1, customers: wasArtist ? prev.customers : prev.customers - 1, artists: wasArtist ? prev.artists - 1 : prev.artists }))
      setDeleteConfirm(null)
    } catch { alert('Failed to delete user') }
    finally { setSaving(false) }
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setSaving(true)
    try {
      // Parse skills from comma-separated string
      const parsedSkills = editSkillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const updatedUser = {
        ...editingUser,
        artistProfile: editingUser.artistProfile
          ? { ...editingUser.artistProfile, skills: parsedSkills }
          : undefined,
      }

      // Always update users collection
      await updateDoc(doc(db, 'users', updatedUser.id), {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || '',
        location: updatedUser.location || '',
      })

      // If artist, save ALL artist fields
      if (updatedUser.isArtist && updatedUser.artistProfile) {
        const ap = updatedUser.artistProfile
        await updateDoc(doc(db, 'artists', updatedUser.id), {
          name: updatedUser.name,
          email: updatedUser.email,
          location: updatedUser.location || '',
          bio: ap.bio || '',
          skills: parsedSkills,
          priceRange: ap.priceRange || { min: 0, max: 0 },
          rating: ap.rating || 0,
          reviewCount: ap.reviewCount || 0,
          completedOrders: ap.completedOrders || 0,
          availability: ap.availability || 'available',
          verified: ap.verified || false,
        })
      }

      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u))
      setEditingUser(null)
    } catch (e) { console.error(e); alert('Failed to update user') }
    finally { setSaving(false) }
  }

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) { alert('Name and email required'); return }
    setSaving(true)
    try {
      const userId = 'user_' + Date.now()
      const isArtist = newUser.role === 'artist'
      const today = new Date().toISOString().split('T')[0]

      // Always create user doc
      const userData = {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        phone: newUser.phone.trim(),
        location: newUser.location.trim(),
        joinedDate: today,
        createdAt: new Date().toISOString(),
      }
      await setDoc(doc(db, 'users', userId), userData)

      let artistProfile: UserData['artistProfile'] | undefined

      // If role is artist, also create artist doc
      if (isArtist) {
        const skillsList = newUser.skills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
        const artistData = {
          id: userId,
          userId,
          name: newUser.name.trim(),
          email: newUser.email.trim(),
          bio: newUser.bio.trim(),
          location: newUser.location.trim(),
          skills: skillsList,
          priceRange: {
            min: parseInt(newUser.priceMin) || 0,
            max: parseInt(newUser.priceMax) || 0,
          },
          rating: 0,
          reviewCount: 0,
          completedOrders: 0,
          availability: 'available',
          verified: false,
          portfolio: [],
          joinedDate: today,
          responseTime: '< 2 hours',
        }
        await setDoc(doc(db, 'artists', userId), artistData)
        artistProfile = {
          bio: artistData.bio,
          skills: skillsList,
          priceRange: artistData.priceRange,
          rating: 0, reviewCount: 0, completedOrders: 0,
          availability: 'available', verified: false, portfolio: [],
        }
      }

      const newEntry: UserData = { id: userId, ...userData, isArtist, artistProfile }
      setUsers(prev => [...prev, newEntry])
      setStats(prev => ({
        total: prev.total + 1,
        customers: isArtist ? prev.customers : prev.customers + 1,
        artists: isArtist ? prev.artists + 1 : prev.artists,
      }))
      setShowAddModal(false)
      setNewUser({ name: '', email: '', role: 'customer', phone: '', location: '', bio: '', skills: '', priceMin: '', priceMax: '' })
    } catch (e) { console.error(e); alert('Failed to add user') }
    finally { setSaving(false) }
  }

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(p => p === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filteredUsers = users
    .filter(u => {
      const q = searchQuery.toLowerCase()
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.location || '').toLowerCase().includes(q) || (u.phone || '').includes(q)
      const matchRole = filterRole === 'all' ? true : filterRole === 'artist' ? u.isArtist : !u.isArtist
      return matchSearch && matchRole
    })
    .sort((a, b) => {
      let va = '', vb = ''
      if (sortField === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase() }
      else if (sortField === 'email') { va = a.email.toLowerCase(); vb = b.email.toLowerCase() }
      else if (sortField === 'role') { va = a.isArtist ? 'artist' : 'customer'; vb = b.isArtist ? 'artist' : 'customer' }
      else if (sortField === 'location') { va = (a.location || '').toLowerCase(); vb = (b.location || '').toLowerCase() }
      else if (sortField === 'joinedDate') { va = a.joinedDate || ''; vb = b.joinedDate || '' }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const SortIcon = ({ field }: { field: string }) => sortField === field
    ? (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
    : <ChevronDown size={11} style={{ opacity: 0.3 }} />

  const unreadCount = adminNotifs.filter(n => !n.read).length

  return (
    <>
      <style>{css}</style>
      <div className="adm-root">

        {/* ── TOP BAR ── */}
        <header className="adm-topbar">
          <div className="adm-logo">
            <div className="adm-logo-icon"><Shield size={16} color="#fff" /></div>
            <span className="adm-logo-text">HunarHub</span>
            <span className="adm-logo-badge">ADMIN</span>
          </div>

          <div className="adm-topbar-spacer" />

          <span className="adm-topbar-greeting">
            {adminSession.name ? `operator: ${adminSession.name}` : 'admin console'}
          </span>

          {/* Notifications */}
          <button
            className={`adm-topbar-btn notif-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setShowNotifDrawer(true)}
          >
            <Bell size={14} />
            Activity
            {unreadCount > 0 && <span className="adm-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          <button className="adm-logout-btn" onClick={() => { sessionStorage.removeItem('adminSession'); navigate('/admin') }}>
            <LogOut size={14} /> Sign out
          </button>
        </header>

        {/* ── MAIN BODY ── */}
        <div className="adm-body">

          {/* Page Header */}
          <div className="adm-page-header">
            <div>
              <h1 className="adm-page-title">User Management</h1>
              <p className="adm-page-subtitle">
                Monitor and manage all customers & artists on the platform
              </p>
            </div>
            <span className="adm-live-dot">live</span>
          </div>

          {/* Stats */}
          <div className="adm-stats">
            {[
              { label: 'Total Users', value: stats.total, icon: '👥', grad: 'linear-gradient(135deg,#3b82f6,#6366f1)', delay: '0s' },
              { label: 'Customers', value: stats.customers, icon: '🛍️', grad: 'linear-gradient(135deg,#22c55e,#16a34a)', delay: '0.08s' },
              { label: 'Artists', value: stats.artists, icon: '🎨', grad: 'linear-gradient(135deg,#d97706,#ea580c)', delay: '0.16s' },
            ].map(s => (
              <div key={s.label} className="adm-stat-card" style={{ '--accent-grad': s.grad, animationDelay: s.delay } as any}>
                <div className="adm-stat-label">{s.label}</div>
                <div className="adm-stat-value">{s.value}</div>
                <div className="adm-stat-sub">
                  {s.label === 'Total Users' && `${stats.artists} artists · ${stats.customers} customers`}
                  {s.label === 'Customers' && (stats.total > 0 ? `${Math.round(stats.customers / stats.total * 100)}% of users` : '—')}
                  {s.label === 'Artists' && (stats.total > 0 ? `${Math.round(stats.artists / stats.total * 100)}% of users` : '—')}
                </div>
                <div className="adm-stat-icon">{s.icon}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="adm-toolbar">
            <div className="adm-search-wrap">
              <Search size={15} className="adm-search-icon" />
              <input
                className="adm-search"
                placeholder="Search name, email, location, phone…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {(['all', 'customer', 'artist'] as const).map(role => (
              <button
                key={role}
                className={`adm-filter-btn ${filterRole === role ? 'active' : ''}`}
                onClick={() => setFilterRole(role)}
              >
                {role === 'all' ? 'All' : role === 'customer' ? '👤 Customers' : '🎨 Artists'}
              </button>
            ))}

            <button className={`adm-refresh-btn ${refreshing ? 'spinning' : ''}`} onClick={() => fetchAllUsers(true)} title="Refresh">
              <RefreshCw size={15} />
            </button>

            <button className="adm-add-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={15} /> Add User
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="adm-loading">
              <Loader2 size={24} className="animate-spin" style={{ color: '#d97706' }} />
              <span>Loading users…</span>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    {[
                      { label: 'User', field: 'name' },
                      { label: 'Email', field: 'email' },
                      { label: 'Role', field: 'role' },
                      { label: 'Location', field: 'location' },
                      { label: 'Artist Info', field: null },
                      { label: 'Joined', field: 'joinedDate' },
                    ].map(col => (
                      <th key={col.label} className="adm-th" onClick={() => col.field && handleSort(col.field)}>
                        <div className="adm-th-inner">{col.label}{col.field && <SortIcon field={col.field} />}</div>
                      </th>
                    ))}
                    <th className="adm-th adm-th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, i) => (
                    <tr key={user.id} className="adm-tr" style={{ animationDelay: `${i * 0.03}s` }}>
                      <td className="adm-td">
                        <div className="adm-user-cell">
                          <div className="adm-avatar">{(user.name || '?').charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="adm-user-name">{user.name || '—'}</div>
                            <div className="adm-user-id">{user.id.substring(0, 14)}…</div>
                          </div>
                        </div>
                      </td>
                      <td className="adm-td"><span className="adm-email">{user.email || '—'}</span></td>
                      <td className="adm-td">
                        <span className={`adm-badge ${user.isArtist ? 'adm-badge-artist' : 'adm-badge-customer'}`}>
                          {user.isArtist ? '🎨 Artist' : '👤 Customer'}
                        </span>
                        {user.artistProfile?.verified && (
                          <span className="adm-badge adm-badge-verified">✓ Verified</span>
                        )}
                      </td>
                      <td className="adm-td"><span className="adm-email">{user.location || '—'}</span></td>
                      <td className="adm-td">
                        {user.isArtist && user.artistProfile ? (
                          <div className="adm-artist-info">
                            <div className="adm-rating">⭐ {user.artistProfile.rating?.toFixed(1) || '0.0'} · {user.artistProfile.completedOrders || 0} orders</div>
                            <div className="adm-skills">
                              {user.artistProfile.skills?.slice(0, 2).map((s, i) => <span key={i} className="adm-skill-tag">{s}</span>)}
                              {(user.artistProfile.skills?.length || 0) > 2 && <span className="adm-skill-tag">+{(user.artistProfile.skills?.length || 0) - 2}</span>}
                            </div>
                          </div>
                        ) : <span style={{ color: '#1e293b' }}>—</span>}
                      </td>
                      <td className="adm-td"><span className="adm-date">{user.joinedDate?.split('T')[0] || '—'}</span></td>
                      <td className="adm-td">
                        <div className="adm-actions">
                          <button className="adm-action-btn view" onClick={() => setShowViewModal(user)} title="View"><Eye size={14} /></button>
                          <button className="adm-action-btn edit" onClick={() => { setEditingUser({ ...user }); setEditSkillsInput((user.artistProfile?.skills || []).join(', ')) }} title="Edit"><Edit size={14} /></button>
                          <button className="adm-action-btn del" onClick={() => setDeleteConfirm(user.id)} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="adm-empty">
                  {searchQuery ? `No users matching "${searchQuery}"` : 'No users found'}
                </div>
              )}

              <div className="adm-table-footer">
                <span>Showing {filteredUsers.length} of {users.length} users</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── NOTIFICATION DRAWER ── */}
        {showNotifDrawer && (
          <>
            <div className="adm-notif-backdrop" onClick={() => setShowNotifDrawer(false)} />
            <aside className="adm-notif-drawer">
              <div className="adm-notif-header">
                <Bell size={16} style={{ color: '#d97706', flexShrink: 0 }} />
                <div className="adm-notif-title">
                  Activity Feed
                  {unreadCount > 0 && <span className="adm-notif-count" style={{ marginLeft: 8 }}>{unreadCount} new</span>}
                </div>
                {unreadCount > 0 && (
                  <button
                    className="adm-notif-mark-btn"
                    onClick={async () => {
                      const unread = adminNotifs.filter(n => !n.read && n.id)
                      await Promise.all(unread.map(n => markNotificationRead(n.id!)))
                    }}
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
                <button className="adm-notif-close" onClick={() => setShowNotifDrawer(false)}>
                  <X size={14} />
                </button>
              </div>
              <div className="adm-notif-list">
                {adminNotifs.length === 0 ? (
                  <div className="adm-notif-empty">
                    <span>🔔</span>
                    <p>No platform activity yet</p>
                  </div>
                ) : adminNotifs.map(notif => (
                  <div
                    key={notif.id}
                    className={`adm-notif-item ${!notif.read ? 'unread' : ''}`}
                    onClick={async () => { if (!notif.read && notif.id) await markNotificationRead(notif.id) }}
                  >
                    <div className="adm-notif-emoji">{emojiMap[notif.type] || '🔔'}</div>
                    <div className="adm-notif-body">
                      <div className="adm-notif-item-title">
                        {notif.title}
                        {!notif.read && <span className="adm-notif-unread-dot" />}
                      </div>
                      <div className="adm-notif-item-body">{notif.body}</div>
                      <div className="adm-notif-item-time">{formatTime(notif.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </>
        )}

        {/* ── DELETE MODAL ── */}
        {deleteConfirm && (
          <div className="adm-modal-backdrop" onClick={() => setDeleteConfirm(null)}>
            <div className="adm-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
              <div className="adm-modal-header">
                <span className="adm-modal-title">Confirm Deletion</span>
                <button className="adm-modal-close" onClick={() => setDeleteConfirm(null)}><X size={14} /></button>
              </div>
              <div className="adm-modal-body">
                <div className="adm-warning-box">
                  <AlertTriangle size={16} style={{ color: '#fca5a5', flexShrink: 0, marginTop: 2 }} />
                  <div className="adm-warning-text">
                    This will permanently delete the user and their artist profile if one exists. This action cannot be undone.
                  </div>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button className="adm-btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="adm-btn-danger" onClick={() => handleDelete(deleteConfirm)} disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT MODAL ── */}
        {editingUser && (
          <div className="adm-modal-backdrop" onClick={() => setEditingUser(null)}>
            <div className="adm-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
              <div className="adm-modal-header">
                <span className="adm-modal-title">Edit User</span>
                <button className="adm-modal-close" onClick={() => setEditingUser(null)}><X size={14} /></button>
              </div>
              <div className="adm-modal-body">
                {[
                  { label: 'Name', key: 'name', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Phone', key: 'phone', type: 'text' },
                  { label: 'Location', key: 'location', type: 'text' },
                ].map(f => (
                  <div key={f.key} className="adm-form-group">
                    <label className="adm-label">{f.label}</label>
                    <input
                      type={f.type}
                      className="adm-input"
                      value={(editingUser as any)[f.key] || ''}
                      onChange={e => setEditingUser({ ...editingUser, [f.key]: e.target.value })}
                    />
                  </div>
                ))}
                <div className="adm-form-group">
                  <label className="adm-label">Role</label>
                  <select className="adm-select" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
                    <option value="customer">Customer</option>
                    <option value="artist">Artist</option>
                  </select>
                </div>

                {editingUser.isArtist && editingUser.artistProfile && (
                  <>
                    <hr className="adm-divider" />
                    <div className="adm-section-label">Artist Profile</div>

                    {/* Bio */}
                    <div className="adm-form-group">
                      <label className="adm-label">Bio</label>
                      <textarea
                        className="adm-input"
                        rows={3}
                        style={{ resize: 'vertical' }}
                        value={editingUser.artistProfile.bio || ''}
                        onChange={e => setEditingUser({ ...editingUser, artistProfile: { ...editingUser.artistProfile!, bio: e.target.value } })}
                      />
                    </div>

                    {/* Skills — comma separated */}
                    <div className="adm-form-group">
                      <label className="adm-label">Skills (comma separated)</label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="e.g. Portrait, Watercolor, Digital Art"
                        value={editSkillsInput}
                        onChange={e => setEditSkillsInput(e.target.value)}
                      />
                      {/* Preview pills */}
                      {editSkillsInput.trim() && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                          {editSkillsInput.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                            <span key={i} className="adm-skill-tag" style={{ padding: '3px 10px', fontSize: '0.78rem' }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price Range */}
                    <div className="adm-form-group">
                      <label className="adm-label">Price Range (₹)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <input
                          type="number"
                          className="adm-input"
                          placeholder="Min"
                          value={editingUser.artistProfile.priceRange?.min || ''}
                          onChange={e => setEditingUser({ ...editingUser, artistProfile: { ...editingUser.artistProfile!, priceRange: { min: parseInt(e.target.value) || 0, max: editingUser.artistProfile!.priceRange?.max || 0 } } })}
                        />
                        <input
                          type="number"
                          className="adm-input"
                          placeholder="Max"
                          value={editingUser.artistProfile.priceRange?.max || ''}
                          onChange={e => setEditingUser({ ...editingUser, artistProfile: { ...editingUser.artistProfile!, priceRange: { min: editingUser.artistProfile!.priceRange?.min || 0, max: parseInt(e.target.value) || 0 } } })}
                        />
                      </div>
                    </div>

                    {/* Rating & Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div className="adm-form-group">
                        <label className="adm-label">Rating (0–5)</label>
                        <input
                          type="number"
                          className="adm-input"
                          min="0" max="5" step="0.1"
                          value={editingUser.artistProfile.rating ?? ''}
                          onChange={e => setEditingUser({ ...editingUser, artistProfile: { ...editingUser.artistProfile!, rating: parseFloat(e.target.value) || 0 } })}
                        />
                      </div>
                      <div className="adm-form-group">
                        <label className="adm-label">Reviews</label>
                        <input
                          type="number"
                          className="adm-input"
                          min="0"
                          value={editingUser.artistProfile.reviewCount ?? ''}
                          onChange={e => setEditingUser({ ...editingUser, artistProfile: { ...editingUser.artistProfile!, reviewCount: parseInt(e.target.value) || 0 } })}
                        />
                      </div>
                      <div className="adm-form-group">
                        <label className="adm-label">Completed</label>
                        <input
                          type="number"
                          className="adm-input"
                          min="0"
                          value={editingUser.artistProfile.completedOrders ?? ''}
                          onChange={e => setEditingUser({ ...editingUser, artistProfile: { ...editingUser.artistProfile!, completedOrders: parseInt(e.target.value) || 0 } })}
                        />
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="adm-form-group">
                      <label className="adm-label">Availability</label>
                      <select
                        className="adm-select"
                        value={editingUser.artistProfile.availability || 'available'}
                        onChange={e => setEditingUser({ ...editingUser, artistProfile: { ...editingUser.artistProfile!, availability: e.target.value } })}
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                      </select>
                    </div>

                    {/* Verified toggle */}
                    <div className="adm-form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <label className="adm-label" style={{ margin: 0 }}>Verified</label>
                      <button
                        className={`adm-toggle ${editingUser.artistProfile.verified ? 'on' : ''}`}
                        onClick={() => setEditingUser({ ...editingUser, artistProfile: { ...editingUser.artistProfile!, verified: !editingUser.artistProfile!.verified } })}
                      >
                        {editingUser.artistProfile.verified ? '✓ Verified' : 'Not Verified'}
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="adm-modal-footer">
                <button className="adm-btn-ghost" onClick={() => setEditingUser(null)}>Cancel</button>
                <button className="adm-btn-primary" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD USER MODAL ── */}
        {showAddModal && (
          <div className="adm-modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="adm-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
              <div className="adm-modal-header">
                <span className="adm-modal-title">Add New User</span>
                <button className="adm-modal-close" onClick={() => setShowAddModal(false)}><X size={14} /></button>
              </div>
              <div className="adm-modal-body">
                {/* Base fields */}
                {[
                  { label: 'Full Name *', key: 'name', type: 'text', ph: 'Rahul Sharma' },
                  { label: 'Email *', key: 'email', type: 'email', ph: 'rahul@example.com' },
                  { label: 'Phone', key: 'phone', type: 'text', ph: '+91 98765 43210' },
                  { label: 'Location', key: 'location', type: 'text', ph: 'Mumbai, Maharashtra' },
                ].map(f => (
                  <div key={f.key} className="adm-form-group">
                    <label className="adm-label">{f.label}</label>
                    <input
                      type={f.type}
                      className="adm-input"
                      placeholder={f.ph}
                      value={(newUser as any)[f.key]}
                      onChange={e => setNewUser({ ...newUser, [f.key]: e.target.value })}
                    />
                  </div>
                ))}

                {/* Role selector */}
                <div className="adm-form-group">
                  <label className="adm-label">Role</label>
                  <select className="adm-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="customer">Customer</option>
                    <option value="artist">Artist</option>
                  </select>
                </div>

                {/* Artist-only fields */}
                {newUser.role === 'artist' && (
                  <>
                    <hr className="adm-divider" />
                    <div className="adm-section-label">Artist Profile</div>

                    <div className="adm-form-group">
                      <label className="adm-label">Bio</label>
                      <textarea
                        className="adm-input"
                        rows={3}
                        style={{ resize: 'vertical' }}
                        placeholder="Describe the artist's work and style..."
                        value={newUser.bio}
                        onChange={e => setNewUser({ ...newUser, bio: e.target.value })}
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">Skills (comma separated)</label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="e.g. Portrait, Watercolor, Digital Art"
                        value={newUser.skills}
                        onChange={e => setNewUser({ ...newUser, skills: e.target.value })}
                      />
                      {newUser.skills.trim() && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                          {newUser.skills.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                            <span key={i} className="adm-skill-tag" style={{ padding: '3px 10px', fontSize: '0.78rem' }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">Price Range (₹)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <input
                          type="number"
                          className="adm-input"
                          placeholder="Min (e.g. 500)"
                          value={newUser.priceMin}
                          onChange={e => setNewUser({ ...newUser, priceMin: e.target.value })}
                        />
                        <input
                          type="number"
                          className="adm-input"
                          placeholder="Max (e.g. 5000)"
                          value={newUser.priceMax}
                          onChange={e => setNewUser({ ...newUser, priceMax: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="adm-modal-footer">
                <button className="adm-btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="adm-btn-primary" onClick={handleAddUser} disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Add User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW USER MODAL ── */}
        {showViewModal && (
          <div className="adm-modal-backdrop" onClick={() => setShowViewModal(null)}>
            <div className="adm-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
              <div className="adm-modal-header">
                <span className="adm-modal-title">User Details</span>
                <button className="adm-modal-close" onClick={() => setShowViewModal(null)}><X size={14} /></button>
              </div>
              <div className="adm-modal-body">
                {/* Avatar row */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#d97706,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: '0 auto 10px', boxShadow: '0 0 20px rgba(217,119,6,0.4)' }}>
                    {showViewModal.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9' }}>{showViewModal.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 3 }}>{showViewModal.email}</div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 6 }}>
                    <span className={`adm-badge ${showViewModal.isArtist ? 'adm-badge-artist' : 'adm-badge-customer'}`}>
                      {showViewModal.isArtist ? '🎨 Artist' : '👤 Customer'}
                    </span>
                    {showViewModal.artistProfile?.verified && <span className="adm-badge adm-badge-verified">✓ Verified</span>}
                  </div>
                </div>

                <div className="adm-section-label">Account Info</div>
                {[
                  { label: 'User ID', value: showViewModal.id, mono: true },
                  { label: 'Phone', value: showViewModal.phone || '—' },
                  { label: 'Location', value: showViewModal.location || '—' },
                  { label: 'Joined', value: showViewModal.joinedDate?.split('T')[0] || '—' },
                ].map(row => (
                  <div key={row.label} className="adm-detail-row">
                    <span className="adm-detail-label">{row.label}</span>
                    <span className={`adm-detail-value ${row.mono ? 'mono' : ''}`}>{row.value}</span>
                  </div>
                ))}

                {showViewModal.isArtist && showViewModal.artistProfile && (
                  <>
                    <div className="adm-section-label" style={{ marginTop: 16 }}>Artist Profile</div>
                    {[
                      { label: 'Rating', value: `⭐ ${showViewModal.artistProfile.rating?.toFixed(1) || '0.0'}` },
                      { label: 'Reviews', value: String(showViewModal.artistProfile.reviewCount || 0) },
                      { label: 'Completed Orders', value: String(showViewModal.artistProfile.completedOrders || 0) },
                      { label: 'Price Range', value: `₹${showViewModal.artistProfile.priceRange?.min || 0} – ₹${showViewModal.artistProfile.priceRange?.max || 0}` },
                      { label: 'Availability', value: showViewModal.artistProfile.availability || '—' },
                    ].map(row => (
                      <div key={row.label} className="adm-detail-row">
                        <span className="adm-detail-label">{row.label}</span>
                        <span className="adm-detail-value">{row.value}</span>
                      </div>
                    ))}
                    {showViewModal.artistProfile.skills && showViewModal.artistProfile.skills.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div className="adm-detail-label" style={{ marginBottom: 8 }}>Skills</div>
                        <div className="adm-skills">
                          {showViewModal.artistProfile.skills.map((s, i) => <span key={i} className="adm-skill-tag" style={{ padding: '4px 10px' }}>{s}</span>)}
                        </div>
                      </div>
                    )}
                    {showViewModal.artistProfile.portfolio && showViewModal.artistProfile.portfolio.length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <div className="adm-detail-label" style={{ marginBottom: 8 }}>Portfolio ({showViewModal.artistProfile.portfolio.length})</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                          {showViewModal.artistProfile.portfolio.slice(0, 6).map((item: any, i: number) => (
                            <div key={i} style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                              {item.imageUrl
                                ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎨</div>
                              }
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="adm-modal-footer">
                <button className="adm-btn-ghost" onClick={() => setShowViewModal(null)}>Close</button>
                <button className="adm-btn-primary" onClick={() => { setShowViewModal(null); setEditingUser({ ...showViewModal }); setEditSkillsInput((showViewModal.artistProfile?.skills || []).join(', ')) }}>
                  <Edit size={14} /> Edit User
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}