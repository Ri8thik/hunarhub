import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getArtistById } from '@/services/firestoreService';
import { getIndianStates, getCitiesByState } from '@/services/locationService';
import {
  User, LogOut, Bell, Moon, Palette, Star, MapPin,
  X, CheckCircle, Loader2, Save, Phone, Mail, ArrowRightLeft,
  Edit3, ChevronRight, Sun, Shield, Search
} from 'lucide-react';
import { seedDatabase } from '@/services/seedService';
import { getSessionDebugInfo } from '@/services/sessionManager';

const styles = `
  @keyframes fadeInUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
  @keyframes slideUp    { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn    { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
  @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.4} 100%{transform:scale(1.7);opacity:0} }
  @keyframes checkPop   { 0%{transform:scale(0) rotate(-10deg)} 60%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0)} }

  /* ── Page ── */
  .pp-page {
    height: 100%; overflow-y: auto;
    background: #f8fafc;
    transition: background 0.3s;
  }
  .dark .pp-page { background: #030712; }

  .pp-body { padding: 1rem; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }
  @media(min-width:1024px) { .pp-body { padding: 2rem; } }

  /* ── Profile Hero ── */
  .pp-hero {
    border-radius: 22px; overflow: hidden; position: relative;
    background: linear-gradient(135deg, #7c2d12 0%, #9a3412 25%, #c2410c 60%, #d97706 100%);
    padding: 28px 22px 22px;
    animation: fadeInUp 0.4s ease both;
    box-shadow: 0 8px 28px rgba(217,119,6,0.25);
  }
  .pp-hero-pattern {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      radial-gradient(circle at 10% 40%, rgba(255,255,255,0.08) 0%, transparent 50%),
      radial-gradient(circle at 90% 10%, rgba(255,255,255,0.05) 0%, transparent 40%),
      repeating-linear-gradient(45deg, transparent, transparent 25px, rgba(255,255,255,0.02) 25px, rgba(255,255,255,0.02) 26px);
  }
  .pp-hero-content { position: relative; z-index: 1; display: flex; align-items: center; gap: 16px; }

  .pp-avatar {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(8px);
    border: 3px solid rgba(255,255,255,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; font-weight: 900; color: #fff;
    position: relative; flex-shrink: 0;
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    animation: fadeInUp 0.4s ease both;
  }
  .pp-avatar-ring {
    position: absolute; inset: -6px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.25);
    animation: pulse-ring 2s ease-out infinite;
  }

  .pp-hero-name { font-size: 1.3rem; font-weight: 900; color: #fff; line-height: 1.2; text-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .pp-hero-email { font-size: 0.78rem; color: rgba(255,255,255,0.7); margin-top: 3px; }

  .pp-mode-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 99px; padding: 4px 10px;
    font-size: 0.7rem; font-weight: 700; color: #fff;
    margin-top: 8px;
  }

  .pp-edit-btn {
    margin-left: auto; flex-shrink: 0;
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 12px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    color: #fff; font-size: 0.78rem; font-weight: 700;
    cursor: pointer; backdrop-filter: blur(4px);
    transition: all 0.2s;
  }
  .pp-edit-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }

  /* ── Cards ── */
  .pp-card {
    background: #fff; border-radius: 18px;
    border: 1.5px solid #f1f5f9;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    overflow: hidden;
    animation: fadeInUp 0.4s ease both;
  }
  .dark .pp-card { background: #0f172a; border-color: #1e293b; box-shadow: 0 2px 10px rgba(0,0,0,0.25); }

  .pp-card-header {
    padding: 14px 18px 12px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.7rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: #d97706;
    display: flex; align-items: center; gap: 6px;
  }
  .dark .pp-card-header { border-color: #1e293b; }
  .pp-card-header::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(to right, #fde68a, transparent);
    margin-left: 4px;
  }
  .dark .pp-card-header::after { background: linear-gradient(to right, #78350f, transparent); }

  /* ── Artist banner ── */
  .pp-artist-banner {
    border-radius: 18px; padding: 18px;
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%);
    position: relative; overflow: hidden;
    animation: fadeInUp 0.4s 0.06s ease both;
    box-shadow: 0 6px 20px rgba(79,70,229,0.25);
  }
  .pp-artist-banner::before {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
  }
  .pp-artist-banner-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .pp-artist-view-btn {
    padding: 8px 16px; border-radius: 12px;
    background: rgba(255,255,255,0.9);
    color: #4f46e5; font-size: 0.8rem; font-weight: 800;
    border: none; cursor: pointer;
    transition: all 0.2s; flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .pp-artist-view-btn:hover { background: #fff; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

  /* ── Become artist banner ── */
  .pp-become-banner {
    border-radius: 18px; padding: 18px;
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    border: 2px solid #fde68a;
    position: relative; overflow: hidden;
    animation: fadeInUp 0.4s 0.06s ease both;
  }
  .dark .pp-become-banner {
    background: linear-gradient(135deg, #1c0a00, #251000);
    border-color: #78350f;
  }
  .pp-become-banner::before {
    content: '🎨';
    position: absolute; right: -8px; top: -8px;
    font-size: 5rem; opacity: 0.08;
    pointer-events: none; line-height: 1;
  }
  .pp-become-cta {
    width: 100%; margin-top: 14px; padding: 13px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    color: #fff; border: none; border-radius: 14px;
    font-size: 0.9rem; font-weight: 800; cursor: pointer;
    box-shadow: 0 4px 14px rgba(217,119,6,0.35);
    transition: all 0.25s;
  }
  .pp-become-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(217,119,6,0.45); }

  /* ── Role switcher ── */
  .pp-role-switcher {
    display: flex; background: #f1f5f9; border-radius: 12px; padding: 3px; gap: 2px;
  }
  .dark .pp-role-switcher { background: #1e293b; }

  .pp-role-btn {
    flex: 1; padding: 9px 12px; border-radius: 9px;
    font-size: 0.8rem; font-weight: 700;
    border: none; cursor: pointer; transition: all 0.2s;
    color: #64748b; background: transparent;
  }
  .dark .pp-role-btn { color: #94a3b8; }
  .pp-role-btn.active-customer {
    background: linear-gradient(135deg, #fef3c7, #fffbeb);
    color: #92400e;
    box-shadow: 0 2px 6px rgba(217,119,6,0.2);
    border: 1px solid #fde68a;
  }
  .dark .pp-role-btn.active-customer {
    background: linear-gradient(135deg, #1c0a00, #251000);
    color: #fcd34d;
    border-color: #78350f;
  }
  .pp-role-btn.active-artist {
    background: linear-gradient(135deg, #ede9fe, #f5f3ff);
    color: #5b21b6;
    box-shadow: 0 2px 6px rgba(109,40,217,0.2);
    border: 1px solid #ddd6fe;
  }
  .dark .pp-role-btn.active-artist {
    background: linear-gradient(135deg, #150e2d, #1a1240);
    color: #a78bfa;
    border-color: #2e1f6b;
  }

  /* ── Settings rows ── */
  .pp-settings-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px;
    cursor: pointer; transition: background 0.2s;
    border-bottom: 1px solid #f8fafc;
    width: 100%; background: none; border-left: none; border-right: none; border-top: none;
    text-align: left;
  }
  .dark .pp-settings-row { border-color: #111827; }
  .pp-settings-row:last-child { border-bottom: none; }
  .pp-settings-row:hover { background: #fffbeb; }
  .dark .pp-settings-row:hover { background: rgba(217,119,6,0.04); }

  .pp-settings-icon-wrap {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .pp-settings-label {
    flex: 1; font-size: 0.875rem; font-weight: 600;
    color: #1e293b;
  }
  .dark .pp-settings-label { color: #e2e8f0; }

  /* Toggle */
  .pp-toggle {
    width: 44px; height: 24px; border-radius: 99px;
    position: relative; transition: background 0.25s; flex-shrink: 0;
    border: none; cursor: pointer; padding: 0;
  }
  .pp-toggle.on { background: linear-gradient(135deg, #d97706, #ea580c); }
  .pp-toggle.off { background: #e2e8f0; }
  .dark .pp-toggle.off { background: #334155; }
  .pp-toggle-dot {
    position: absolute; top: 2px;
    width: 20px; height: 20px;
    background: #fff; border-radius: 50%;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .pp-toggle.on .pp-toggle-dot { transform: translateX(22px); }
  .pp-toggle.off .pp-toggle-dot { transform: translateX(2px); }

  /* ── Logout ── */
  .pp-logout {
    width: 100%; padding: 14px;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: #fff; border-radius: 18px;
    border: 1.5px solid #fee2e2;
    color: #dc2626; font-size: 0.9rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    animation: fadeInUp 0.4s 0.3s ease both;
  }
  .dark .pp-logout { background: #0f172a; border-color: rgba(239,68,68,0.2); color: #f87171; }
  .pp-logout:hover {
    background: #fff1f2; border-color: #fecaca;
    transform: translateY(-2px); box-shadow: 0 6px 16px rgba(239,68,68,0.12);
  }
  .dark .pp-logout:hover { background: rgba(239,68,68,0.08); }

  /* ── Footer ── */
  .pp-footer {
    text-align: center; padding: 8px 0 16px;
    font-size: 0.72rem; color: #94a3b8;
    animation: fadeInUp 0.4s 0.35s ease both;
  }

  /* ════════════════════════════
     EDIT MODAL — PREMIUM REDESIGN
  ════════════════════════════ */

  .ep-overlay {
    position: fixed; inset: 0;
    background: rgba(2,6,23,0.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 50;
    display: flex; align-items: flex-end; justify-content: center;
    animation: fadeIn 0.25s ease;
  }
  @media(min-width:640px) { .ep-overlay { align-items: center; } }

  .ep-modal {
    background: #fff;
    width: 100%; max-width: 540px;
    max-height: 94vh;
    border-radius: 28px 28px 0 0;
    overflow: hidden;
    display: flex; flex-direction: column;
    animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    box-shadow: 0 -4px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08);
  }
  @media(min-width:640px) {
    .ep-modal { border-radius: 26px; animation: scaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
  }
  .dark .ep-modal { background: #0c1220; box-shadow: 0 -4px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06); }

  /* ── drag pill ── */
  .ep-pill {
    width: 36px; height: 4px; border-radius: 99px;
    background: #e2e8f0; margin: 10px auto 0; flex-shrink: 0;
  }
  .dark .ep-pill { background: #1e293b; }
  @media(min-width:640px) { .ep-pill { display: none; } }

  /* ── Modal header with gradient ── */
  .ep-header {
    flex-shrink: 0; position: relative; overflow: hidden;
    padding: 18px 20px 14px;
    border-bottom: 1px solid #f1f5f9;
    background: #fff;
  }
  .dark .ep-header { background: #0c1220; border-color: #1e293b; }

  /* Subtle top-left glow in header */
  .ep-header::before {
    content: '';
    position: absolute; top: -24px; left: -24px;
    width: 100px; height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .ep-header-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    position: relative; z-index: 1;
  }

  .ep-header-identity { display: flex; align-items: center; gap: 12px; }

  .ep-header-avatar {
    width: 44px; height: 44px; border-radius: 14px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; font-weight: 900; color: #fff;
    box-shadow: 0 4px 12px rgba(217,119,6,0.35); flex-shrink: 0;
  }

  .ep-header-title { font-size: 1.05rem; font-weight: 900; color: #0f172a; letter-spacing: -0.01em; }
  .dark .ep-header-title { color: #f8fafc; }
  .ep-header-sub { font-size: 0.72rem; color: #94a3b8; margin-top: 1px; font-weight: 500; }

  .ep-close-btn {
    width: 34px; height: 34px; border-radius: 50%;
    background: #f1f5f9; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; flex-shrink: 0;
    color: #64748b;
  }
  .dark .ep-close-btn { background: #1e293b; color: #94a3b8; }
  .ep-close-btn:hover { background: #fee2e2; color: #dc2626; transform: rotate(90deg); }
  .dark .ep-close-btn:hover { background: rgba(239,68,68,0.1); color: #f87171; }

  /* ── Tab switcher (Basic / Artist) ── */
  .ep-tabs {
    display: flex; gap: 4px;
    padding: 10px 20px 0;
    border-bottom: 1px solid #f1f5f9;
    flex-shrink: 0; background: #fff;
    position: relative; z-index: 1;
  }
  .dark .ep-tabs { background: #0c1220; border-color: #1e293b; }

  .ep-tab {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 10px 10px;
    font-size: 0.8rem; font-weight: 700;
    background: none; border: none; cursor: pointer;
    color: #94a3b8; transition: color 0.2s;
    position: relative; border-bottom: 2px solid transparent;
    margin-bottom: -1px;
  }
  .ep-tab:hover { color: #d97706; }
  .ep-tab.active { color: #d97706; border-bottom-color: #d97706; }
  .dark .ep-tab { color: #475569; }
  .dark .ep-tab:hover { color: #fbbf24; }
  .dark .ep-tab.active { color: #fbbf24; border-bottom-color: #fbbf24; }

  .ep-tab-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: currentColor; opacity: 0.5;
    flex-shrink: 0;
  }
  .ep-tab.active .ep-tab-dot { opacity: 1; }

  /* ── Body ── */
  .ep-body {
    flex: 1; overflow-y: scroll; padding: 20px;
    display: flex; flex-direction: column; gap: 14px;
    scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent;
  }
  .dark .ep-body { scrollbar-color: #1e293b transparent; }

  /* ── Field group card ── */
  .ep-group {
    background: #f8fafc;
    border: 1.5px solid #f1f5f9;
    border-radius: 18px;
    transition: border-color 0.2s;
  }
  .dark .ep-group { background: #111827; border-color: #1e293b; }
  .ep-group:focus-within { border-color: rgba(217,119,6,0.4); }

  /* ── Field item inside group ── */
  .ep-field {
    padding: 13px 16px;
    border-bottom: 1px solid #f1f5f9;
    position: relative;
  }
  .dark .ep-field { border-color: #1e293b; }
  .ep-field:last-child { border-bottom: none; }

  .ep-field-label {
    display: block; font-size: 0.68rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
    color: #94a3b8; margin-bottom: 5px;
  }
  .dark .ep-field-label { color: #475569; }

  /* ── Input row (icon + input side by side) ── */
  .ep-input-row {
    display: flex; align-items: center; gap: 10px;
  }
  .ep-input-icon-box {
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  /* Bare input — no border, no bg, part of the group */
  .ep-bare-input {
    flex: 1; background: none; border: none; outline: none;
    font-size: 0.9rem; font-weight: 600; color: #0f172a;
    padding: 0; min-width: 0;
    font-family: inherit;
  }
  .dark .ep-bare-input { color: #f1f5f9; }
  .ep-bare-input::placeholder { color: #cbd5e1; font-weight: 400; }
  .dark .ep-bare-input::placeholder { color: #374151; }
  .ep-bare-input:disabled { opacity: 0.45; cursor: not-allowed; }

  .ep-bare-select {
    flex: 1; background: none; border: none; outline: none;
    font-size: 0.9rem; font-weight: 600; color: #0f172a;
    padding: 0; min-width: 0; cursor: pointer;
    font-family: inherit; appearance: none;
  }
  .dark .ep-bare-select { color: #f1f5f9; }
  .ep-bare-select option { background: #fff; color: #0f172a; }
  .dark .ep-bare-select option { background: #1e293b; color: #f1f5f9; }

  .ep-hint {
    font-size: 0.68rem; color: #94a3b8; margin-top: 4px;
    display: flex; align-items: center; gap: 4px;
  }
  .ep-hint.success { color: #16a34a; }
  .dark .ep-hint.success { color: #4ade80; }

  /* ── City dropdown ── */
  .ep-city-drop {
    border: 1.5px solid #e2e8f0; border-radius: 14px;
    max-height: 160px; overflow-y: auto;
    margin-top: 8px; background: #fff;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    animation: slideDown 0.2s ease;
  }
  .dark .ep-city-drop { background: #1e293b; border-color: #334155; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
  @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

  .ep-city-item {
    width: 100%; text-align: left; padding: 10px 14px;
    font-size: 0.85rem; font-weight: 500; color: #334155;
    background: none; border: none; cursor: pointer; transition: all 0.15s;
    border-bottom: 1px solid #f8fafc;
    display: flex; align-items: center; gap: 8px;
  }
  .dark .ep-city-item { color: #94a3b8; border-color: #1e293b; }
  .ep-city-item:last-child { border-bottom: none; }
  .ep-city-item:hover { background: #fffbeb; color: #92400e; padding-left: 18px; }
  .dark .ep-city-item:hover { background: rgba(217,119,6,0.08); color: #fbbf24; }
  .ep-city-item.picked { background: #fef3c7; color: #b45309; font-weight: 700; }
  .dark .ep-city-item.picked { background: rgba(217,119,6,0.12); color: #fcd34d; }

  /* ── Textarea field ── */
  .ep-bare-textarea {
    width: 100%; background: none; border: none; outline: none;
    font-size: 0.9rem; font-weight: 500; color: #0f172a;
    resize: none; line-height: 1.65; min-height: 72px;
    font-family: inherit; padding: 0;
    box-sizing: border-box;
  }
  .dark .ep-bare-textarea { color: #f1f5f9; }
  .ep-bare-textarea::placeholder { color: #cbd5e1; }
  .dark .ep-bare-textarea::placeholder { color: #374151; }

  /* ── Skill chips ── */
  .ep-skills-wrap { display: flex; flex-wrap: wrap; gap: 7px; }
  .ep-skill {
    padding: 6px 13px; border-radius: 99px;
    font-size: 0.75rem; font-weight: 700;
    cursor: pointer; border: 1.5px solid; transition: all 0.18s;
    user-select: none;
  }
  .ep-skill.on {
    background: linear-gradient(135deg, #d97706, #ea580c);
    color: #fff; border-color: transparent;
    box-shadow: 0 3px 10px rgba(217,119,6,0.35);
    transform: scale(1.04);
  }
  .ep-skill.off {
    background: #fff; color: #64748b; border-color: #e2e8f0;
  }
  .dark .ep-skill.off { background: #111827; color: #94a3b8; border-color: #1e293b; }
  .ep-skill.off:hover { border-color: #fde68a; color: #d97706; background: #fffbeb; }
  .dark .ep-skill.off:hover { border-color: #78350f; color: #fbbf24; background: rgba(217,119,6,0.06); }

  /* ── Price input row ── */
  .ep-price-row { display: flex; align-items: center; gap: 0; }
  .ep-price-prefix {
    font-size: 1rem; font-weight: 800; color: #d97706;
    padding-right: 4px; flex-shrink: 0;
    line-height: 1;
  }
  .ep-price-suffix {
    font-size: 0.75rem; color: #94a3b8; margin-left: 8px;
    white-space: nowrap; flex-shrink: 0;
  }

  /* ── Availability cards ── */
  .ep-avail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ep-avail-card {
    padding: 14px 12px; border-radius: 14px;
    border: 2px solid; cursor: pointer; transition: all 0.2s;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    user-select: none;
  }
  .ep-avail-card.green-on {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border-color: #86efac;
    box-shadow: 0 4px 14px rgba(34,197,94,0.2);
  }
  .dark .ep-avail-card.green-on { background: rgba(20,83,45,0.15); border-color: rgba(34,197,94,0.35); }
  .ep-avail-card.red-on {
    background: linear-gradient(135deg, #fff1f2, #fee2e2);
    border-color: #fca5a5;
    box-shadow: 0 4px 14px rgba(239,68,68,0.15);
  }
  .dark .ep-avail-card.red-on { background: rgba(127,29,29,0.15); border-color: rgba(239,68,68,0.35); }
  .ep-avail-card.off-state {
    background: #f8fafc; border-color: #e2e8f0;
  }
  .dark .ep-avail-card.off-state { background: #111827; border-color: #1e293b; }
  .ep-avail-card.off-state:hover { border-color: #cbd5e1; }
  .dark .ep-avail-card.off-state:hover { border-color: #334155; }

  .ep-avail-icon {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem;
  }
  .ep-avail-label { font-size: 0.82rem; font-weight: 800; }
  .ep-avail-desc { font-size: 0.68rem; color: #94a3b8; text-align: center; line-height: 1.3; }

  /* ── Section label ── */
  .ep-section-label {
    font-size: 0.68rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 8px;
    display: flex; align-items: center; gap: 6px;
    padding-left: 2px;
  }
  .ep-section-label span { flex: 1; height: 1px; background: #f1f5f9; margin-left: 4px; }
  .dark .ep-section-label span { background: #1e293b; }

  /* ── Modal footer ── */
  .ep-footer {
    padding: 12px 20px 16px;
    border-top: 1px solid #f1f5f9;
    display: flex; gap: 10px; flex-shrink: 0;
    background: #fff;
  }
  .dark .ep-footer { background: #0c1220; border-color: #1e293b; }

  .ep-cancel {
    padding: 12px 18px;
    background: #f1f5f9; color: #475569;
    border: none; border-radius: 14px;
    font-size: 0.875rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    flex-shrink: 0;
  }
  .dark .ep-cancel { background: #1e293b; color: #94a3b8; }
  .ep-cancel:hover { background: #e2e8f0; color: #334155; }
  .dark .ep-cancel:hover { background: #334155; color: #e2e8f0; }

  .ep-save {
    flex: 1; padding: 13px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    color: #fff; border: none; border-radius: 14px;
    font-size: 0.9rem; font-weight: 800;
    cursor: pointer; transition: all 0.25s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 16px rgba(217,119,6,0.4);
    letter-spacing: 0.01em;
  }
  .ep-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(217,119,6,0.5); }
  .ep-save:active:not(:disabled) { transform: translateY(0); }
  .ep-save:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

  /* ── Success ── */
  .ep-success {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 2.5rem 2rem; gap: 10px; text-align: center;
  }
  .ep-success-icon {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 28px rgba(34,197,94,0.3);
    animation: checkPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    margin-bottom: 4px;
  }
  .ep-success-title { font-size: 1.2rem; font-weight: 900; color: #0f172a; letter-spacing: -0.01em; }
  .dark .ep-success-title { color: #f8fafc; }
  .ep-success-sub { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; max-width: 240px; }
  .ep-success-confetti { font-size: 2rem; animation: float 2s ease-in-out infinite; }
`

export default function ProfilePage() {
  const { currentUserName, currentUserEmail, currentUserId, userRole, switchRole, isArtist, artistChecked, logout, artists, darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const [seedingStatus, setSeedingStatus] = useState('');
  const [seedingProgress, setSeedingProgress] = useState('');
  const sessionInfo = getSessionDebugInfo();
  const myArtistProfile = artists.find(a => a.id === currentUserId);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSelectedState, setEditSelectedState] = useState('');
  const [editSelectedCity, setEditSelectedCity] = useState('');
  const [editCities, setEditCities] = useState<string[]>([]);
  const [editCityLoading, setEditCityLoading] = useState(false);
  const [editCitySearch, setEditCitySearch] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editPriceMin, setEditPriceMin] = useState('');
  const [editAvailability, setEditAvailability] = useState('available');

  const skillOptions = [
    'Sketch', 'Pencil Drawing', 'Charcoal Art', 'Portrait', 'Caricature',
    'Oil Painting', 'Watercolor', 'Acrylic Painting', 'Digital Art', 'Vector Art',
    'Calligraphy', 'Mandala Art', 'Rangoli Design', 'Mehndi Design', 'Wall Mural',
    'Clay Sculpture', 'Wood Carving', 'Paper Craft', 'Handmade Jewelry', 'Embroidery'
  ];

  const handleOpenEdit = async () => {
    setEditName(currentUserName || '');
    setEditPhone(''); setEditSelectedState(''); setEditSelectedCity('');
    setEditBio(''); setEditSkills([]); setEditPriceMin(''); setEditAvailability('available');
    try {
      if (currentUserId) {
        const userDoc = await getDoc(doc(db, 'users', currentUserId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setEditName(data.name || currentUserName || '');
          setEditPhone(data.phone || '');
          if (data.location) {
            const parts = data.location.split(', ');
            if (parts.length === 2) {
              setEditSelectedCity(parts[0]); setEditSelectedState(parts[1]);
              setEditCitySearch(parts[0]);
              const cities = await getCitiesByState(parts[1]);
              setEditCities(cities);
            } else { setEditSelectedState(data.location); }
          }
        }
        if (isArtist) {
          const artistData = await getArtistById(currentUserId);
          if (artistData) {
            setEditBio((artistData as any).bio || '');
            setEditSkills((artistData as any).skills || []);
            setEditPriceMin(String((artistData as any).priceRange?.min || ''));
            setEditAvailability((artistData as any).availability || 'available');
          }
        }
      }
    } catch (err) { console.error('Error loading profile for edit:', err); }
    setShowEditModal(true); setEditSuccess(false);
  };

  const handleEditStateChange = async (state: string) => {
    setEditSelectedState(state); setEditSelectedCity(''); setEditCitySearch('');
    setEditCityLoading(true);
    const cities = await getCitiesByState(state);
    setEditCities(cities); setEditCityLoading(false);
  };

  const toggleEditSkill = (skill: string) => {
    setEditSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSaveEdit = async () => {
    if (!currentUserId) return;
    setEditLoading(true);
    try {
      const location = editSelectedCity && editSelectedState
        ? `${editSelectedCity}, ${editSelectedState}`
        : editSelectedState || '';
      await updateDoc(doc(db, 'users', currentUserId), {
        name: editName.trim(), phone: editPhone.trim(),
        location, updatedAt: new Date().toISOString()
      });
      if (isArtist) {
        try {
          await updateDoc(doc(db, 'artists', currentUserId), {
            name: editName.trim(), location, bio: editBio.trim(),
            skills: editSkills,
            priceRange: { min: parseInt(editPriceMin) || 500, max: (parseInt(editPriceMin) || 500) * 5 },
            availability: editAvailability, updatedAt: new Date().toISOString()
          });
        } catch (err) { console.error('Error updating artist profile:', err); }
      }
      setEditSuccess(true);
      setTimeout(() => { setShowEditModal(false); setEditSuccess(false); window.location.reload(); }, 1800);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally { setEditLoading(false); }
  };

  const filteredEditCities = editCitySearch
    ? editCities.filter(c => c.toLowerCase().includes(editCitySearch.toLowerCase()))
    : editCities;

  const initials = currentUserName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  return (
    <>
      <style>{styles}</style>
      <div className="pp-page">
        <div className="pp-body">

          {/* ── Profile Hero ── */}
          <div className="pp-hero">
            <div className="pp-hero-pattern" />
            <div className="pp-hero-content">
              <div className="pp-avatar">
                <div className="pp-avatar-ring" />
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pp-hero-name">{currentUserName || 'User'}</div>
                <div className="pp-hero-email">{currentUserEmail}</div>
                <div className="pp-mode-badge">
                  {userRole === 'artist' ? '🎨 Artist Mode' : '🛒 Customer Mode'}
                </div>
              </div>
              <button className="pp-edit-btn" onClick={handleOpenEdit}>
                <Edit3 size={13} />
                Edit
              </button>
            </div>
          </div>

          {/* ── Artist Profile Banner ── */}
          {artistChecked && isArtist && (
            <div className="pp-artist-banner" style={{ animationDelay: '0.06s' }}>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="pp-artist-banner-icon">
                  <Palette size={24} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>My Artist Profile</div>
                  {myArtistProfile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      {myArtistProfile.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>
                          <MapPin size={11} />{myArtistProfile.location}
                        </span>
                      )}
                      {myArtistProfile.rating > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>
                          <Star size={11} style={{ fill: '#fbbf24', color: '#fbbf24' }} />
                          {myArtistProfile.rating}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
                    Manage your portfolio, skills & reviews
                  </div>
                </div>
                <button className="pp-artist-view-btn" onClick={() => navigate('/my-artist-profile')}>
                  View →
                </button>
              </div>
            </div>
          )}

          {/* ── Role Switcher ── */}
          {artistChecked && isArtist && (
            <div className="pp-card" style={{ animationDelay: '0.1s' }}>
              <div className="pp-card-header">
                <ArrowRightLeft size={12} /> Switch Mode
              </div>
              <div style={{ padding: '14px' }}>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 10 }}>
                  Toggle between customer and artist experience
                </p>
                <div className="pp-role-switcher">
                  <button
                    className={`pp-role-btn ${userRole === 'customer' ? 'active-customer' : ''}`}
                    onClick={() => switchRole('customer')}
                  >
                    🛒 Customer
                  </button>
                  <button
                    className={`pp-role-btn ${userRole === 'artist' ? 'active-artist' : ''}`}
                    onClick={() => switchRole('artist')}
                  >
                    🎨 Artist
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Become Artist ── */}
          {artistChecked && !isArtist && (
            <div className="pp-become-banner">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: 'linear-gradient(135deg, #d97706, #ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(217,119,6,0.3)'
                }}>
                  <Palette size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }} className="dark:text-gray-100">
                    Become an Artist 🎨
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 5, lineHeight: 1.55 }} className="dark:text-gray-400">
                    Showcase your portfolio, set your pricing, and start receiving custom art requests from customers across India.
                  </div>
                </div>
              </div>
              <button className="pp-become-cta" onClick={() => navigate('/become-artist')}>
                Create Artist Profile →
              </button>
            </div>
          )}

          {/* ── Checking status ── */}
          {!artistChecked && (
            <div className="pp-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid #d97706', borderTopColor: 'transparent' }} className="animate-spin" />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Checking artist profile...</span>
            </div>
          )}

          {/* ── Settings ── */}
          <div className="pp-card" style={{ animationDelay: '0.14s' }}>
            <div className="pp-card-header">
              <User size={12} /> Account
            </div>
            <button className="pp-settings-row" onClick={handleOpenEdit}>
              <div className="pp-settings-icon-wrap" style={{ background: '#eff6ff' }}>
                <Edit3 size={16} color="#3b82f6" />
              </div>
              <span className="pp-settings-label">Edit Profile</span>
              <ChevronRight size={15} color="#cbd5e1" />
            </button>
            <button className="pp-settings-row" onClick={() => navigate('/notifications')}>
              <div className="pp-settings-icon-wrap" style={{ background: '#fef3c7' }}>
                <Bell size={16} color="#d97706" />
              </div>
              <span className="pp-settings-label">Notifications</span>
              <ChevronRight size={15} color="#cbd5e1" />
            </button>
          </div>

          <div className="pp-card" style={{ animationDelay: '0.18s' }}>
            <div className="pp-card-header">
              <Shield size={12} /> Preferences
            </div>
            <div className="pp-settings-row" onClick={toggleDarkMode} style={{ cursor: 'pointer' }}>
              <div className="pp-settings-icon-wrap" style={{ background: darkMode ? '#1e293b' : '#f8fafc' }}>
                {darkMode ? <Moon size={16} color="#818cf8" /> : <Sun size={16} color="#f59e0b" />}
              </div>
              <span className="pp-settings-label">Dark Mode</span>
              <button className={`pp-toggle ${darkMode ? 'on' : 'off'}`} onClick={e => { e.stopPropagation(); toggleDarkMode(); }}>
                <div className="pp-toggle-dot" />
              </button>
            </div>
          </div>

          {/* ── Logout ── */}
          <button className="pp-logout" onClick={logout}>
            <LogOut size={18} />
            Sign Out
          </button>

          {/* ── Footer ── */}
          <div className="pp-footer">
            HunarHub v1.0.0 · Made with ❤️ in India
          </div>

        </div>

        {/* ════════════════════════════════
            EDIT PROFILE MODAL — PREMIUM
        ════════════════════════════════ */}
        {showEditModal && (
          <div className="ep-overlay" onClick={() => setShowEditModal(false)}>
            <div className="ep-modal" onClick={e => e.stopPropagation()}>

              {/* Drag pill */}
              <div className="ep-pill" />

              {/* ── Header ── */}
              <div className="ep-header">
                <div className="ep-header-row">
                  <div className="ep-header-identity">
                    <div className="ep-header-avatar">{initials}</div>
                    <div>
                      <div className="ep-header-title">Edit Profile</div>
                      <div className="ep-header-sub">{currentUserName}</div>
                    </div>
                  </div>
                  <button className="ep-close-btn" onClick={() => setShowEditModal(false)}>
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* ── Tab bar (only if artist) ── */}
              {isArtist && !editSuccess && (
                <div className="ep-tabs">
                  <button className="ep-tab active">
                    <div className="ep-tab-dot" />
                    Personal Info
                  </button>
                  <button className="ep-tab active" style={{ color: '#d97706' }}>
                    <div className="ep-tab-dot" />
                    Artist Details
                  </button>
                </div>
              )}

              {/* ── Success ── */}
              {editSuccess ? (
                <div className="ep-success">
                  <div className="ep-success-confetti">🎉</div>
                  <div className="ep-success-icon">
                    <CheckCircle size={36} color="#16a34a" />
                  </div>
                  <div className="ep-success-title">Profile Updated!</div>
                  <div className="ep-success-sub">Your changes have been saved. The page will refresh shortly.</div>
                </div>
              ) : (
                <>
                  {/* ── Body ── */}
                  <div className="ep-body">

                    {/* ─── PERSONAL INFO ─── */}
                    <div className="ep-section-label">
                      <User size={11} /> Personal Information <span />
                    </div>

                    {/* Name + Phone in group */}
                    <div className="ep-group">
                      {/* Name */}
                      <div className="ep-field">
                        <label className="ep-field-label">Full Name</label>
                        <div className="ep-input-row">
                          <div className="ep-input-icon-box" style={{ background: '#eff6ff' }}>
                            <User size={14} color="#3b82f6" />
                          </div>
                          <input
                            className="ep-bare-input"
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="ep-field" style={{ opacity: 0.65 }}>
                        <label className="ep-field-label">Email Address <span style={{ color: '#94a3b8', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>· cannot be changed</span></label>
                        <div className="ep-input-row">
                          <div className="ep-input-icon-box" style={{ background: '#f1f5f9' }}>
                            <Mail size={14} color="#94a3b8" />
                          </div>
                          <input className="ep-bare-input" type="email" value={currentUserEmail} disabled />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="ep-field">
                        <label className="ep-field-label">Phone Number</label>
                        <div className="ep-input-row">
                          <div className="ep-input-icon-box" style={{ background: '#f0fdf4' }}>
                            <Phone size={14} color="#16a34a" />
                          </div>
                          <input
                            className="ep-bare-input"
                            type="tel"
                            value={editPhone}
                            onChange={e => setEditPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location group */}
                    <div className="ep-section-label" style={{ marginTop: 4 }}>
                      <MapPin size={11} /> Location <span />
                    </div>

                    <div className="ep-group">
                      {/* State */}
                      <div className="ep-field">
                        <label className="ep-field-label">State</label>
                        <div className="ep-input-row">
                          <div className="ep-input-icon-box" style={{ background: '#fdf4ff' }}>
                            <MapPin size={14} color="#a855f7" />
                          </div>
                          <select
                            className="ep-bare-select"
                            value={editSelectedState}
                            onChange={e => handleEditStateChange(e.target.value)}
                          >
                            <option value="">Select state…</option>
                            {getIndianStates().map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* City */}
                      {editSelectedState && (
                        <div className="ep-field">
                          <label className="ep-field-label">City</label>
                          {editCityLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                              <Loader2 size={14} className="animate-spin" style={{ color: '#d97706' }} />
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Loading cities…</span>
                            </div>
                          ) : (
                            <>
                              <div className="ep-input-row">
                                <div className="ep-input-icon-box" style={{ background: '#fff7ed' }}>
                                  <Search size={14} color="#f97316" />
                                </div>
                                <input
                                  className="ep-bare-input"
                                  type="text"
                                  value={editCitySearch}
                                  onChange={e => { setEditCitySearch(e.target.value); if (editSelectedCity && e.target.value !== editSelectedCity) setEditSelectedCity(''); }}
                                  placeholder="Search city…"
                                />
                                {editSelectedCity && (
                                  <button
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: '#94a3b8' }}
                                    onClick={() => { setEditSelectedCity(''); setEditCitySearch(''); }}
                                  >
                                    <X size={13} />
                                  </button>
                                )}
                              </div>
                              {editCitySearch && !editSelectedCity && filteredEditCities.length > 0 && (
                                <div className="ep-city-drop">
                                  {filteredEditCities.slice(0, 20).map(city => (
                                    <button
                                      key={city}
                                      className={`ep-city-item ${editSelectedCity === city ? 'picked' : ''}`}
                                      onClick={() => { setEditSelectedCity(city); setEditCitySearch(city); }}
                                    >
                                      <MapPin size={11} style={{ flexShrink: 0, opacity: 0.5 }} />
                                      {city}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {editSelectedCity && (
                                <div className="ep-hint success" style={{ marginTop: 6 }}>
                                  <CheckCircle size={11} />
                                  {editSelectedCity}, {editSelectedState}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ─── ARTIST INFO ─── */}
                    {isArtist && (
                      <>
                        <div className="ep-section-label" style={{ marginTop: 4 }}>
                          <Palette size={11} /> Artist Details <span />
                        </div>

                        {/* Bio */}
                        <div className="ep-group">
                          <div className="ep-field">
                            <label className="ep-field-label">
                              Bio / About You
                              <span style={{ marginLeft: 'auto', fontWeight: 500, textTransform: 'none', letterSpacing: 0, float: 'right', color: editBio.length > 270 ? '#ef4444' : '#94a3b8' }}>
                                {editBio.length}/300
                              </span>
                            </label>
                            <textarea
                              className="ep-bare-textarea"
                              rows={3}
                              value={editBio}
                              onChange={e => setEditBio(e.target.value.slice(0, 300))}
                              placeholder="Describe your art style, experience, what makes your work unique…"
                            />
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="ep-group">
                          <div className="ep-field">
                            <label className="ep-field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>Skills & Expertise</span>
                              {editSkills.length > 0 && (
                                <span style={{
                                  padding: '2px 9px', borderRadius: 99,
                                  background: 'linear-gradient(135deg, #d97706, #ea580c)',
                                  color: '#fff', fontSize: '0.62rem', fontWeight: 800
                                }}>
                                  {editSkills.length} selected
                                </span>
                              )}
                            </label>
                            <div className="ep-skills-wrap" style={{ marginTop: 6 }}>
                              {skillOptions.map(skill => (
                                <button
                                  key={skill}
                                  className={`ep-skill ${editSkills.includes(skill) ? 'on' : 'off'}`}
                                  onClick={() => toggleEditSkill(skill)}
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Price + Availability */}
                        <div className="ep-group">
                          {/* Price */}
                          <div className="ep-field">
                            <label className="ep-field-label">Starting Price</label>
                            <div className="ep-input-row">
                              <div className="ep-input-icon-box" style={{ background: '#fffbeb' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#d97706' }}>₹</span>
                              </div>
                              <div className="ep-price-row" style={{ flex: 1 }}>
                                <input
                                  className="ep-bare-input"
                                  type="number"
                                  value={editPriceMin}
                                  onChange={e => setEditPriceMin(e.target.value)}
                                  placeholder="500"
                                  style={{ flex: 1 }}
                                />
                                {editPriceMin && parseInt(editPriceMin) > 0 && (
                                  <span className="ep-price-suffix">
                                    → max ~₹{(parseInt(editPriceMin) * 5).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Availability */}
                          <div className="ep-field">
                            <label className="ep-field-label">Availability Status</label>
                            <div className="ep-avail-grid" style={{ marginTop: 8 }}>
                              <button
                                className={`ep-avail-card ${editAvailability === 'available' ? 'green-on' : 'off-state'}`}
                                onClick={() => setEditAvailability('available')}
                              >
                                <div className="ep-avail-icon" style={{ background: editAvailability === 'available' ? 'rgba(34,197,94,0.15)' : '#f1f5f9' }}>
                                  🟢
                                </div>
                                <div className="ep-avail-label" style={{ color: editAvailability === 'available' ? '#15803d' : '#94a3b8' }}>
                                  Available
                                </div>
                                <div className="ep-avail-desc">Ready for new orders</div>
                              </button>
                              <button
                                className={`ep-avail-card ${editAvailability === 'busy' ? 'red-on' : 'off-state'}`}
                                onClick={() => setEditAvailability('busy')}
                              >
                                <div className="ep-avail-icon" style={{ background: editAvailability === 'busy' ? 'rgba(239,68,68,0.1)' : '#f1f5f9' }}>
                                  🔴
                                </div>
                                <div className="ep-avail-label" style={{ color: editAvailability === 'busy' ? '#b91c1c' : '#94a3b8' }}>
                                  Busy
                                </div>
                                <div className="ep-avail-desc">Not taking new orders</div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Spacer so footer doesn't hide last field */}
                    <div style={{ height: 4 }} />
                  </div>

                  {/* ── Footer ── */}
                  <div className="ep-footer">
                    <button className="ep-cancel" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button
                      className="ep-save"
                      onClick={handleSaveEdit}
                      disabled={editLoading || !editName.trim()}
                    >
                      {editLoading
                        ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                        : <><Save size={16} /> Save Changes</>
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}