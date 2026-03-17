// src/pages/BranchAssetsMasterReport.jsx
import { useNavigate, useLocation } from "react-router-dom";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Footer from "../components/Layout/Footer";
import Alert from "../components/common/Alert";
import AddAssetModal from "../components/AddModel/AddAssetModal";
import Pagination from "../components/common/Pagination";
import AssetHistoryModal from '../components/History/AssetHistoryModal';
import "../styles/Pages.css";
import * as XLSX from "xlsx";
import EXCEL_HEADERS from "../utils/excelHeaders";
import NepalLifeLogo from "../assets/nepallife.png";

/* ─── Fonts ─── */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
`;

/* ─── Nepal Life brand colors ─── */
const NL_BLUE    = "#0B5CAB";
const NL_BLUE2   = "#1474F3";
const NL_RED     = "#f31225ef";
const NL_GRADIENT = `linear-gradient(135deg, ${NL_BLUE} 0%, ${NL_BLUE2} 55%, ${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg, ${NL_BLUE} 82.8%, ${NL_RED} 17.2%)`;

/* ─── Fully Responsive Styles ─── */
const REPORT_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  :root {
    --nl-blue:${NL_BLUE};
    --nl-blue2:${NL_BLUE2};
    --nl-red:${NL_RED};
    --blue-50:#eff6ff;--blue-100:#dbeafe;--blue-200:#bfdbfe;
    --blue-500:#3b82f6;--blue-600:#2563eb;--blue-700:#1d4ed8;
    --green-50:#f0fdf4;--green-100:#dcfce7;--green-200:#bbf7d0;
    --green-500:#22c55e;--green-600:#16a34a;--green-700:#15803d;
    --amber-50:#fffbeb;--amber-100:#fef3c7;--amber-500:#f59e0b;--amber-600:#d97706;
    --red-50:#fef2f2;--red-100:#fee2e2;--red-500:#ef4444;--red-600:#dc2626;
    --purple-50:#f5f3ff;--purple-100:#ede9fe;--purple-500:#8b5cf6;--purple-600:#7c3aed;
    --teal-50:#f0fdfa;--teal-100:#ccfbf1;--teal-500:#14b8a6;--teal-600:#0d9488;
    --gray-50:#f9fafb;--gray-100:#f3f4f6;--gray-200:#e5e7eb;
    --gray-300:#d1d5db;--gray-400:#9ca3af;--gray-500:#6b7280;
    --gray-600:#4b5563;--gray-700:#374151;--gray-800:#1f2937;--gray-900:#111827;
    --white:#ffffff;
    --shadow-sm:0 1px 2px rgba(0,0,0,0.05);
    --shadow:0 1px 3px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.05);
    --shadow-md:0 4px 6px rgba(0,0,0,0.06),0 10px 24px rgba(0,0,0,0.08);
    --shadow-lg:0 8px 16px rgba(0,0,0,0.08),0 24px 48px rgba(0,0,0,0.1);
    --radius:10px;--radius-lg:14px;--radius-xl:18px;
    /* Fluid spacing tokens */
    --space-xs: clamp(4px, 0.5vw, 8px);
    --space-sm: clamp(8px, 1vw, 14px);
    --space-md: clamp(12px, 1.5vw, 20px);
    --space-lg: clamp(16px, 2vw, 28px);
    --space-xl: clamp(20px, 2.5vw, 36px);
    --space-2xl: clamp(24px, 3vw, 48px);
    /* Fluid font sizes */
    --text-xs: clamp(9px, 0.8vw, 11px);
    --text-sm: clamp(11px, 1vw, 13px);
    --text-base: clamp(12px, 1.1vw, 14px);
    --text-lg: clamp(14px, 1.4vw, 17px);
    --text-xl: clamp(16px, 1.8vw, 22px);
    --text-2xl: clamp(20px, 2.4vw, 30px);
    --text-3xl: clamp(24px, 3vw, 40px);
  }

  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
  @keyframes shimmer{from{background-position:-200% 0}to{background-position:200% 0}}
  @keyframes bounceIn{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
  @keyframes statCountUp{from{transform:scale(0.8);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes slideInLeft{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(11,92,171,0.0)}50%{box-shadow:0 0 0 6px rgba(11,92,171,0.10)}}

  /* ═══════════════════════════════
     HERO — Fully Fluid & Responsive
  ═══════════════════════════════ */
  .nl-hero-compact {
    position: relative;
    background: linear-gradient(135deg,
      rgba(11,92,171,0.07) 0%,
      rgba(255,255,255,0.95) 45%,
      rgba(243,18,37,0.05) 100%);
    overflow: hidden;
    border-bottom: 1px solid rgba(11,92,171,0.10);
  }
  .nl-hero-compact::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 12% 55%, rgba(20,116,243,0.13) 0%, transparent 50%),
      radial-gradient(ellipse at 88% 35%, rgba(243,18,37,0.09) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 100%, rgba(11,92,171,0.05) 0%, transparent 60%);
    pointer-events: none;
  }
  /* Decorative grid pattern */
  .nl-hero-compact::after {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(11,92,171,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(11,92,171,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    mask-image: radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%);
  }

  .nl-hero-inner-compact {
    position: relative; z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    flex-wrap: wrap;
  }

  .nl-hero-left { flex: 1; min-width: 240px; }

  .nl-logo-wrap {
    position: relative;
    flex-shrink: 0;
  }
  .nl-logo-compact {
    width: clamp(56px, 7vw, 88px);
    height: auto;
    display: block;
    filter: drop-shadow(0 6px 16px rgba(2,32,53,0.22));
    animation: floaty 5s ease-in-out infinite;
  }
  .nl-logo-badge {
    position: absolute;
    bottom: -4px; right: -4px;
    width: clamp(18px, 2vw, 24px);
    height: clamp(18px, 2vw, 24px);
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: 2px solid white;
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(9px, 1vw, 12px);
    box-shadow: 0 2px 8px rgba(22,163,74,0.4);
  }

  .nl-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, rgba(11,92,171,0.12), rgba(20,116,243,0.08));
    border: 1px solid rgba(11,92,171,0.18);
    border-radius: 999px;
    padding: 3px 10px;
    font-size: var(--text-xs);
    font-weight: 800;
    color: ${NL_BLUE};
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-family: Outfit, sans-serif;
    margin-bottom: var(--space-xs);
    animation: slideInLeft 0.4s ease both;
  }
  .nl-eyebrow-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${NL_BLUE};
    animation: pulse 2s ease infinite;
  }

  .nl-title-compact {
    font-family: Syne, sans-serif;
    font-weight: 900;
    font-size: clamp(1.15rem, 2.8vw, 1.9rem);
    letter-spacing: -0.03em;
    margin: 0 0 var(--space-xs) 0;
    color: #0F172A;
    line-height: 1.1;
    animation: fadeUp 0.35s ease 0.1s both;
  }
  .nl-title-compact .blue { color: ${NL_BLUE}; }
  .nl-title-compact .red { color: ${NL_RED}; }

  .nl-divider-sm {
    width: clamp(28px, 4vw, 44px);
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, ${NL_BLUE}, ${NL_RED});
    margin: var(--space-xs) 0;
  }

  .nl-slogan {
    font-size: var(--text-xs);
    color: rgba(15,23,42,0.45);
    font-weight: 700;
    letter-spacing: 0.04em;
    font-family: Outfit, sans-serif;
    margin-bottom: var(--space-sm);
    animation: fadeUp 0.35s ease 0.2s both;
  }

  /* Hero Stats — fluid grid */
  .nl-hero-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(80px, 10vw, 110px), 1fr));
    gap: clamp(6px, 1vw, 12px);
    max-width: 560px;
    animation: fadeUp 0.35s ease 0.25s both;
  }

  .nl-stat {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: clamp(8px, 1.2vw, 14px) clamp(10px, 1.5vw, 18px);
    border-radius: clamp(8px, 1vw, 14px);
    background: rgba(255,255,255,0.85);
    border: 1.5px solid rgba(11,92,171,0.12);
    box-shadow: 0 2px 8px rgba(11,92,171,0.07), inset 0 1px 0 rgba(255,255,255,0.9);
    transition: all 0.2s ease;
    animation: statCountUp 0.4s ease both;
    position: relative;
    overflow: hidden;
  }
  .nl-stat::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--stat-accent, ${NL_BLUE});
    border-radius: 0 0 4px 4px;
  }
  .nl-stat:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(11,92,171,0.14);
    border-color: rgba(11,92,171,0.22);
  }
  .nl-stat-icon {
    font-size: clamp(14px, 1.5vw, 18px);
    margin-bottom: 4px;
    line-height: 1;
  }
  .nl-stat-num {
    font-family: Syne, sans-serif;
    font-weight: 800;
    font-size: clamp(1.1rem, 2.2vw, 1.6rem);
    background: ${NL_GRADIENT};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    display: block;
  }
  .nl-stat-label {
    font-size: clamp(8px, 0.8vw, 10px);
    font-weight: 700;
    color: var(--gray-400);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-top: 3px;
    font-family: Outfit, sans-serif;
  }
  .nl-stat-sub {
    font-size: clamp(8px, 0.75vw, 9px);
    color: var(--gray-300);
    font-family: Outfit, sans-serif;
    margin-top: 1px;
  }

  /* System Status Strip */
  .nl-status-strip {
    display: flex;
    align-items: center;
    gap: clamp(8px, 1.5vw, 20px);
    flex-wrap: wrap;
    padding: clamp(6px, 0.8vw, 10px) var(--space-lg);
    background: rgba(15,23,42,0.03);
    border-top: 1px solid rgba(11,92,171,0.08);
    position: relative; z-index: 1;
  }
  .nl-status-dot {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--gray-500);
    font-family: Outfit, sans-serif;
  }
  .nl-status-dot::before {
    content: '';
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--dot-color, #22c55e);
    box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
    animation: pulse 2s ease infinite;
    flex-shrink: 0;
  }

  /* ── Toggle Panel ── */
  .panel-toggle-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: clamp(8px, 1vw, 12px) clamp(12px, 1.5vw, 20px);
    background: white;
    border: 1.5px solid var(--gray-200);
    border-radius: 14px;
    box-shadow: var(--shadow-sm);
    gap: clamp(8px, 1vw, 14px);
    flex-wrap: wrap;
    animation: fadeUp .3s ease both;
  }
  .toggle-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: clamp(5px, 0.6vw, 8px) clamp(10px, 1.5vw, 18px);
    border-radius: 999px;
    font-size: var(--text-sm);
    font-weight: 700;
    border: 1.5px solid;
    cursor: pointer;
    transition: all .18s ease;
    font-family: Outfit, sans-serif;
    letter-spacing: .02em;
    user-select: none;
  }
  .toggle-pill.active {
    background: ${NL_BLUE};
    border-color: ${NL_BLUE};
    color: white;
    box-shadow: 0 4px 14px rgba(11,92,171,0.3);
  }
  .toggle-pill.inactive {
    background: white;
    border-color: var(--gray-200);
    color: var(--gray-600);
  }
  .toggle-pill:hover:not(.active) {
    background: var(--blue-50);
    border-color: var(--blue-200);
    color: ${NL_BLUE};
  }

  /* ── Collapsible Panel ── */
  .collapsible-panel {
    overflow: hidden;
    transition: max-height .4s cubic-bezier(0.4,0,0.2,1), opacity .3s ease;
    max-height: 0; opacity: 0;
  }
  .collapsible-panel.open { max-height: 800px; opacity: 1; }

  /* Layout */
  .ar-root { font-family:'DM Sans',sans-serif; background:var(--gray-50); min-height:100vh; color:var(--gray-900); }
  .ar-layout { display:flex; min-height:100vh; }

  .rpt-sidebar {
    background: linear-gradient(170deg,#0f172a 0%,#1e3a5f 50%,#0d2137 100%);
    border-right: 1px solid rgba(59,130,246,0.15);
    box-shadow: 6px 0 32px rgba(0,0,0,0.28);
    position: relative; overflow: hidden;
  }
  .rpt-sidebar::before { content:''; position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%); pointer-events:none; }
  .rpt-sidebar::after { content:''; position:absolute; bottom:-40px; left:-40px; width:160px; height:160px; border-radius:50%; background:radial-gradient(circle,rgba(34,197,94,0.10) 0%,transparent 70%); pointer-events:none; }

  .rpt-nav-btn { width:100%; text-align:left; padding:10px 14px; border-radius:12px; background:transparent; border:1px solid transparent; color:rgba(255,255,255,0.55); font-size:13.5px; font-weight:500; cursor:pointer; transition:all 0.22s cubic-bezier(0.4,0,0.2,1); display:flex; align-items:center; gap:10px; font-family:'DM Sans',sans-serif; letter-spacing:0.01em; }
  .rpt-nav-btn:hover { background:linear-gradient(135deg,rgba(59,130,246,0.15),rgba(34,197,94,0.08)); border-color:rgba(59,130,246,0.25); color:#93c5fd; transform:translateX(4px); }
  .rpt-nav-btn.active { background:linear-gradient(135deg,rgba(59,130,246,0.25),rgba(34,197,94,0.12)); border-color:rgba(59,130,246,0.4); color:#60a5fa; }

  .rpt-main { background:#f8fafc; position:relative; }

  /* Filter Panel */
  .rpt-label { display:block; font-size:var(--text-xs); font-weight:800; color:#475569; letter-spacing:.10em; text-transform:uppercase; margin-bottom:7px; font-family:"Outfit",sans-serif; }
  .search-wrapper { position:relative; width:100%; }
  .search-wrapper svg { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
  .rpt-input,.rpt-select { width:100%; padding:clamp(8px,0.9vw,11px) clamp(10px,1vw,14px); border-radius:12px; border:1.5px solid #e2e8f0; background:#fff; font-size:var(--text-sm); color:#0f172a; outline:none; transition:all .18s ease; box-shadow:0 1px 2px rgba(15,23,42,.04); }
  .rpt-input::placeholder { color:#94a3b8; }
  .rpt-input:focus,.rpt-select:focus { border-color:#60a5fa; box-shadow:0 0 0 3px rgba(59,130,246,.10); }
  .rpt-select { cursor:pointer; appearance:none; padding-right:36px; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:calc(100% - 12px) center; }
  .filter-panel { position:relative; background:#ffffff; border-radius:0 0 18px 18px; border:1.5px solid #e2e8f0; border-top:none; box-shadow:0 10px 30px rgba(15,23,42,.06); padding:clamp(14px,2vw,22px) clamp(16px,2.5vw,26px); }

  /* Active filter chips */
  .active-filter-chip { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:999px; font-size:var(--text-xs); font-weight:700; background:${NL_BLUE}; color:white; font-family:Outfit,sans-serif; }
  .active-filter-chip button { background:none; border:none; color:rgba(255,255,255,0.7); cursor:pointer; padding:0; font-size:13px; line-height:1; display:flex; align-items:center; }
  .active-filter-chip button:hover { color:white; }

  /* Buttons */
  .rpt-btn { display:inline-flex; align-items:center; justify-content:flex-start; gap:7px; padding:clamp(8px,0.9vw,11px) clamp(10px,1.2vw,15px); border-radius:13px; font-size:var(--text-sm); font-weight:800; border:1.5px solid transparent; cursor:pointer; transition:all .18s ease; font-family:"Outfit",sans-serif; letter-spacing:.01em; line-height:1; user-select:none; }
  .rpt-btn:hover { transform:translateY(-1px); } .rpt-btn:active { transform:scale(.98); } .rpt-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }
  .btn-success { background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; box-shadow:0 6px 18px rgba(34,197,94,.22); }
  .btn-slate { background:#0f172a; color:#e2e8f0; border-color:rgba(255,255,255,.10); box-shadow:0 6px 18px rgba(15,23,42,.20); }
  .btn-outline { background:#fff; border-color:#bfdbfe; color:#2563eb; box-shadow:0 1px 2px rgba(15,23,42,.04); }

  /* Summary bar */
  .summary-bar { position:relative; background:linear-gradient(135deg,#eff6ff,#f0fdf4); border:1.5px solid #bfdbfe; border-radius:0 0 14px 14px; padding:clamp(10px,1.2vw,16px) clamp(14px,2vw,24px); box-shadow:0 6px 18px rgba(15,23,42,.05); }
  .chip { display:inline-flex; align-items:center; padding:5px 11px; border-radius:999px; font-size:var(--text-xs); font-weight:900; font-family:"Outfit",sans-serif; letter-spacing:.01em; border:1px solid rgba(0,0,0,.06); background:#fff; color:#0f172a; box-shadow:0 1px 2px rgba(15,23,42,.04); white-space:nowrap; }

  /* Main content */
  .ar-main { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
  .ar-topbar { background:var(--white); border-bottom:1px solid var(--gray-200); padding:clamp(8px,1vw,13px) clamp(12px,1.8vw,22px); display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; position:sticky; top:0; z-index:30; box-shadow:var(--shadow-sm); }
  .ar-topbar-left { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
  .ar-topbar-center { text-align:center; flex:1; min-width:140px; }
  .ar-topbar-right { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .ar-page-title { font-family:Syne,sans-serif; font-weight:800; font-size:clamp(1.05rem,2.2vw,1.45rem); color:var(--gray-900); margin:0; letter-spacing:-0.02em; }
  .ar-page-sub { font-size:var(--text-xs); color:var(--gray-400); margin-top:2px; }
  .ar-content { flex:1; padding:clamp(10px,1.5vw,18px) clamp(12px,2vw,22px); overflow-y:auto; }

  /* Buttons */
  .ar-btn { display:inline-flex; align-items:center; gap:5px; padding:clamp(6px,0.7vw,9px) clamp(10px,1.2vw,16px); border-radius:var(--radius); font-weight:600; font-size:var(--text-sm); border:none; cursor:pointer; transition:all 0.18s ease; white-space:nowrap; font-family:'Outfit',sans-serif; letter-spacing:0.01em; line-height:1; }
  .ar-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .ar-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .ar-btn:active:not(:disabled) { transform:scale(0.98); }
  .ar-btn-primary { background:${NL_BLUE}; color:white; box-shadow:0 2px 8px rgba(11,92,171,0.28); }
  .ar-btn-primary:hover:not(:disabled) { background:#0a4f96; }
  .ar-btn-success { background:var(--green-600); color:white; box-shadow:0 2px 8px rgba(22,163,74,0.22); }
  .ar-btn-success:hover:not(:disabled) { background:var(--green-700); }
  .ar-btn-amber { background:var(--amber-500); color:white; }
  .ar-btn-amber:hover:not(:disabled) { background:var(--amber-600); }
  .ar-btn-red { background:var(--red-600); color:white; }
  .ar-btn-red:hover:not(:disabled) { background:#b91c1c; }
  .ar-btn-purple { background:var(--purple-600); color:white; }
  .ar-btn-purple:hover:not(:disabled) { background:#6d28d9; }
  .ar-btn-teal { background:#0d9488; color:white; }
  .ar-btn-teal:hover:not(:disabled) { background:#0f766e; }
  .ar-btn-white { background:white; border:1.5px solid var(--gray-200); color:var(--gray-700); box-shadow:var(--shadow-sm); }
  .ar-btn-white:hover:not(:disabled) { border-color:${NL_BLUE}; color:${NL_BLUE}; background:#eff6ff; }
  .ar-btn-ghost { background:transparent; border:1.5px solid var(--gray-200); color:var(--gray-600); }
  .ar-btn-ghost:hover:not(:disabled) { background:var(--gray-100); }
  .ar-btn-blue-outline { background:#eff6ff; border:1.5px solid #bfdbfe; color:${NL_BLUE}; }
  .ar-btn-blue-outline:hover:not(:disabled) { background:#dbeafe; }
  .ar-btn-green-outline { background:var(--green-50); border:1.5px solid var(--green-200); color:var(--green-700); }
  .ar-btn-sm { padding:clamp(5px,0.55vw,7px) clamp(8px,1vw,13px); font-size:var(--text-xs); }
  .ar-btn-icon { width:clamp(30px,3vw,36px); height:clamp(30px,3vw,36px); padding:0; justify-content:center; }

  /* Table */
  .ar-table-card { background:white; border-radius:var(--radius-xl); border:1.5px solid var(--gray-200); box-shadow:var(--shadow); overflow:hidden; animation:fadeUp 0.35s ease both; margin-bottom:0; }
  .ar-table { width:100%; border-collapse:collapse; }
  .ar-table thead th { padding:clamp(9px,1.1vw,13px) clamp(10px,1.4vw,16px); text-align:left; font-size:var(--text-xs); font-weight:700; color:rgba(255,255,255,0.95); text-transform:uppercase; letter-spacing:0.09em; white-space:nowrap; font-family:'Outfit',sans-serif; cursor:pointer; user-select:none; transition:background 0.12s; }
  .ar-table thead th:hover { background:rgba(255,255,255,0.12); }
  .ar-table thead th.sorted { background:rgba(255,255,255,0.16); }
  .ar-table tbody tr { border-bottom:1px solid var(--gray-100); transition:background 0.12s; }
  .ar-table tbody tr:last-child { border-bottom:none; }
  .ar-table tbody tr:hover { background:#eff6ff; }
  .ar-table tbody td { padding:clamp(9px,1vw,12px) clamp(10px,1.4vw,16px); font-size:var(--text-sm); color:var(--gray-700); }
  .ar-table th,.ar-table td { border-right:0.5px solid rgba(0,0,0,0.08); border-bottom:1px solid #e2e8f0; }
  .ar-table th:last-child,.ar-table td:last-child { border-right:none; }

  /* Badges */
  .ar-badge { display:inline-flex; align-items:center; padding:2px 7px; border-radius:6px; font-size:var(--text-xs); font-weight:700; font-family:'Outfit',sans-serif; }
  .ar-badge-blue { background:#eff6ff; color:${NL_BLUE}; border:1px solid #bfdbfe; }
  .ar-badge-green { background:var(--green-50); color:var(--green-700); border:1px solid var(--green-200); }
  .ar-badge-gray { background:var(--gray-100); color:var(--gray-600); border:1px solid var(--gray-200); }
  .ar-badge-amber { background:var(--amber-50); color:var(--amber-600); border:1px solid var(--amber-100); }
  .ar-badge-purple { background:var(--purple-50); color:var(--purple-600); border:1px solid var(--purple-100); }
  .ar-badge-red { background:var(--red-50); color:var(--red-600); border:1px solid var(--red-100); }
  .ar-badge-teal { background:var(--teal-50); color:var(--teal-600); border:1px solid var(--teal-100); }

  /* Status pill */
  .ar-status { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:999px; font-size:var(--text-xs); font-weight:700; font-family:'Outfit',sans-serif; border:1.5px solid; }
  .ar-status::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
  .ar-status-active { color:var(--green-700); border-color:var(--green-200); background:var(--green-50); }
  .ar-status-inactive { color:var(--red-600); border-color:var(--red-100); background:var(--red-50); }
  .ar-status-repair { color:var(--amber-600); border-color:var(--amber-100); background:var(--amber-50); }
  .ar-status-default { color:var(--gray-500); border-color:var(--gray-200); background:var(--gray-50); }

  /* ═══ DETAIL OVERLAY ═══ */
  .ar-detail-overlay { position:fixed; inset:0; z-index:9999; background:rgba(2,8,23,0.72); backdrop-filter:blur(12px); overflow-y:auto; padding:clamp(10px,2vw,20px); animation:fadeIn 0.2s ease; display:flex; align-items:flex-start; justify-content:center; }
  .ar-detail-panel { max-width:1080px; width:100%; margin:0 auto; background:white; border-radius:20px; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,0.3),0 0 0 1px rgba(255,255,255,0.1); animation:bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both; border:1.5px solid var(--gray-200); }

  /* Detail Header */
  .ar-detail-header { background:${NL_GRADIENT_90}; position:relative; padding:clamp(16px,2vw,22px) clamp(18px,2.5vw,26px); overflow:hidden; }
  .ar-detail-header::after { content:''; position:absolute; top:-40px; right:-40px; width:160px; height:160px; border-radius:50%; background:rgba(255,255,255,0.06); pointer-events:none; }

  /* Tabs */
  .detail-tabs { display:flex; gap:2px; background:rgba(0,0,0,0.2); border-radius:12px; padding:4px; margin-top:clamp(10px,1.2vw,15px); }
  .detail-tab { flex:1; padding:clamp(6px,0.8vw,9px) clamp(8px,1vw,14px); border-radius:9px; font-size:var(--text-xs); font-weight:700; color:rgba(255,255,255,0.6); border:none; background:transparent; cursor:pointer; transition:all .18s ease; font-family:Outfit,sans-serif; text-align:center; display:flex; align-items:center; justify-content:center; gap:5px; }
  .detail-tab:hover { color:rgba(255,255,255,0.88); background:rgba(255,255,255,0.08); }
  .detail-tab.active { background:white; color:${NL_BLUE}; box-shadow:0 2px 8px rgba(0,0,0,0.15); }

  .ar-detail-body { background:var(--gray-50); padding:clamp(16px,2vw,24px); max-height:calc(90vh - 220px); overflow-y:auto; }

  /* Info cards */
  .ar-info-card { background:white; border:1.5px solid var(--gray-200); border-radius:var(--radius-lg); padding:clamp(12px,1.4vw,18px); position:relative; overflow:hidden; transition:all 0.18s ease; }
  .ar-info-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:3px; background:${NL_GRADIENT}; }
  .ar-info-card:hover { box-shadow:var(--shadow-md); border-color:${NL_BLUE}33; transform:translateY(-1px); }

  /* Field grid */
  .ar-field-item { background:white; border:1.5px solid var(--gray-200); border-radius:var(--radius); padding:clamp(9px,1vw,13px) clamp(10px,1.2vw,15px); transition:all 0.15s; position:relative; overflow:hidden; }
  .ar-field-item:hover { border-color:${NL_BLUE}44; box-shadow:0 2px 8px rgba(11,92,171,0.07); }
  .ar-field-item .copy-btn { position:absolute; top:7px; right:7px; background:none; border:none; cursor:pointer; opacity:0; transition:opacity .15s; font-size:11px; color:var(--gray-400); padding:2px 4px; border-radius:4px; }
  .ar-field-item:hover .copy-btn { opacity:1; }
  .ar-field-item .copy-btn:hover { background:var(--gray-100); color:var(--gray-700); }

  /* Action blocks */
  .ar-action-block { background:white; border-radius:var(--radius-xl); border:1.5px solid; padding:clamp(16px,2vw,22px); margin-bottom:18px; animation:fadeUp 0.25s ease both; }
  .ar-action-edit { border-color:var(--amber-200); background:linear-gradient(135deg,var(--amber-50),white); }
  .ar-action-transfer { border-color:var(--purple-100); background:linear-gradient(135deg,var(--purple-50),white); }

  /* History Modal */
  .ar-modal-overlay { position:fixed; inset:0; z-index:10001; background:rgba(2,8,23,0.85); backdrop-filter:blur(14px); display:flex; align-items:center; justify-content:center; padding:clamp(10px,2vw,18px); overflow-y:auto; }
  .ar-modal-panel { background:white; border-radius:20px; border:1.5px solid var(--gray-200); box-shadow:0 32px 80px rgba(0,0,0,0.35); overflow:hidden; display:flex; flex-direction:column; max-width:860px; width:100%; max-height:88vh; animation:bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
  .ar-modal-header { padding:clamp(16px,2vw,22px) clamp(18px,2.5vw,28px); background:${NL_GRADIENT_90}; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; position:relative; overflow:hidden; }
  .ar-modal-header::after { content:''; position:absolute; top:-30px; right:-30px; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,0.06); pointer-events:none; }

  /* Timeline */
  .timeline { display:flex; flex-direction:column; gap:0; padding:0 4px; }
  .timeline-item { position:relative; padding-left:32px; padding-bottom:20px; }
  .timeline-item::before { content:''; position:absolute; left:11px; top:22px; bottom:0; width:2px; background:linear-gradient(to bottom,${NL_BLUE}40,transparent); }
  .timeline-item:last-child::before { display:none; }
  .timeline-dot { position:absolute; left:0; top:4px; width:24px; height:24px; border-radius:50%; background:${NL_GRADIENT}; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:800; box-shadow:0 2px 8px rgba(11,92,171,0.3); font-family:Outfit,sans-serif; }
  .timeline-card { background:white; border:1.5px solid var(--gray-200); border-radius:14px; padding:clamp(11px,1.3vw,15px) clamp(12px,1.5vw,17px); transition:all .15s ease; }
  .timeline-card:hover { border-color:${NL_BLUE}44; box-shadow:0 4px 14px rgba(11,92,171,0.10); }

  /* Camera Modal */
  .camera-card { background:white; border:1.5px solid var(--gray-200); border-radius:16px; overflow:hidden; transition:all .18s ease; }
  .camera-card:hover { box-shadow:0 8px 24px rgba(11,92,171,0.12); transform:translateY(-2px); }
  .camera-card-header { padding:clamp(10px,1.2vw,14px); display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--gray-100); }
  .camera-icon { width:36px; height:36px; border-radius:10px; background:${NL_GRADIENT}; display:flex; align-items:center; justify-content:center; color:white; font-size:16px; flex-shrink:0; }

  /* Section pill filter */
  .section-pills { display:flex; gap:5px; flex-wrap:wrap; align-items:center; }
  .section-pill { padding:clamp(3px,0.4vw,5px) clamp(8px,1vw,12px); border-radius:999px; font-size:var(--text-xs); font-weight:700; border:1.5px solid var(--gray-200); background:white; color:var(--gray-600); cursor:pointer; transition:all .15s ease; font-family:Outfit,sans-serif; }
  .section-pill:hover { border-color:${NL_BLUE}66; color:${NL_BLUE}; background:var(--blue-50); }
  .section-pill.active { background:${NL_BLUE}; border-color:${NL_BLUE}; color:white; }

  /* Divider */
  .ar-divider { display:flex; align-items:center; gap:10px; margin:clamp(12px,1.5vw,20px) 0 clamp(10px,1.2vw,16px); }
  .ar-divider-line { height:1px; flex:1; background:var(--gray-200); }
  .ar-divider-text { font-size:var(--text-xs); font-weight:700; color:var(--gray-400); text-transform:uppercase; letter-spacing:0.1em; white-space:nowrap; font-family:'Outfit',sans-serif; }

  .ar-mono { font-family:'Courier New',monospace; font-size:11px; background:var(--gray-50); border:1px solid var(--gray-200); border-radius:5px; padding:2px 6px; color:var(--gray-800); }
  .ar-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:clamp(40px,6vw,70px) 20px; gap:12px; text-align:center; }
  .ar-spinner { border-radius:50%; border:2.5px solid var(--gray-200); border-top-color:${NL_BLUE}; animation:spin 0.7s linear infinite; }
  .ar-search-wrap { position:relative; }
  .ar-search-wrap input { padding-right:36px; }
  .ar-search-icon { position:absolute; right:11px; top:50%; transform:translateY(-50%); color:var(--gray-400); pointer-events:none; }
  .ar-mobile-overlay { position:fixed; inset:0; z-index:49; background:rgba(17,24,39,0.4); }

  /* Copy toast */
  .copy-toast { position:fixed; bottom:clamp(16px,3vw,28px); left:50%; transform:translateX(-50%); background:#0f172a; color:white; padding:8px 18px; border-radius:999px; font-size:12px; font-weight:700; font-family:Outfit,sans-serif; z-index:99999; animation:fadeUp .2s ease,fadeIn .2s ease; box-shadow:0 8px 24px rgba(0,0,0,0.2); }

  /* Skeleton */
  .skeleton { background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:6px; }

  /* Scrollbar */
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--gray-300); border-radius:999px; }
  ::-webkit-scrollbar-thumb:hover { background:var(--gray-400); }

  /* ═══════════════
     RESPONSIVE
  ═══════════════ */
  @media (min-width: 1600px) {
    .ar-content { padding: 20px 28px; }
    .ar-topbar { padding: 14px 28px; }
    .nl-hero-inner-compact { padding: 20px 28px; }
    .filter-panel { padding: 22px 28px; }
  }
  @media (min-width: 1280px) {
    .nl-hero-stats { grid-template-columns: repeat(5, 1fr); max-width: none; }
  }
  @media (max-width: 1024px) {
    .ar-sidebar { position:fixed; top:0; left:0; height:100vh; z-index:100; }
    .ar-sidebar.collapsed { width:0; }
    .nl-hero-stats { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 768px) {
    .ar-content { padding:10px 12px; }
    .ar-topbar { padding:8px 12px; }
    .detail-tabs .detail-tab span.tab-label { display:none; }
    .nl-hero-stats { grid-template-columns: repeat(2, 1fr); }
    .nl-status-strip { display:none; }
  }
  @media (max-width: 640px) {
    .ar-table thead th,.ar-table tbody td { padding:8px 9px; font-size:11px; }
    .filter-panel { padding:12px 14px; }
    .ar-detail-body { padding:14px; }
    .ar-detail-header { padding:14px; }
    .nl-hero-stats { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .ar-topbar-center { display:none; }
    .ar-btn:not(.ar-btn-icon) span.btn-label { display:none; }
    .nl-hero-stats { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 360px) {
    .nl-hero-stats { grid-template-columns: 1fr; }
  }
`;

/* ─── Utility Functions ─── */
const safeArray = v => (!v ? [] : Array.isArray(v) ? v : [v]);
const show = v => (v === null || v === undefined || v === "" || v === "—" ? "N/A" : String(v));

function yearFromDate(d) {
  if (!d) return "";
  try { const y = new Date(d).getFullYear(); return Number.isFinite(y) ? String(y) : ""; } catch { return ""; }
}
const normalizeStatus = raw => {
  const v = String(raw ?? "").trim().toLowerCase();
  if (!v) return "Active";
  if (["active","up","running","yes","ok"].includes(v)) return "Active";
  if (["down","inactive","no","disabled","dead"].includes(v)) return "Inactive";
  if (["repair","in repair","maintenance","maintain","service","servicing","broken","faulty","problem"].includes(v)) return "Repair";
  return v.charAt(0).toUpperCase() + v.slice(1);
};

const SORT_FIELD_TYPES = {
  assetId:"mixed", section:"text", categoryId:"text", subCategoryCode:"text",
  branch:"text", assignedUser:"text", lastUpdated:"date", status:"text",
};

const getStatusClass = status => {
  const s = normalizeStatus(status);
  if (s === "Active") return "ar-status ar-status-active";
  if (s === "Inactive") return "ar-status ar-status-inactive";
  if (s === "Repair") return "ar-status ar-status-repair";
  return "ar-status ar-status-default";
};

const formatUpdated = d => {
  if (!d) return "N/A";
  try { const dt = new Date(d); if (isNaN(dt.getTime())) return "N/A"; return dt.toLocaleString(); } catch { return "N/A"; }
};

const formatDateForExcel = dv => {
  if (!dv || dv === "" || dv === "—" || dv === "N/A") return "";
  try {
    const s = String(dv).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  } catch { return ""; }
};

const exportXLSX = (aoa, filename="export.xlsx", sheetName="Sheet1") => {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
};

const pickBranchArray = (obj, keys=[]) => {
  for (const k of keys) { const v = obj?.[k]; if (Array.isArray(v) && v.length) return v; if (v && !Array.isArray(v)) return safeArray(v); }
  return [];
};

const guessBrand = model => { if (!model) return ""; const s = String(model).trim(); return s.split(/\s+/)[0] || ""; };

const getAssignedUser = (section, rawObj) => {
  switch (section) {
    case "desktop": return rawObj?.userName || rawObj?.desktop_domain || rawObj?.name || "";
    case "laptop": return rawObj?.laptop_user || "";
    case "printer": return rawObj?.assigned_user || "";
    case "panel": return rawObj?.panel_user || "";
    case "ipphone": return rawObj?.assigned_user || "";
    case "switch": return rawObj?.assigned_user || "";
    case "extra_monitor": return rawObj?.assigned_user || "";
    default: return rawObj?.assigned_to || rawObj?.assigned_user || rawObj?.userName || "";
  }
};

const mapToExcelRow = (section, d, branchName) => {
  const base = { Section:section, Branch:branchName, "Asset Code":d?.assetId||d?.asset_id||"", "Sub-Cat Code":d?.sub_category_code||"", Remarks:d?.remarks||"" };
  switch (section) {
   case "switch":
      return {
        ...base,
        "Asset Name": d?.asset_name || "",
        "Model": d?.model || "",
        "Type": d?.type || "",
        "Brand": d?.brand || "",
        "Location": d?.location || "",
        "Port": d?.port || "",
        "Assigned User": d?.assigned_user || "",
        "Remarks": d?.remarks || "",
      };
      case "extra_monitor":
      return {
        ...base,
        "Monitor Name": d?.monitor_name || "",
        "Monitor Brand": d?.monitor_brand || "",
        "Monitor Size": d?.monitor_size || "",
        "Monitor Location": d?.monitor_location || "",
        "Monitor Purchase Year": d?.monitor_purchase_year || "",
        "Monitor Status": d?.monitor_status || "",
        "System Model": d?.system_model || "",
        "Assigned User": d?.assigned_user || "",
        Remarks: d?.remarks || "",
      };
    case "server": return {...base,Brand:d?.brand||"","IP Address":d?.ip_address||"",Location:d?.location||"","Model No":d?.model_no||"","Purchase Date":formatDateForExcel(d?.purchase_date),Vendor:d?.vendor||"",Specification:d?.specification||"",Storage:d?.storage||"",Memory:d?.memory||"","Window Server Version":d?.windows_server_version||"",Virtualization:d?.virtualization||"","How Many Server":d?.how_many_server||""};
    case "firewall_router": return {...base,Brand:d?.brand||"",Model:d?.model||"","Purchase Date":formatDateForExcel(d?.purchase_date),Vendor:d?.vendor||"","Liscence-expiry":formatDateForExcel(d?.license_expiry||d?.expiry_date),"Specification/Remarks":d?.specification_remarks||d?.remarks||""};
    case "desktop": return {...base,Brand:d.desktop_brand||"","Assigned User":d.userName||"","Desktop ID":d.desktop_ids||"",RAM:d.desktop_ram||"","System Model":d.system_model||"",SSD:d.desktop_ssd||"",Processor:d.desktop_processor||"","Windows Version":d.window_version||"","Monitor code":d.monitor_asset_code||"",Location:d.location||"","IP Address":d.ip_address||"","Monitor Brand":d.monitor_brand||"","Monitor Size":d.monitor_size||"","Monitor Location":d.monitor_location||"","Windows Gen":d.window_gen||"","Monitor Purchase Year":d.monitor_purchase_year||"","Monitor Status":d.monitor_status||"",Status:d.status||"Active"};
    case "laptop": return {...base,Brand:d.laptop_brand||"",Name:d.name||"","Assigned User":d.laptop_user||"",RAM:d.laptop_ram||"",SSD:d.laptop_ssd||"",Processor:d.laptop_processor||"",Location:d.location||"","IP Address":d.ip_address||"",Status:d.status||"Active"};
    case "printer":
      return {
        ...base,
        "Assigned User": d.assigned_user || "",
        Name: d.printer_name || "",
        Model: d.printer_model || "",
        "Printer Type": d.printer_type || "",
        Status: d.printer_status || "Active",
        Location: d.location || "",
        "IP Address": d.ip_address || "",
      };
    case "scanner": return {...base,Name:d.scanner_name||"",Model:d.scanner_model||"",Location:d.location||""};
    case "projector": return {...base,Name:d.projector_name||"",Model:d.projector_model||"",Status:d.projector_status||"Active","Purchase Date":formatDateForExcel(d.projector_purchase_date),Location:d.location||"","Warranty Years":d.warranty_years||""};
    case "panel": return {...base,Name:d.panel_name||"",Brand:d.panel_brand||"","Assigned User":d.panel_user||"","IP Address":d.panel_ip||"",Status:d.panel_status||"Active","Purchased Year":d.panel_purchase_year||"",Location:d.location||"","Warranty Years":d.warranty_years||""};
    case "ipphone": return {...base,"Extension No":d.ip_telephone_ext_no||"","IP Address":d.ip_telephone_ip||"",Status:d.ip_telephone_status||"Active","Assigned User":d.assigned_user||"",Model:d.model||"",Brand:d.brand||"",Location:d.location||""};
    case "cctv": return {...base,Brand:d?.cctv_brand||"","NVR IP":d?.cctv_nvr_ip||"","Record Days":d?.cctv_record_days||"",Capacity:d?.capacity||"",Channel:d?.channel??"",Vendor:d?.vendor||"","Purchase Date":formatDateForExcel(d?.purchase_date)};
    case "connectivity": return {...base,Status:d.connectivity_status||"Active",Network:d.connectivity_network||"","LAN IP":d.connectivity_lan_ip||"","WAN Link":d.connectivity_wlink||"","Installed Year":d.installed_year||"",Location:d.location||""};
    case "ups": return {...base,Model:d.ups_model||"","Backup Time":d.ups_backup_time||"",Installer:d.ups_installer||"",Rating:d.ups_rating||"","Battery Rating":d.battery_rating||"","Purchased Year":d.ups_purchase_year||"",Status:d.ups_status||"Active"};
    default: return base;
  }
};

const SECTION_FIELD_MAP = {
  desktop:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Brand:(d)=>d?.desktop_brand,"Assigned User":(d)=>d?.userName||d?.desktop_domain,"Desktop ID":(d)=>d?.desktop_ids,RAM:(d)=>d?.desktop_ram,"System Model":(d)=>d?.system_model,SSD:(d)=>d?.desktop_ssd,Processor:(d)=>d?.desktop_processor,"Windows Version":(d)=>d?.window_version||d?.windows_version,Location:(d)=>d?.location,"IP Address":(d)=>d?.ip_address,"Monitor code":(d)=>d?.monitor_asset_code,"Monitor Brand":(d)=>d?.monitor_brand,"Monitor Size":(d)=>d?.monitor_size,"Monitor Location":(d)=>d?.monitor_location,"Windows Gen":(d)=>d?.window_gen,"Monitor Purchase Year":(d)=>d?.monitor_purchase_year,"Monitor Status":(d)=>d?.monitor_status,Status:(d)=>d?.status,Remarks:(d)=>d?.remarks},
  extra_monitor: {
    Section: (d, r) => r?.section,
    Branch: (d, r) => r?.branch,
    "Asset Code": (d) => d?.assetId,
    "Sub-Cat Code": (d) => d?.sub_category_code,
    "Monitor Name": (d) => d?.monitor_name,
    "Monitor Brand": (d) => d?.monitor_brand,
    "Monitor Size": (d) => d?.monitor_size,
    "Monitor Location": (d) => d?.monitor_location,
    "Monitor Purchase Year": (d) => d?.monitor_purchase_year,
    "Monitor Status": (d) => d?.monitor_status,
    "System Model": (d) => d?.system_model,
    "Assigned User": (d) => d?.assigned_user,
    Remarks: (d) => d?.remarks,
  },
  switch: {
    Section: (d, r) => r?.section,
    Branch: (d, r) => r?.branch,
    "Asset Code": (d) => d?.assetId,
    "Sub-Cat Code": (d) => d?.sub_category_code,
    "Asset Name": (d) => d?.asset_name,
    "Model": (d) => d?.model,
    "Type": (d) => d?.type,
    "Brand": (d) => d?.brand,
    "Location": (d) => d?.location,
    "Port": (d) => d?.port,
    "Assigned User": (d) => d?.assigned_user,
    Remarks: (d) => d?.remarks,
  },
  laptop:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Brand:(d)=>d?.laptop_brand,Name:(d)=>d?.name,"Assigned User":(d)=>d?.laptop_user,RAM:(d)=>d?.laptop_ram,SSD:(d)=>d?.laptop_ssd,Processor:(d)=>d?.laptop_processor,Location:(d)=>d?.location,"IP Address":(d)=>d?.ip_address,Status:(d)=>d?.status,Remarks:(d)=>d?.remarks},
  printer: {
    Section: (d, r) => r?.section,
    Branch: (d, r) => r?.branch,
    "Asset Code": (d) => d?.assetId,
    "Sub-Cat Code": (d) => d?.sub_category_code,
    "Assigned User": (d) => d?.assigned_user,
    Name: (d) => d?.printer_name || d?.name,
    Model: (d) => d?.printer_model,
    "Printer Type": (d) => d?.printer_type,
    Status: (d) => d?.printer_status || d?.status,
    Location: (d) => d?.location,
    "IP Address": (d) => d?.ip_address,
    Remarks: (d) => d?.remarks,
  },
  scanner:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Name:(d)=>d?.scanner_name,Model:(d)=>d?.scanner_model,Location:(d)=>d?.location,Remarks:(d)=>d?.remarks},
  projector:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Name:(d)=>d?.projector_name,Model:(d)=>d?.projector_model,Status:(d)=>d?.projector_status||d?.status,"Purchase Date":(d)=>d?.projector_purchase_date,Location:(d)=>d?.location,"Warranty Years":(d)=>d?.warranty_years,Remarks:(d)=>d?.remarks},
  panel:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Name:(d)=>d?.panel_name,Brand:(d)=>d?.panel_brand,"Assigned User":(d)=>d?.panel_user,"IP Address":(d)=>d?.panel_ip,Status:(d)=>d?.panel_status||d?.status,"Purchased Year":(d)=>d?.panel_purchase_year,Location:(d)=>d?.location,"Warranty Years":(d)=>d?.warranty_years,Remarks:(d)=>d?.remarks},
  ipphone:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,"Extension No":(d)=>d?.ip_telephone_ext_no,"IP Address":(d)=>d?.ip_telephone_ip,Status:(d)=>d?.ip_telephone_status||d?.status,"Assigned User":(d)=>d?.assigned_user,Model:(d)=>d?.model,Brand:(d)=>d?.brand,Location:(d)=>d?.location,Remarks:(d)=>d?.remarks},
  cctv:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Brand:(d)=>d?.cctv_brand,"NVR IP":(d)=>d?.cctv_nvr_ip,"Record Days":(d)=>d?.cctv_record_days,Capacity:(d)=>d?.capacity,Channel:(d)=>d?.channel,Vendor:(d)=>d?.vendor,"Purchase Date":(d)=>formatDateForExcel(d?.purchase_date),Remarks:(d)=>d?.remarks},
  connectivity:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Sub-Cat Code":(d)=>d?.sub_category_code,Status:(d)=>d?.connectivity_status,Network:(d)=>d?.connectivity_network,"LAN IP":(d)=>d?.connectivity_lan_ip,"WAN Link":(d)=>d?.connectivity_wlink,"Installed Year":(d)=>d?.installed_year,Location:(d)=>d?.location,Remarks:(d)=>d?.remarks},
  ups:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Sub-Cat Code":(d)=>d?.sub_category_code,Model:(d)=>d?.ups_model,"Backup Time":(d)=>d?.ups_backup_time,Installer:(d)=>d?.ups_installer,Rating:(d)=>d?.ups_rating,"Battery Rating":(d)=>d?.battery_rating,"Purchased Year":(d)=>d?.ups_purchase_year,Status:(d)=>d?.ups_status,Remarks:(d)=>d?.remarks},
  server:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Sub-Cat Code":(d)=>d?.sub_category_code,Brand:(d)=>d?.brand,"IP Address":(d)=>d?.ip_address,Location:(d)=>d?.location,"Model No":(d)=>d?.model_no||d?.model,"Purchase Date":(d)=>formatDateForExcel(d?.purchase_date),Vendor:(d)=>d?.vendor||d?.vendor_name,Specification:(d)=>d?.specification,Storage:(d)=>d?.storage,Memory:(d)=>d?.memory,"Window Server Version":(d)=>d?.windows_server_version||d?.os_version,Virtualization:(d)=>d?.virtualization,"How Many Server":(d)=>d?.how_many_server,Remarks:(d)=>d?.remarks},
  firewall_router:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Sub-Cat Code":(d)=>d?.sub_category_code,Brand:(d)=>d?.brand,Model:(d)=>d?.model,"Purchase Date":(d)=>formatDateForExcel(d?.purchase_date),Vendor:(d)=>d?.vendor||d?.vendor_name,"Liscence-expiry":(d)=>formatDateForExcel(d?.license_expiry||d?.expiry_date),"Specification/Remarks":(d)=>d?.specification||d?.remarks,Remarks:(d)=>d?.remarks},
  application_software:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Name:(d)=>d?.software_name||d?.name,Category:(d)=>d?.software_category,Version:(d)=>d?.version,Vendor:(d)=>d?.vendor_name,"License Type":(d)=>d?.license_type,"License Key":(d)=>d?.license_key,Quantity:(d)=>d?.quantity,"Purchase Date":(d)=>d?.purchase_date,"Expiry Date":(d)=>d?.expiry_date,"Assigned To":(d)=>d?.assigned_to,Remarks:(d)=>d?.remarks},
  office_software:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Name:(d)=>d?.software_name||d?.name,Category:(d)=>d?.software_category,Version:(d)=>d?.version,Vendor:(d)=>d?.vendor_name,"Installed On":(d)=>d?.installed_on,"PC Name":(d)=>d?.pc_name,"Installed By":(d)=>d?.installed_by,"Install Date":(d)=>d?.install_date,"License Type":(d)=>d?.license_type,"License Key":(d)=>d?.license_key,Quantity:(d)=>d?.quantity,"Purchase Date":(d)=>d?.purchase_date,"Expiry Date":(d)=>d?.expiry_date,"Assigned To":(d)=>d?.assigned_to,Remarks:(d)=>d?.remarks},
  utility_software:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Name:(d)=>d?.software_name||d?.name,Version:(d)=>d?.version,Category:(d)=>d?.category||d?.software_category,"PC Name":(d)=>d?.pc_name,"Installed By":(d)=>d?.installed_by,"Install Date":(d)=>d?.install_date,Remarks:(d)=>d?.remarks},
  security_software:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Name:(d)=>d?.product_name||d?.name,Vendor:(d)=>d?.vendor_name,"License Type":(d)=>d?.license_type,"Total Nodes":(d)=>d?.total_nodes,"Expiry Date":(d)=>d?.expiry_date,Remarks:(d)=>d?.remarks},
  security_software_installed:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Name:(d)=>d?.product_name||d?.name,Version:(d)=>d?.version,"PC Name":(d)=>d?.pc_name,"Real Time Protection":(d)=>d?.real_time_protection,"Last Update Date":(d)=>d?.last_update_date,"Installed By":(d)=>d?.installed_by,Remarks:(d)=>d?.remarks},
  services:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Name:(d)=>d?.service_name||d?.name,Category:(d)=>d?.service_category,Provider:(d)=>d?.provider_name,"Contract No":(d)=>d?.contract_no,"Provider Contact":(d)=>d?.provider_contact,"Start Date":(d)=>d?.start_date,"Expiry Date":(d)=>d?.expiry_date,Remarks:(d)=>d?.remarks},
  licenses:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,Name:(d)=>d?.license_name||d?.name,"License Type":(d)=>d?.license_type,"License Key":(d)=>d?.license_key,Quantity:(d)=>d?.quantity,Vendor:(d)=>d?.vendor_name,"Purchase Date":(d)=>d?.purchase_date,"Expiry Date":(d)=>d?.expiry_date,"Assigned To":(d)=>d?.assigned_to,Remarks:(d)=>d?.remarks},
  windows_os:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,"Device Type":(d)=>d?.device_type,"Device Asset Code":(d)=>d?.device_asset_id,"OS Version":(d)=>d?.os_version,"License Type":(d)=>d?.license_type,"License Key":(d)=>d?.license_key,"Activation Status":(d)=>d?.activation_status,"Installed Date":(d)=>d?.installed_date,Remarks:(d)=>d?.remarks},
  windows_servers:{Section:(d,r)=>r?.section,Branch:(d,r)=>r?.branch,"Asset Code":(d)=>d?.assetId,"Sub-Cat Code":(d)=>d?.sub_category_code,"Server Name":(d)=>d?.server_name,"Server Role":(d)=>d?.server_role,"OS Version":(d)=>d?.os_version,"License Type":(d)=>d?.license_type,"License Key":(d)=>d?.license_key,"Cores Licensed":(d)=>d?.cores_licensed,"Expiry Date":(d)=>d?.expiry_date,Remarks:(d)=>d?.remarks},
};

const buildDetailPairs = (section, details, reportRow) => {
  const headers = EXCEL_HEADERS[section] || [];
  const fieldMap = SECTION_FIELD_MAP[section] || {};
  return headers.map(label => {
    const getter = fieldMap[label];
    const raw = getter ? getter(details, reportRow) : undefined;
    return [label, show(raw)];
  });
};

const isStatusField = label => {
  const l = String(label || "").toLowerCase();
  return l === "status" || l.includes("status") || l === "activation status" || l === "real time protection";
};
const statusOptions = ["Active","Inactive","Repair"];

const headerToFieldKey = (header, section) => {
  switch (header) {
    case "Brand": return section==="desktop"?"desktop_brand":section==="laptop"?"laptop_brand":section==="panel"?"panel_brand":section==="cctv"?"cctv_brand":null;
    case "Assigned User": return section==="extra_monitor" ? "assigned_user" : section==="desktop"?"userName":section==="laptop"?"laptop_user":section==="printer"?"assigned_user":section==="panel"?"panel_user":section==="ipphone"?"assigned_user":null;   
    case "Desktop ID": return "desktop_ids";
    case "Asset Name": return "asset_name";
    case "Windows Version": return "window_version";
    case "Name": return section==="printer"?"printer_name":section==="scanner"?"scanner_name":section==="projector"?"projector_name":section==="panel"?"panel_name":"name";
    case "RAM": return section==="desktop"?"desktop_ram":section==="laptop"?"laptop_ram":null;
    case "SSD": return section==="desktop"?"desktop_ssd":section==="laptop"?"laptop_ssd":null;
    case "Processor": return section==="desktop"?"desktop_processor":section==="laptop"?"laptop_processor":null;
    case "System Model": return "system_model";
    case "Purchase Date": return section==="projector"?"projector_purchase_date":"purchase_date";
    case "Monitor code": return "monitor_asset_code";
    case "Location": return "location";
    case "IP Address": return section==="panel"?"panel_ip":section==="ipphone"?"ip_telephone_ip":"ip_address";
    case "Monitor Brand": return "monitor_brand";
    case "Monitor Size": return "monitor_size";
    case "Monitor Location": return "monitor_location";
    case "Windows Gen": return "window_gen";
    case "Monitor Purchase Year": return "monitor_purchase_year";
    case "Monitor Status": return "monitor_status";
    case "Warranty Years": return "warranty_years";
    case "Printer Type": return "printer_type";
    case "Status": return section==="printer"?"printer_status":section==="projector"?"projector_status":section==="panel"?"panel_status":section==="ipphone"?"ip_telephone_status":section==="ups"?"ups_status":section==="connectivity"?"connectivity_status":"status";
    case "Model": return section==="printer"?"printer_model":section==="scanner"?"scanner_model":section==="projector"?"projector_model":section==="ups"?"ups_model":"model";
    case "Purchased Year": return section==="panel"?"panel_purchase_year":section==="ups"?"ups_purchase_year":null;
    case "Extension No": return "ip_telephone_ext_no";
    case "NVR IP": return "cctv_nvr_ip";
    case "Record Days": return "cctv_record_days";
    case "Capacity": return "capacity";
    case "Channel": return "channel";
    case "Vendor": return section==="cctv"?"vendor":"vendor_name";
    case "Network": return "connectivity_network";
    case "LAN IP": return "connectivity_lan_ip";
    case "WAN Link": return "connectivity_wlink";
    case "Installed Year": return "installed_year";
    case "Backup Time": return "ups_backup_time";
    case "Installer": return "ups_installer";
    case "Rating": return "ups_rating";
    case "Battery Rating": return "battery_rating";
    case "Model No": return "model_no";
    case "Specification": return "specification";
    case "Storage": return "storage";
    case "Memory": return "memory";
    case "Window Server Version": return "windows_server_version";
    case "Virtualization": return "virtualization";
    case "How Many Server": return "how_many_server";
    case "Liscence-expiry": return "license_expiry";
    case "Specification/Remarks": return "specification_remarks";
    case "Category": return section==="services"?"service_category":"software_category";
    case "Version": return "version";
    case "License Type": return "license_type";
    case "License Key": return "license_key";
    case "Quantity": return "quantity";
    case "Expiry Date": return "expiry_date";
    case "Assigned To": return "assigned_to";
    case "Installed On": return "installed_on";
    case "PC Name": return "pc_name";
    case "Installed By": return "installed_by";
    case "Install Date": return "install_date";
    case "Real Time Protection": return "real_time_protection";
    case "Last Update Date": return "last_update_date";
    case "Total Nodes": return "total_nodes";
    case "Provider": return "provider_name";
    case "Contract No": return "contract_no";
    case "Provider Contact": return "provider_contact";
    case "Start Date": return "start_date";
    case "Device Type": return "device_type";
    case "Device Asset Code": return "device_asset_id";
    case "OS Version": return "os_version";
    case "Activation Status": return "activation_status";
    case "Installed Date": return "installed_date";
    case "Server Name": return "server_name";
    case "Server Role": return "server_role";
    case "Cores Licensed": return "cores_licensed";
    case "Sub-Cat Code": return "sub_category_code";
    case "Monitor Name": return "monitor_name";
    case "Monitor Brand": return "monitor_brand";
    case "Monitor Size": return "monitor_size";
    case "Monitor Location": return "monitor_location";
    case "Monitor Purchase Year": return "monitor_purchase_year";
    case "Monitor Status": return "monitor_status";
    case "Monitor Asset Code": return "monitor_asset_code";
    case "Asset Name": return "asset_name";
    case "Model": return "model";
    case "Type": return "type";
    case "Brand": return "brand";
    case "Location": return "location";
    case "Port": return "port";
    case "Assigned User": return "assigned_user";
    default: return null;
  }
};

const sortByDeviceId = rows =>
  [...rows].sort((a,b) => {
    const aId=Number(a.assetId), bId=Number(b.assetId), aN=Number.isFinite(aId), bN=Number.isFinite(bId);
    if (aN&&bN) { if (aId!==bId) return aId-bId; return String(a.section).localeCompare(String(b.section)); }
    if (aN&&!bN) return -1; if (!aN&&bN) return 1;
    return String(a.assetId).localeCompare(String(b.assetId));
  });

const getAssetCode = (section, rawObj) => {
  const explicit = rawObj?.assetId??rawObj?.asset_id??rawObj?.asset_code??rawObj?.asset_code_no??rawObj?.asset_code_number;
  const val = String(explicit??"").trim();
  if (val && val!=="0") return val;
  return "";
};

function toReportRows(branches, subCatMap, groupMap) {
  const rows = [];
  for (const b of branches||[]) {
    const branchName = b?.name||"N/A";
    const branchId = b?.id??null;
    const pushRow = (section, rawObj, defaults) => {
      const subCode = defaults.subCategoryCode||rawObj?.sub_category_code||"";
      const subRow = subCatMap.get(String(subCode));
      const subName = subRow?.name||"";
      const groupId = subRow?.group_id??subRow?.groupId??"";
      const categoryId = groupId ? groupMap.get(groupId)?.id||groupId : "";
      rows.push({
        branchId, section,
        assetId: getAssetCode(section, rawObj),
        subCategoryCode:subCode, categoryId, subCategoryName:subName, branch:branchName,
        brand:defaults.brand??"", name:defaults.name??"", model:defaults.model??"",
        purchaseYear:defaults.purchaseYear??"", lastUpdated:rawObj?.updatedAt||rawObj?.updated_at||rawObj?.createdAt||rawObj?.created_at||null,
        status:normalizeStatus(defaults.status), assignedUser:getAssignedUser(section,rawObj),
        details:{...rawObj},
      });
    };
    safeArray(b?.connectivity).forEach(c=>pushRow("connectivity",c,{subCategoryCode:c?.sub_category_code||"IN",name:"Connectivity",brand:"",model:c?.connectivity_network||"LAN",purchaseYear:c?.installed_year||"",status:c?.connectivity_status||""}));
    safeArray(b?.ups).forEach(u=>{const um=u?.ups_model||"";pushRow("ups",u,{subCategoryCode:u?.sub_category_code||"UP",name:"UPS",brand:guessBrand(um),model:um,purchaseYear:u?.ups_purchase_year||"",status:u?.ups_status||""});});
    const pushDevice = (section, row) => {
      const purchaseYear =
        row?.monitor_purchase_year ||
        row?.panel_purchase_year ||
        yearFromDate(row?.purchase_date) ||
        row?.purchased_year ||
        row?.installed_year ||
        "";

      const deviceName =
      row?.monitor_name ||
      row?.asset_name ||
      row?.server_name ||
      row?.firewall_name ||
      row?.name ||
      row?.scanner_name ||  
      row?.projector_name ||
      row?.printer_name ||
      row?.panel_name ||
      row?.desktop_ids ||
      row?.ip_telephone_ext_no ||
      "";

      const getBrand = (r) =>
        r?.monitor_brand ||
        r?.desktop_brand ||
        r?.laptop_brand ||
        r?.panel_brand ||
        r?.cctv_brand ||
        r?.brand ||
        guessBrand(r?.model_no || r?.model || "");

      const getModel = (r) =>
        r?.system_model ||
        r?.model_no ||
        r?.model ||
        r?.scanner_model ||
        r?.projector_model ||
        r?.printer_model ||
        "";

      pushRow(section, row, {
        subCategoryCode: row?.sub_category_code || "",
        name: deviceName,
        brand: getBrand(row) || "",
        model: getModel(row) || "",
        purchaseYear,
        status:
          row?.monitor_status ||
          row?.printer_status ||
          row?.projector_status ||
          row?.panel_status ||
          row?.ip_telephone_status ||
          row?.status ||
          "Active",
      });
    };
      ["scanner","projector","printer","desktop","laptop","cctv","panel","ipphone","server","firewall_router","switch","extra_monitor"].forEach(sec=>{      
        const key =
        sec === "cctv" ? "cctvs" :
        sec === "ipphone" ? "ipphones" :
        sec === "server" ? "servers" :
        sec === "firewall_router" ? "firewallRouters" :
        sec === "switch" ? "switches" :
        sec === "extra_monitor" ? safeArray(
          b?.extraMonitors ||
          b?.extra_monitors ||
          b?.extraMonitor ||
          b?.extra_monitor ||
          []
        ) :
        sec + "s";

      const arr =
        sec === "firewall_router"
          ? safeArray(b?.firewallRouters || b?.firewall_routers || b?.firewalls || [])
          : sec === "switch"
          ? safeArray(b?.switches || b?.switch || [])
          : sec === "extra_monitor"
          ? safeArray(b?.extraMonitors || b?.extra_monitors || b?.extra_monitor || [])
          : safeArray(b?.[key]);

      arr.forEach(r => pushDevice(sec, r));
    });
    const getVendor=r=>r?.vendor??r?.vendor_name??r?.provider??r?.provider_name??"";
    const getInstalledYear=r=>yearFromDate(r?.installed_on||r?.install_date||r?.purchase_date||r?.installed_date||r?.start_date)||"";
    const getExpiry=r=>r?.expiry_on||r?.expiry_date||r?.expiryDate||null;
    const pushSoftware=(section,row,fallbackSub)=>{
      const vendor=getVendor(row);
      const name=row?.name||row?.software_name||row?.product_name||row?.license_name||row?.service_name||row?.server_name||"";
      const version=row?.version||row?.os_version||"";
      const model=`${version}${row?.license_type?` | ${row.license_type}`:""}${row?.quantity?` | Qty: ${row.quantity}`:""}${getExpiry(row)?` | Exp: ${getExpiry(row)}`:""}`.trim()||"";
      pushRow(section,row,{subCategoryCode:row?.sub_category_code||fallbackSub,name,brand:vendor,model,purchaseYear:getInstalledYear(row),status:row?.status||"Active"});
    };
    pickBranchArray(b,["applicationSoftware","applicationSoftwares"]).forEach(r=>pushSoftware("application_software",r,"AL"));
    pickBranchArray(b,["officeSoftware","officeSoftwares"]).forEach(r=>pushSoftware("office_software",r,"OF"));
    pickBranchArray(b,["utilitySoftware","utilitySoftwares"]).forEach(r=>pushSoftware("utility_software",r,"BR"));
    pickBranchArray(b,["securitySoftware","securitySoftwares"]).forEach(r=>pushSoftware("security_software",r,"SE"));
    pickBranchArray(b,["securitySoftwareInstalled","securitySoftwaresInstalled"]).forEach(r=>{const d=r?.pc_name?` (${r.pc_name})`:"";const bn=r?.product_name||r?.name||"Security Agent";pushSoftware("security_software_installed",{...r,name:`${bn}${d}`},"SE");});
    pickBranchArray(b,["services","branchServices"]).forEach(r=>{const provider=getVendor(r);pushRow("services",r,{subCategoryCode:r?.sub_category_code||"MS",name:r?.name||r?.service_name||"Service",brand:provider,model:`${r?.contract_no?`Contract: ${r.contract_no}`:""}${r?.provider_contact?` | ${r.provider_contact}`:""}`.trim(),purchaseYear:getInstalledYear(r),status:r?.status||"Active"});});
    pickBranchArray(b,["licenses","branchLicenses"]).forEach(r=>pushSoftware("licenses",r,"AL"));
    pickBranchArray(b,["windowsOS","windowsOs"]).forEach(r=>pushSoftware("windows_os",r,"WL"));
    pickBranchArray(b,["windowsServers","branchWindowsServers"]).forEach(r=>{const role=r?.server_role?`Role: ${r.server_role}`:"Windows Server";const ver=r?.os_version||r?.version||"";const model=`${ver} | ${role}${r?.cores_licensed?` | Cores: ${r.cores_licensed}`:""}${r?.expiry_date?` | Exp: ${r.expiry_date}`:""}`.trim();pushRow("windows_servers",r,{subCategoryCode:r?.sub_category_code||"WS",name:r?.server_name||r?.name||"Windows Server",brand:r?.vendor_name||"Microsoft",model,purchaseYear:yearFromDate(r?.created_at)||getInstalledYear(r)||"",status:r?.status||"Active"});});
  }
  return rows;
}

const sectionRouteMap = {
  desktop: { type: "multi", plural: "desktops" },
  extra_monitor: { type: "multi", plural: "extra-monitors" },
  extramonitor: { type: "multi", plural: "extra-monitors" },
  "extra-monitor": { type: "multi", plural: "extra-monitors" },
  extra_monitors: { type: "multi", plural: "extra-monitors" },

  switch: { type: "multi", plural: "switches" },
  laptop: { type: "multi", plural: "laptops" },
  printer: { type: "multi", plural: "printers" },
  scanner: { type: "multi", plural: "scanners" },
  projector: { type: "multi", plural: "projectors" },
  panel: { type: "multi", plural: "panels" },
  ipphone: { type: "multi", plural: "ipphones" },
  cctv: { type: "multi", plural: "cctvs" },
  server: { type: "multi", plural: "servers" },
  firewall_router: { type: "multi", plural: "firewall-routers" },
  connectivity: { type: "single", plural: "connectivity" },
  ups: { type: "single", plural: "ups" },
  application_software: { type: "multi", plural: "application-software" },
  office_software: { type: "multi", plural: "office-software" },
  utility_software: { type: "multi", plural: "utility-software" },
  security_software: { type: "multi", plural: "security-software" },
  security_software_installed: { type: "multi", plural: "security-software-installed" },
  services: { type: "multi", plural: "services" },
  licenses: { type: "multi", plural: "licenses" },
  windows_os: { type: "multi", plural: "windows-os" },
  windows_servers: { type: "multi", plural: "windows-servers" },
};

const SECTION_ICONS = {
  desktop:"🖥",extra_monitor:"🖥",laptop:"💻",printer:"🖨",scanner:"📠",projector:"📽",panel:"📺",
  ipphone:"📞",cctv:"📹",server:"🖧",firewall_router:"🔒",
  connectivity:"🌐",ups:"🔋",switch: "🔀",
  application_software:"💾",office_software:"📋",utility_software:"🔧",
  security_software:"🛡",security_software_installed:"🔐",
  services:"🔩",licenses:"🪪",windows_os:"🪟",windows_servers:"🏗",
};

const Spinner = ({size=36, color}) => (
  <div className="ar-spinner" style={{width:size, height:size, borderTopColor:color||NL_BLUE}} />
);

/* ─── Nepal Life Hero — Fully Fluid ─── */
function NepalLifeHeroCompact({totalItems, allSections, totalBranches, activeCount, inactiveCount, repairCount}) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
  const dateStr = now.toLocaleDateString("en-US",{weekday:"short",day:"numeric",month:"short",year:"numeric"});

  const stats = [
    { icon:"📦", num:(totalItems||0).toLocaleString(), label:"Total Assets", sub:`across ${totalBranches||0} branches`, accent:NL_BLUE },
    { icon:"🏢", num:(totalBranches||0).toString(), label:"Branches", sub:"nationwide", accent:"#0d9488" },
    { icon:"🗂", num:(allSections||0).toString(), label:"Sections", sub:"asset categories", accent:"#7c3aed" },
    { icon:"✅", num:(activeCount||0).toLocaleString(), label:"Active", sub:"operational assets", accent:"#16a34a" },
    { icon:"⚠️", num:((inactiveCount||0)+(repairCount||0)).toLocaleString(), label:"Needs Attention", sub:"inactive or repair", accent:"#d97706" },
  ];

  return (
    <div className="nl-hero-compact">
      <div className="nl-hero-inner-compact">
        {/* Left content */}
        <div className="nl-hero-left">
          <div className="nl-eyebrow">
            <div className="nl-eyebrow-dot"/>
            Asset Information Management System
          </div>
          <h2 className="nl-title-compact">
            <span className="blue">NEPAL</span>
            <span className="red">LIFE</span>{" "}
            <span style={{color:"rgba(15,23,42,0.62)", fontWeight:800}}>Insurance Co. Ltd.</span>
          </h2>
          <div className="nl-divider-sm"/>
          <p className="nl-slogan">"किनकी जीवन अमूल्य छ" &nbsp;·&nbsp; Centralized IT Asset Registry</p>

          {/* Stats grid */}
          <div className="nl-hero-stats">
            {stats.map((s,i)=>(
              <div key={i} className="nl-stat" style={{"--stat-accent":s.accent, animationDelay:`${i*0.06}s`}}>
                <div className="nl-stat-icon">{s.icon}</div>
                <span className="nl-stat-num">{s.num}</span>
                <span className="nl-stat-label">{s.label}</span>
                <span className="nl-stat-sub">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Logo + meta */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"var(--space-sm)",flexShrink:0}}>
          <div className="nl-logo-wrap">
            <img src={NepalLifeLogo} alt="Nepal Life" className="nl-logo-compact"/>
            <div className="nl-logo-badge">✓</div>
          </div>
          <div style={{
            padding:"clamp(6px,0.8vw,10px) clamp(10px,1.2vw,14px)",
            background:"rgba(255,255,255,0.85)",
            borderRadius:"clamp(8px,1vw,12px)",
            border:"1.5px solid rgba(11,92,171,0.12)",
            textAlign:"center",
            fontSize:"var(--text-xs)",
            boxShadow:"0 2px 8px rgba(11,92,171,0.06)",
            minWidth:"clamp(80px,10vw,120px)"
          }}>
            <div style={{fontFamily:"Outfit,sans-serif",fontWeight:800,color:NL_BLUE,fontSize:"clamp(11px,1.1vw,13px)"}}>{timeStr}</div>
            <div style={{fontWeight:600,color:"var(--gray-400)",marginTop:2}}>{dateStr}</div>
          </div>
        </div>
      </div>

      {/* System status strip */}
      <div className="nl-status-strip">
        <span style={{fontSize:"var(--text-xs)",fontWeight:800,color:"var(--gray-400)",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"Outfit,sans-serif",flexShrink:0}}>System:</span>
        <span className="nl-status-dot">API Connected</span>
        <span className="nl-status-dot" style={{"--dot-color":"#3b82f6"}}>Real-time Sync</span>
        <span className="nl-status-dot" style={{"--dot-color":"#8b5cf6"}}>Multi-Branch View</span>
        <span className="nl-status-dot" style={{"--dot-color":"#f59e0b"}}>Export Ready</span>
        <div style={{marginLeft:"auto",fontSize:"var(--text-xs)",color:"var(--gray-400)",fontFamily:"Outfit,sans-serif",fontWeight:600}}>
          v2.5.0 &nbsp;·&nbsp; FY 2081/82
        </div>
      </div>
    </div>
  );
}

/* ─── Transfer History Modal ─── */
function TransferHistoryModal({isOpen, onClose, assetCode, section, assetId, token}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen||!token) return;
    setLoading(true);
    api.get("/api/asset-transfers/history",{headers:{Authorization:`Bearer ${token}`}})
      .then(res=>{
        const all=res?.data?.data?.transfers||res?.data?.transfers||res?.data?.data||[];
        const filtered=all.filter(t=>{
          if (assetCode){const ac=String(assetCode).toUpperCase();const tc=String(t.assetCode||"").toUpperCase();if (tc&&tc===ac) return true;}
          return String(t.section||"").toLowerCase()===String(section||"").toLowerCase()&&Number(t.assetId)===Number(assetId);
        });
        setRecords(filtered);
      })
      .catch(()=>setRecords([]))
      .finally(()=>setLoading(false));
  },[isOpen,token,assetCode,section,assetId]);

  const filtered = useMemo(()=>{
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(t=>JSON.stringify(t).toLowerCase().includes(q));
  },[records,search]);

  useEffect(()=>{
    const onEsc=(e)=>{if(e.key==="Escape"&&isOpen) onClose();};
    document.addEventListener("keydown",onEsc);
    return ()=>document.removeEventListener("keydown",onEsc);
  },[isOpen,onClose]);

  if (!isOpen) return null;
  return (
    <div className="ar-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="ar-modal-panel">
        <div className="ar-modal-header">
          <div style={{position:"relative",zIndex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔄</div>
              <div>
                <div style={{fontFamily:"Outfit,sans-serif",fontSize:"1.05rem",fontWeight:800,color:"white"}}>Transfer History</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Asset: <strong>{assetCode||`${section}-${assetId}`}</strong> · {records.length} record{records.length!==1?"s":""}</div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",zIndex:1,position:"relative"}}>
            {records.length>0&&(
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
                style={{padding:"7px 12px",borderRadius:10,border:"1.5px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",color:"white",fontSize:12,outline:"none",width:130}}
              />
            )}
            <button onClick={onClose} className="ar-btn ar-btn-white ar-btn-sm">✕ Close</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"clamp(14px,2vw,22px)",background:"var(--gray-50)"}}>
          {loading?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 0",gap:14}}>
              <Spinner/><div style={{fontSize:13,color:"var(--gray-400)"}}>Loading transfer records…</div>
            </div>
          ):filtered.length===0?(
            <div style={{textAlign:"center",padding:"56px 0",color:"var(--gray-400)"}}>
              <div style={{fontSize:48,marginBottom:12}}>📭</div>
              <div style={{fontWeight:700,fontSize:15,color:"var(--gray-600)",marginBottom:4}}>No transfer history found</div>
              <div style={{fontSize:12}}>This asset hasn't been transferred yet</div>
            </div>
          ):(
            <div className="timeline">
              {filtered.map((t,i)=>(
                <div key={t.id||i} className="timeline-item">
                  <div className="timeline-dot">{i+1}</div>
                  <div className="timeline-card">
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span className="ar-badge ar-badge-blue">#{i+1} — {t.assetCode||`${t.section}-${t.assetId}`}</span>
                        <span style={{fontSize:10,fontFamily:"Outfit,sans-serif",fontWeight:700,padding:"2px 8px",borderRadius:6,background:"var(--blue-50)",color:NL_BLUE,border:`1px solid ${NL_BLUE}33`}}>{t.section||"—"}</span>
                      </div>
                      <span style={{fontSize:11,color:"var(--gray-400)",display:"flex",alignItems:"center",gap:4}}>🕐 {formatUpdated(t.createdAt)}</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
                      {[
                        {icon:"🏢",label:"From Branch",val:t.fromBranchId},
                        {icon:"🏢",label:"To Branch",val:t.toBranchId},
                        {icon:"👤",label:"Transferred By",val:t.transferredBy},
                        {icon:"💬",label:"Reason",val:t.reason},
                      ].map(({icon,label,val})=>(
                        <div key={label} style={{background:"var(--gray-50)",border:"1px solid var(--gray-200)",borderRadius:9,padding:"9px 11px"}}>
                          <div style={{fontSize:10,fontWeight:700,color:"var(--gray-400)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3,display:"flex",alignItems:"center",gap:4}}>{icon} {label}</div>
                          <div style={{fontSize:12,fontWeight:600,color:"var(--gray-700)"}}>{val||"N/A"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function BranchAssetsMasterReport() {
  const {token, isAdmin, isSubAdmin, user} = useAuth();
  const canEdit = isAdmin||isSubAdmin;
  const canDelete = isAdmin;
  const currentUserName = user?.name||user?.email||"Unknown User";
  const navigate = useNavigate();
  const location = useLocation();

  const urlBranchId = useMemo(()=>{
    const params = new URLSearchParams(location.search);
    const bid = params.get("branchId");
    return bid ? String(bid) : "";
  },[location.search]);

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPanel, setShowPanel] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copyToast, setCopyToast] = useState("");
  const [detailTab, setDetailTab] = useState("info");
  const roleLabel = isAdmin?"ADMIN":isSubAdmin?"SUB ADMIN":"USER";

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [groups, setGroups] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [subCatFilter, setSubCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("assetId");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [transferHistoryOpen, setTransferHistoryOpen] = useState(false);
  const [transferHistoryTarget, setTransferHistoryTarget] = useState({assetCode:null,section:null,assetId:null});
  const [newRemark, setNewRemark] = useState("");
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toBranchId, setToBranchId] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addGroupId, setAddGroupId] = useState("");
  const [assignedUserFilter, setAssignedUserFilter] = useState("");
  const [headerMenu, setHeaderMenu] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(()=>{
      setCopyToast(`Copied: ${text}`);
      setTimeout(()=>setCopyToast(""),2000);
    });
  };

  const openHeaderMenu=(e,menu)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    setHeaderMenu({...menu, x:rect.left, y:rect.bottom+6});
  };
  const closeHeaderMenu=()=>setHeaderMenu(null);

  useEffect(()=>{
    const onEsc=ev=>{if(ev.key==="Escape"){closeHeaderMenu();if(detailOpen) closeDetail();}};
    window.addEventListener("keydown",onEsc);
    return ()=>window.removeEventListener("keydown",onEsc);
  },[detailOpen]);

  const filteredSubCats = useMemo(()=>{
    if (!addGroupId) return subCats;
    return (subCats||[]).filter(s=>String(s.group_id??s.groupId??"")===String(addGroupId));
  },[subCats,addGroupId]);
  const fetchAddSubCats = useCallback(gid=>setAddGroupId(gid),[]);

  const [totalInfo, setTotalInfo] = useState({count:0,branch:"All Branches",group:"All Categories",subCategory:"All Sub Categories"});

  const groupLabel = useCallback((id)=>{const g=groups.find(x=>String(x.id)===String(id));return g?.name||id;},[groups]);
  const subCatLabel = useCallback((code)=>{const s=subCats.find(x=>String(x.code)===String(code));return s?.name||code;},[subCats]);

  const sidebarWidth=()=>{
    if (windowWidth<640) return menuOpen?"85vw":"0";
    if (windowWidth<1024) return menuOpen?"280px":"0";
    return menuOpen?"260px":"0";
  };
  useEffect(()=>{const h=()=>setWindowWidth(window.innerWidth);window.addEventListener("resize",h);return ()=>window.removeEventListener("resize",h);},[]);

  const fetchAll = useCallback(async()=>{
    if (!token) return;
    setLoading(true);
    try {
      const res=await api.get("/api/branches/with-assets/all",{headers:{Authorization:`Bearer ${token}`}});
      const payload=res?.data?.data??res?.data??[];
      setBranches(Array.isArray(payload)?payload:[]);
    } catch(err) {
      setAlert({type:"error",title:"Error",message:err?.response?.data?.message||err?.message||"Failed to fetch"});
    } finally {setLoading(false);}
  },[token]);

  const fetchGroups = useCallback(async()=>{
    if (!token) return;
    try{const res=await api.get("/api/asset-groups",{headers:{Authorization:`Bearer ${token}`}});setGroups(res?.data?.data||[]);}catch{}
  },[token]);

  const fetchSubCats = useCallback(async gid=>{
    if (!token) return;
    try{const res=await api.get(`/api/asset-sub-categories${gid?`?groupId=${gid}`:""}`,{headers:{Authorization:`Bearer ${token}`}});setSubCats(res?.data?.data||[]);}catch{setSubCats([]);}
  },[token]);

  useEffect(()=>{fetchAll();fetchGroups();fetchSubCats("");},[fetchAll,fetchGroups,fetchSubCats]);

  useEffect(()=>{
    if (urlBranchId&&branches.length>0){setBranchFilter(urlBranchId);setShowPanel("filters");}
  },[urlBranchId,branches.length]);

  const subCatMap = useMemo(()=>{const m=new Map();for (const s of subCats||[]) if(s?.code) m.set(String(s.code),s);return m;},[subCats]);
  const groupMap = useMemo(()=>{const m=new Map();for (const g of groups||[]) if(g?.id!==undefined) m.set(g.id,g);return m;},[groups]);
  const branchOptions = useMemo(()=>(branches||[]).map(b=>({id:b.id,name:b.name})).sort((a,c)=>(a.name||"").localeCompare(c.name||"")),[branches]);
  const getBranchNameById = useCallback(bid=>{const id=Number(bid);return branches.find(b=>b.id===id)?.name||"";},[branches]);
  const activeBranchName = useMemo(()=>branchFilter?getBranchNameById(branchFilter):"",[branchFilter,getBranchNameById]);

  const handleAddAssetSubmit = useCallback(async({branchId,section,payload})=>{
    if (!token) return;
    const cfg=sectionRouteMap[String(section||"").toLowerCase()];
    if (!cfg?.plural){setAlert({type:"error",title:"Add Asset",message:`No route for section: ${section}`});return;}
    try {
      setAddSaving(true);
      await api.post(`/api/branches/${branchId}/${cfg.plural}`,payload,{headers:{Authorization:`Bearer ${token}`}});
      setAlert({type:"success",title:"Success",message:"Asset added!"});
      setShowAddModal(false);
      await fetchAll();
    } catch(err) {
      setAlert({type:"error",title:"Add Asset Failed",message:err?.response?.data?.message||err?.message||"Failed"});
    } finally{setAddSaving(false);}
  },[token,fetchAll]);

  const reportRows = useMemo(()=>sortByDeviceId(toReportRows(branches,subCatMap,groupMap)),[branches,subCatMap,groupMap]);

  // Compute status counts
  const statusCounts = useMemo(()=>{
    const c={Active:0,Inactive:0,Repair:0};
    reportRows.forEach(r=>{const s=normalizeStatus(r.status);if(c[s]!==undefined) c[s]++;});
    return c;
  },[reportRows]);

  const computeTotal = useCallback(()=>{
    let data=reportRows;
    if (branchFilter){const bName=getBranchNameById(branchFilter);data=data.filter(r=>r.branch===bName);}
    if (groupFilter) data=data.filter(r=>String(r.categoryId||"")===String(groupFilter));
    if (subCatFilter) data=data.filter(r=>String(r.subCategoryCode||"")===String(subCatFilter));
    const q=(search||"").trim().toLowerCase();
    if (q) data=data.filter(r=>{
      const h=[r.assetId,r.subCategoryCode,r.categoryId,r.subCategoryName,r.branch,r.brand,r.name,r.model,r.purchaseYear,r.status,r.assignedUser].map(x=>String(x??"").toLowerCase()).join(" ");
      return h.includes(q);
    });
    setTotalInfo({count:data.length,branch:branchFilter?getBranchNameById(branchFilter):"All Branches",group:groupFilter?groupLabel(groupFilter):"All Categories",subCategory:subCatFilter?subCatLabel(subCatFilter):"All Sub Categories"});
  },[reportRows,branchFilter,groupFilter,subCatFilter,search,getBranchNameById,groupLabel,subCatLabel]);

  useEffect(()=>{computeTotal();},[computeTotal]);

  const assignedUserOptions = useMemo(()=>{
    const q=(search||"").trim().toLowerCase();
    let data=reportRows;
    if (branchFilter){const bName=getBranchNameById(branchFilter);data=data.filter(r=>r.branch===bName);}
    if (groupFilter) data=data.filter(r=>String(r.categoryId||"")===String(groupFilter));
    if (subCatFilter) data=data.filter(r=>String(r.subCategoryCode||"")===String(subCatFilter));
    if (sectionFilter) data=data.filter(r=>r.section===sectionFilter);
    if (statusFilter) data=data.filter(r=>r.status===statusFilter);
    if (q) data=data.filter(r=>{
      const h=[r.assetId,r.subCategoryCode,r.categoryId,r.subCategoryName,r.branch,r.brand,r.name,r.model,r.purchaseYear,r.status,r.assignedUser].map(x=>String(x??"").toLowerCase()).join(" ");
      return h.includes(q);
    });
    const set=new Set(data.map(r=>String(r.assignedUser||"").trim()).filter(Boolean));
    return Array.from(set).sort((a,b)=>a.localeCompare(b));
  },[reportRows,search,branchFilter,groupFilter,subCatFilter,sectionFilter,statusFilter,getBranchNameById]);

  useEffect(()=>{
    if (assignedUserFilter&&!assignedUserOptions.includes(assignedUserFilter)) setAssignedUserFilter("");
  },[assignedUserFilter,assignedUserOptions]);

  const allSections = useMemo(()=>Array.from(new Set(reportRows.map(r=>r.section))).sort(),[reportRows]);

  const filteredRows = useMemo(()=>{
    const q=(search||"").trim().toLowerCase();
    let data=reportRows;
    if (branchFilter){const bName=getBranchNameById(branchFilter);data=data.filter(r=>r.branch===bName);}
    if (groupFilter) data=data.filter(r=>String(r.categoryId||"")===String(groupFilter));
    if (subCatFilter) data=data.filter(r=>String(r.subCategoryCode||"")===String(subCatFilter));
    if (sectionFilter) data=data.filter(r=>r.section===sectionFilter);
    if (statusFilter) data=data.filter(r=>r.status===statusFilter);
    if (assignedUserFilter) data=data.filter(r=>String(r.assignedUser||"")===assignedUserFilter);
    if (!q) return data;
    return data.filter(r=>{
      const h=[r.assetId,r.subCategoryCode,r.categoryId,r.subCategoryName,r.branch,r.brand,r.name,r.model,r.purchaseYear,r.status,r.assignedUser].map(x=>String(x??"").toLowerCase()).join(" ");
      return h.includes(q);
    });
  },[reportRows,branchFilter,groupFilter,subCatFilter,sectionFilter,statusFilter,assignedUserFilter,search,getBranchNameById]);

  const sortedRows = useMemo(()=>{
    if (!sortField) return filteredRows;
    return [...filteredRows].sort((a,b)=>{
      if (sortField==="assetId"){const aNum=Number(a.assetId),bNum=Number(b.assetId),aIsNum=Number.isFinite(aNum),bIsNum=Number.isFinite(bNum);if(aIsNum&&bIsNum) return sortDir==="asc"?aNum-bNum:bNum-aNum;if(aIsNum&&!bIsNum) return sortDir==="asc"?-1:1;if(!aIsNum&&bIsNum) return sortDir==="asc"?1:-1;}
      if (sortField==="lastUpdated"){const aD=a.lastUpdated?new Date(a.lastUpdated).getTime():0;const bD=b.lastUpdated?new Date(b.lastUpdated).getTime():0;return sortDir==="asc"?aD-bD:bD-aD;}
      const aStr=String(a[sortField]??"").toLowerCase();const bStr=String(b[sortField]??"").toLowerCase();return sortDir==="asc"?aStr.localeCompare(bStr):bStr.localeCompare(aStr);
    });
  },[filteredRows,sortField,sortDir]);

  const getSortOptions=(field)=>{
    const t=SORT_FIELD_TYPES[field]||"text";
    if (t==="date"||t==="number") return [{label:"Ascending",value:"asc"},{label:"Descending",value:"desc"}];
    return [{label:"A → Z",value:"asc"},{label:"Z → A",value:"desc"}];
  };
  const handleSortSelect=(field,dir)=>{setSortField(field);setSortDir(dir);setCurrentPage(1);};

  const totalItems = sortedRows.length;
  const totalPages = Math.max(1,Math.ceil(totalItems/pageSize));
  useEffect(()=>{if(currentPage>totalPages) setCurrentPage(1);},[totalPages,currentPage]);
  const pagedRows = useMemo(()=>{const start=(currentPage-1)*pageSize;return sortedRows.slice(start,start+pageSize);},[sortedRows,currentPage,pageSize]);

  const sectionCounts = useMemo(()=>{const c={};(branchFilter?filteredRows:reportRows).forEach(r=>{c[r.section]=(c[r.section]||0)+1;});return Object.entries(c).sort((a,b)=>b[1]-a[1]);},[reportRows,filteredRows,branchFilter]);

  const activeFiltersCount = [branchFilter,groupFilter,subCatFilter,sectionFilter,statusFilter,assignedUserFilter,search].filter(Boolean).length;

  const openDetail=row=>{setDetailRow(row);setDetailOpen(true);setDetailTab("info");setEditValues({});setToBranchId("");setNewRemark("");};
  const closeDetail=()=>{setDetailOpen(false);setDetailRow(null);setDetailTab("info");setEditValues({});setSaving(false);setDeleting(false);setToBranchId("");setTransferring(false);setNewRemark("");};

  const buildFinalRemarks=()=>`Last updated by ${currentUserName}: ${String(newRemark??"").trim()}`;
  const getRouteCfg=section=>sectionRouteMap[String(section??"").toLowerCase()]||null;
  const canTransfer=useMemo(()=>{const cfg=getRouteCfg(detailRow?.section);return cfg?.type==="multi";},[detailRow]);
  const getBranchIdFromRow=()=>detailRow?.branchId??detailRow?.details?.branchId??null;
  const getRowIdFromRow=()=>{
    if (!detailRow) return null;
    if (detailRow.section==="cctv") return detailRow.details?.cctv_id||detailRow.details?.id||null;
    if (detailRow.section==="server") return detailRow.details?.server_id||detailRow.details?.id||detailRow.assetId||null;
    if (detailRow.section==="firewall_router") return detailRow.details?.firewall_router_id||detailRow.details?.id||detailRow.assetId||null;
    const rid=detailRow.details?.id??detailRow.assetId;
    return rid==="N/A"?null:rid;
  };

  const handleOpenEdit=()=>{
    if(!canEdit||!detailRow?.details) return;
    setDetailTab("edit");
    setToBranchId("");
    setEditValues({...detailRow.details});setNewRemark("");
  };
  const handleCancelEdit=()=>{setDetailTab("info");setEditValues({});setNewRemark("");};

  const handleSaveEdit=async()=>{
    if (!canEdit||!token||!detailRow) return;
    const cfg=getRouteCfg(detailRow.section);const branchId=getBranchIdFromRow();const rowId=getRowIdFromRow();
    if (!cfg||branchId==null){setAlert({type:"error",title:"Edit",message:"Missing route config or branchId."});return;}
    if (!String(newRemark??"").trim()){setAlert({type:"error",title:"Remarks Required",message:"Please write remarks before saving."});return;}
    try {
      setSaving(true);
      const payload={...editValues,remarks:buildFinalRemarks()};
      delete payload.createdAt;delete payload.updatedAt;delete payload.created_at;delete payload.updated_at;
      if (cfg.type==="single") await api.put(`/api/branches/${branchId}/${cfg.plural}`,payload,{headers:{Authorization:`Bearer ${token}`}});
      else {if(rowId==null){setAlert({type:"error",title:"Edit",message:"Invalid asset id."});return;}await api.put(`/api/branches/${branchId}/${cfg.plural}/${rowId}`,payload,{headers:{Authorization:`Bearer ${token}`}});}
      setAlert({type:"success",title:"Updated",message:"Asset updated successfully."});
      setDetailTab("info");setEditValues({});setNewRemark("");await fetchAll();
    } catch(err){setAlert({type:"error",title:"Update Failed",message:err?.response?.data?.message||err?.message||"Update failed"});}
    finally{setSaving(false);}
  };

  const handleDelete=async()=>{
    if (!canDelete||!token||!detailRow) return;
    const cfg=getRouteCfg(detailRow.section);const branchId=getBranchIdFromRow();const rowId=getRowIdFromRow();
    if (!cfg||branchId==null){setAlert({type:"error",title:"Delete",message:"Missing route config."});return;}
    if (cfg.type==="single"){setAlert({type:"error",title:"Not Available",message:"Connectivity/UPS are single tables."});return;}
    if (rowId==null){setAlert({type:"error",title:"Delete",message:"Invalid asset id."});return;}
    if (!window.confirm("Are you sure you want to DELETE this asset?")) return;
    try {
      setDeleting(true);
      await api.delete(`/api/branches/${branchId}/${cfg.plural}/${rowId}`,{headers:{Authorization:`Bearer ${token}`}});
      setAlert({type:"success",title:"Deleted",message:"Asset deleted."});closeDetail();await fetchAll();
    } catch(err){setAlert({type:"error",title:"Delete Failed",message:err?.response?.data?.message||err?.message||"Delete failed"});}
    finally{setDeleting(false);}
  };

  const handleTransfer=async()=>{
    if (!token||!detailRow) return;
    const cfg=getRouteCfg(detailRow.section);
    if (!cfg||cfg.type!=="multi"){setAlert({type:"error",title:"Transfer",message:"Only multi assets can be transferred."});return;}
    const fromBranchId=detailRow.branchId??detailRow.details?.branchId;const assetId=getRowIdFromRow();
    if (!fromBranchId||!assetId){setAlert({type:"error",title:"Transfer",message:"Missing source branchId or assetId."});return;}
    if (!toBranchId){setAlert({type:"error",title:"Transfer",message:"Please select target branch."});return;}
    if (Number(toBranchId)===Number(fromBranchId)){setAlert({type:"error",title:"Transfer",message:"Target must be different."});return;}
    if (!String(newRemark??"").trim()){setAlert({type:"error",title:"Remarks Required",message:"Please write remarks."});return;}
    try {
      setTransferring(true);
      await api.post("/api/transfer",{section:detailRow.section,assetId:Number(assetId),fromBranchId:Number(fromBranchId),toBranchId:Number(toBranchId),remarks:`Transferred by ${currentUserName}: ${String(newRemark).trim()}`,transferredBy:currentUserName},{headers:{Authorization:`Bearer ${token}`}});
      setAlert({type:"success",title:"Transferred",message:"Asset transferred!"});setDetailTab("info");setToBranchId("");setNewRemark("");await fetchAll();closeDetail();
    } catch(err){setAlert({type:"error",title:"Transfer Failed",message:err?.response?.data?.message||err?.message||"Transfer failed"});}
    finally{setTransferring(false);}
  };

  const onExportCSV=()=>{
    if (!sortedRows||sortedRows.length===0){setAlert({type:"error",title:"Export",message:"No data to export"});return;}
    const bySection={};
    sortedRows.forEach(row=>{const s=row.section;if(!bySection[s]) bySection[s]=[];bySection[s].push(row);});
    const wb=XLSX.utils.book_new();
    Object.keys(bySection).forEach(section=>{
      const sAssets=bySection[section];const headers=EXCEL_HEADERS[section]||EXCEL_HEADERS.desktop;
      const rows=sAssets.map(asset=>{const er=mapToExcelRow(section,asset.details,asset.branch);return headers.map(h=>er[h]!==undefined?er[h]:"");});
      const ws=XLSX.utils.aoa_to_sheet([headers,...rows]);
      XLSX.utils.book_append_sheet(wb,ws,section.replace(/_/g," ").substring(0,31));
    });
    XLSX.writeFile(wb,`assets_${branchFilter?`branch_${branchFilter}_`:""}${new Date().toISOString().split("T")[0]}.xlsx`);
    setAlert({type:"success",title:"Exported",message:`${sortedRows.length} assets exported.`});
  };

  const exportSingleAssetDetail=()=>{
    if (!detailRow) return;
    const pairs=buildDetailPairs(detailRow.section,detailRow.details,detailRow)||[];
    exportXLSX([["Field","Value"],...pairs.map(([k,v])=>[k,v])],`asset_${detailRow.section}_${detailRow.assetId}.xlsx`,"Asset Detail");
  };

  const existingAssetKeys = useMemo(()=>{
    const s=new Set();
    reportRows.forEach(r=>{const aid=String(r.assetId||"").trim();const bid=String(r.branchId||"").trim();const sec=String(r.section||"").trim();if(aid&&bid&&sec) s.add(`${sec}::${aid}::${bid}`);});
    return s;
  },[reportRows]);

  const normalizeImportRow=(row,section)=>{
    const n={};
    Object.entries(row).forEach(([k,v])=>{n[k]=v;const fk=headerToFieldKey(k,section);if(fk) n[fk]=v;});
    return n;
  };

  const handleImportExcel=async file=>{
    if (!file||!token) return;
    try {
      setImporting(true);
      const buffer=await file.arrayBuffer();const wb=XLSX.read(buffer,{type:"array"});
      const allRows=[];let rowCounter=1;
      wb.SheetNames.forEach(sheetName=>{
        const ws=wb.Sheets[sheetName];const json=XLSX.utils.sheet_to_json(ws,{defval:""});
        json.forEach(excelRow=>{
          const section=String(excelRow.Section||excelRow.section||sheetName||"").trim().toLowerCase().replace(/\s+/g,"_");
          const branchName=String(excelRow.Branch||excelRow.branch||"").trim();
          const normBranch=s=>String(s||"").toLowerCase().replace(/\bbranch\b/g,"").replace(/\s+/g," ").trim();
          const branchNameToId=new Map(branches.map(b=>[normBranch(b.name).replace(/-/g,"").trim(),b.id]));
          const branchId=branchNameToId.get(normBranch(branchName))||null;
          const sanitizedRow={...excelRow};
          ["purchased_year","panel_purchase_year","ups_purchase_year","monitor_purchase_year","installed_year"].forEach(field=>{
            const v=sanitizedRow[field];if(v===0||v==="0"||v===""||v==null) sanitizedRow[field]=null;
            else{const n=Number(v);sanitizedRow[field]=Number.isFinite(n)&&n>=1900&&n<=2100?n:null;}
          });
          if (section&&branchId) allRows.push({rowNo:rowCounter++,section,branchId,excelRow:normalizeImportRow(sanitizedRow,section)});
        });
      });
      if (allRows.length===0){setAlert({type:"error",title:"Import Failed",message:"No valid data. Check Section and Branch columns."});return;}
      const invalidRows=allRows.filter(row=>!sectionRouteMap[row.section]);
      if (invalidRows.length>0){setAlert({type:"error",title:"Import Failed",message:`Invalid sections: ${[...new Set(invalidRows.map(r=>r.section))].join(", ")}`});return;}
      const newRows=[];const skippedRows=[];
      allRows.forEach(row=>{const assetCode=String(row.excelRow?.["Asset Code"]||"").trim();const key=`${row.section}::${assetCode}::${row.branchId}`;if(assetCode&&existingAssetKeys.has(key)) skippedRows.push(row);else newRows.push(row);});
      if (newRows.length===0){setAlert({type:"warning",title:"All Duplicates Skipped",message:`All ${skippedRows.length} rows already exist.`});return;}
      const res=await api.post("/api/assets/import",{rows:newRows},{headers:{Authorization:`Bearer ${token}`}});
      const result=res?.data?.data||res?.data||{};
      setAlert({type:result.failed>0?"warning":"success",title:"Import Complete",message:`✓ Inserted: ${result.inserted||0} | ✓ Updated: ${result.updated||0} | ✗ Failed: ${result.failed||0}${skippedRows.length?` | ⚠ Skipped: ${skippedRows.length}`:""}`});
      await fetchAll();
    } catch(err){setAlert({type:"error",title:"Import Failed",message:err?.response?.data?.message||err?.message||"Import failed"});}
    finally{setImporting(false);}
  };

  const detailPairs = useMemo(()=>{if(!detailRow) return [];return buildDetailPairs(detailRow.section,detailRow.details,detailRow);},[detailRow]);

  const navItems=[
    {label:"Dashboard",path:"/assetdashboard",icon:"📊"},
    {label:"Branches",path:"/branches",icon:"🏢"},
    {label:"Asset Master",path:"/branch-assets-report",icon:"📦"},
    ...(isAdmin||isSubAdmin?[{label:"Requests",path:"/requests",icon:"📋"},{label:"Users",path:"/admin/users",icon:"👥"}]:[]),
    {label:"Help & Support",path:"/support",icon:"💬"},
  ];

  const HeaderMenu=()=>{
    if (!headerMenu) return null;
    return (
      <>
        <div onClick={closeHeaderMenu} style={{position:"fixed",inset:0,zIndex:99999,background:"transparent"}}/>
        <div style={{position:"fixed",left:headerMenu.x,top:headerMenu.y,zIndex:100000,minWidth:160,background:"white",border:"1.5px solid var(--gray-200)",borderRadius:12,boxShadow:"0 10px 24px rgba(15,23,42,0.12)",padding:8}} onClick={e=>e.stopPropagation()}>
          {headerMenu.type==="sort"&&(
            <>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:"var(--gray-400)",padding:"6px 8px"}}>SORT BY</div>
              {getSortOptions(headerMenu.field).map(opt=>(
                <button key={opt.value} onClick={()=>{handleSortSelect(headerMenu.field,opt.value);closeHeaderMenu();}}
                  style={{width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:10,border:"none",background:sortField===headerMenu.field&&sortDir===opt.value?"var(--blue-50)":"transparent",cursor:"pointer",fontSize:12,fontWeight:700,color:sortField===headerMenu.field&&sortDir===opt.value?NL_BLUE:"var(--gray-700)"}}
                  onMouseEnter={e=>{if(!(sortField===headerMenu.field&&sortDir===opt.value))e.currentTarget.style.background="var(--gray-50)"}}
                  onMouseLeave={e=>{if(!(sortField===headerMenu.field&&sortDir===opt.value))e.currentTarget.style.background="transparent"}}>
                  {opt.label} {sortField===headerMenu.field&&sortDir===opt.value?"✓":""}
                </button>
              ))}
              <div style={{height:1,background:"var(--gray-100)",margin:"6px 0"}}/>
              <button onClick={()=>{setSortField("assetId");setSortDir("asc");closeHeaderMenu();}}
                style={{width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:10,border:"none",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:700,color:"var(--red-600)"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--red-50)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                ✕ Clear sort
              </button>
            </>
          )}
        </div>
      </>
    );
  };

  const clearFilters=()=>{
    setSearch("");setBranchFilter("");setGroupFilter("");setSubCatFilter("");setSectionFilter("");setStatusFilter("");setAssignedUserFilter("");setCurrentPage(1);fetchSubCats("");
    setTotalInfo({count:0,branch:"All Branches",group:"All Categories",subCategory:"All Sub Categories"});
    closeDetail();setSortField("assetId");setSortDir("asc");
  };

  return (
    <>
      <style>{FONTS}{REPORT_STYLES}</style>
      <div className="ar-root">
        <div className="ar-layout">
          {menuOpen&&windowWidth<1024&&<div className="ar-mobile-overlay" onClick={()=>setMenuOpen(false)}/>}

          {/* SIDEBAR */}
          <aside className="rpt-sidebar" style={{width:sidebarWidth(),minHeight:"100vh",transition:"width 0.3s cubic-bezier(0.4,0,0.2,1)",flexShrink:0,overflow:"hidden",position:windowWidth<1024?"fixed":"relative",top:0,left:0,zIndex:300,height:windowWidth<1024?"100vh":"auto"}}>
            {menuOpen&&(
              <div style={{height:"100%",display:"flex",flexDirection:"column",padding:"clamp(16px,2.5vw,26px) clamp(14px,2vw,22px)",minWidth:220,position:"relative",zIndex:1}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"clamp(20px,3vw,30px)"}}>
                  <div onClick={()=>navigate("/")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                    <img src="https://play-lh.googleusercontent.com/zW5KMgLpmTvg0TA4xYIztb5HedXa6mqbAflXHBnNWix5kKetiqtR1ZOqNghuBtleiJkN" alt="Logo" style={{width:34,height:34,borderRadius:8,objectFit:"cover",boxShadow:"0 2px 10px rgba(0,0,0,0.4)"}}/>
                    <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,letterSpacing:"-0.02em",color:"#1474f3ea"}}>
                      Asset<span style={{color:"#f31225ef"}}>IMS</span>
                    </span>
                  </div>
                  <button className="rpt-nav-btn" style={{width:"auto",padding:"6px 9px",borderRadius:9}} onClick={()=>setMenuOpen(false)}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:9,paddingLeft:3}}>Navigation</div>
                <nav style={{display:"flex",flexDirection:"column",gap:3,marginBottom:18}}>
                  {navItems.map((item,idx)=>(
                    <button key={idx} onClick={()=>navigate(item.path)} className="rpt-nav-btn">
                      <span style={{width:26,height:26,borderRadius:7,background:"rgba(255,255,255,0.06)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </nav>

                {sectionCounts.length>0&&(
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8,paddingLeft:3}}>Asset Breakdown</div>
                    <div style={{maxHeight:190,overflowY:"auto"}}>
                      {sectionCounts.map(([sec,cnt])=>(
                        <div key={sec} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 7px",borderRadius:8,cursor:"pointer",transition:"background 0.15s",marginBottom:2}}
                          onClick={()=>{setSectionFilter(sectionFilter===sec?"":sec);setCurrentPage(1);}}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <span style={{fontSize:11,color:sectionFilter===sec?"#60a5fa":"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",gap:5}}>
                            {SECTION_ICONS[sec]||"📦"} {sec}
                          </span>
                          <span style={{fontFamily:"Outfit,sans-serif",fontWeight:700,fontSize:11,color:"#60a5fa",background:"rgba(37,99,235,0.15)",padding:"1px 7px",borderRadius:999}}>{cnt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{marginTop:"auto",paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                  <div style={{background:"linear-gradient(135deg,rgba(37,99,235,0.12),rgba(34,197,94,0.06))",border:"1px solid rgba(37,99,235,0.2)",borderRadius:13,padding:"clamp(10px,1.5vw,15px)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:38,height:38,borderRadius:"50%",background:NL_GRADIENT,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:15,flexShrink:0}}>{user?.name?.charAt(0)?.toUpperCase()||"U"}</div>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</div>
                        <div style={{fontSize:10,background:"linear-gradient(135deg,#60a5fa,#4ade80)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontWeight:700,letterSpacing:"0.06em"}}>{roleLabel}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* MAIN */}
          <section className="ar-main">
            {/* Topbar */}
            <div className="ar-topbar">
              <div className="ar-topbar-left">
                <button className="ar-btn ar-btn-white ar-btn-icon" onClick={()=>setMenuOpen(!menuOpen)}>
                  {menuOpen
                    ?<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    :<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>}
                </button>
                {activeBranchName&&(
                  <button className="ar-btn ar-btn-sm" style={{background:"#eff6ff",border:`1.5px solid ${NL_BLUE}44`,color:NL_BLUE}} onClick={()=>navigate("/branches")}>
                    ← Branches
                  </button>
                )}
              </div>

              <div className="ar-topbar-center">
                <h1 className="ar-page-title" style={{color:NL_BLUE}}>
                  Asset Master <span style={{color:NL_RED}}>Report</span>
                </h1>
                <div className="ar-page-sub">
                  {totalItems.toLocaleString()} assets · {allSections.length} sections
                  {activeBranchName&&<span style={{color:NL_BLUE,fontWeight:600}}> · {activeBranchName}</span>}
                </div>
              </div>

              <div className="ar-topbar-right">
                <button className="ar-btn ar-btn-blue-outline ar-btn-sm" onClick={onExportCSV}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  <span className="btn-label">Export</span>
                </button>
                {canEdit&&(
                  <>
                    <label className="ar-btn ar-btn-green-outline ar-btn-sm" style={{cursor:"pointer"}}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/></svg>
                      <span className="btn-label">{importing?"Importing…":"Import"}</span>
                      <input type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>handleImportExcel(e.target.files?.[0])} disabled={importing}/>
                    </label>
                    <button className="ar-btn ar-btn-teal ar-btn-sm" onClick={()=>setShowHistoryModal(true)}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <span className="btn-label">History</span>
                    </button>
                    <button className="ar-btn ar-btn-success ar-btn-sm" onClick={()=>setShowAddModal(true)}>
                      + <span className="btn-label">Add Asset</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="ar-content">
              {alert&&<div style={{marginBottom:10,animation:"fadeUp .25s ease"}}><Alert type={alert.type} title={alert.title} message={alert.message} onClose={()=>setAlert(null)}/></div>}

              {/* ── Control Bar ── */}
              <div style={{marginBottom:0}}>
                <div className="panel-toggle-bar">
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{fontSize:"var(--text-xs)",fontWeight:700,color:"var(--gray-400)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"Outfit,sans-serif",flexShrink:0}}>View:</span>
                    <button className={`toggle-pill ${showPanel==="hero"?"active":"inactive"}`} onClick={()=>setShowPanel(showPanel==="hero"?"":"hero")}>
                      🏛 Company Info
                    </button>
                    <button
                      className={`toggle-pill ${showPanel==="filters"?"active":"inactive"}`}
                      onClick={()=>setShowPanel(showPanel==="filters"?"":"filters")}
                      style={activeFiltersCount>0&&showPanel!=="filters"?{borderColor:"var(--amber-400)",color:"var(--amber-600)",background:"var(--amber-50)"}:{}}>
                      🔍 Filters
                      {activeFiltersCount>0&&(
                        <span style={{background:NL_RED,color:"white",borderRadius:"50%",width:16,height:16,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{activeFiltersCount}</span>
                      )}
                    </button>
                  </div>

                  <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                    <span className="chip" style={{background:NL_GRADIENT,color:"white",fontSize:"var(--text-xs)",border:"none"}}>
                      {totalItems.toLocaleString()} Assets
                    </span>
                    {/* Quick status chips */}
                    <span className="chip" style={{background:"var(--green-50)",color:"var(--green-700)",border:"1px solid var(--green-200)"}}>
                      ✅ {statusCounts.Active} Active
                    </span>
                    <span className="chip" style={{background:"var(--red-50)",color:"var(--red-600)",border:"1px solid var(--red-100)"}}>
                      ⚠ {statusCounts.Inactive+statusCounts.Repair} Issues
                    </span>
                    {branchFilter&&(
                      <span className="active-filter-chip">
                        🏢 {activeBranchName}
                        <button onClick={()=>{setBranchFilter("");navigate("/branch-assets-report");}}>×</button>
                      </span>
                    )}
                    {sectionFilter&&(
                      <span className="active-filter-chip" style={{background:"var(--purple-600)"}}>
                        {SECTION_ICONS[sectionFilter]||"📦"} {sectionFilter}
                        <button onClick={()=>setSectionFilter("")}>×</button>
                      </span>
                    )}
                    {statusFilter&&(
                      <span className="active-filter-chip" style={{background:"var(--green-600)"}}>
                        ● {statusFilter}
                        <button onClick={()=>setStatusFilter("")}>×</button>
                      </span>
                    )}
                    {activeFiltersCount>0&&(
                      <button onClick={clearFilters} style={{padding:"3px 9px",borderRadius:999,fontSize:"var(--text-xs)",fontWeight:700,background:"var(--red-50)",border:"1.5px solid var(--red-100)",color:"var(--red-600)",cursor:"pointer",fontFamily:"Outfit,sans-serif"}}>
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Hero Panel */}
                <div className={`collapsible-panel${showPanel==="hero"?" open":""}`}>
                  <div style={{background:"white",border:"1.5px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 18px 18px",overflow:"hidden",boxShadow:"0 8px 24px rgba(15,23,42,.06)"}}>
                    <NepalLifeHeroCompact
                      totalItems={reportRows.length}
                      allSections={allSections.length}
                      totalBranches={branches.length}
                      activeCount={statusCounts.Active}
                      inactiveCount={statusCounts.Inactive}
                      repairCount={statusCounts.Repair}
                    />
                  </div>
                </div>

                {/* Filters Panel */}
                <div className={`collapsible-panel${showPanel==="filters"?" open":""}`}>
                  <div className="filter-panel">
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(150px,18vw,200px),1fr))",gap:"clamp(10px,1.5vw,16px)",alignItems:"end"}}>
                      <div style={{gridColumn:"span 2",minWidth:0}}>
                        <label className="rpt-label">🔍 Search Assets</label>
                        <div className="search-wrapper">
                          <input type="text" placeholder="Search by code, branch, brand, user…" className="rpt-input" value={search} onChange={e=>{setSearch(e.target.value);setCurrentPage(1);}}/>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                      </div>
                      <div>
                        <label className="rpt-label">🏢 Branch</label>
                        <select className="rpt-select" value={branchFilter} onChange={e=>{setBranchFilter(e.target.value);setCurrentPage(1);}}>
                          <option value="">All Branches</option>
                          {branchOptions.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="rpt-label">🗂 Category</label>
                        <select className="rpt-select" value={groupFilter} onChange={e=>{const gid=e.target.value;setGroupFilter(gid);setSubCatFilter("");setCurrentPage(1);fetchSubCats(gid);}}>
                          <option value="">All Categories</option>
                          {groups.map(g=><option key={g.id} value={g.id}>{g.name} ({g.id})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="rpt-label">🏷 Sub Category</label>
                        <select className="rpt-select" value={subCatFilter} onChange={e=>{setSubCatFilter(e.target.value);setCurrentPage(1);}}>
                          <option value="">All Sub Categories</option>
                          {subCats.map(s=><option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="rpt-label">👤 Assigned User</label>
                        <select value={assignedUserFilter} onChange={e=>{setAssignedUserFilter(e.target.value);setCurrentPage(1);}} className="rpt-select">
                          <option value="">All Users</option>
                          {assignedUserOptions.map(u=><option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="rpt-label">● Status</label>
                        <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setCurrentPage(1);}} className="rpt-select">
                          <option value="">All Statuses</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Repair">Repair</option>
                        </select>
                      </div>
                    </div>

                    <div style={{marginTop:"clamp(12px,1.5vw,18px)",paddingTop:"clamp(10px,1.2vw,15px)",borderTop:"1px solid var(--gray-100)",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:9}}>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:"var(--text-xs)",fontWeight:700,color:NL_BLUE,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Outfit,sans-serif"}}>Results</span>
                        <span className="chip" style={{background:NL_GRADIENT,color:"#fff",border:"none"}}>{totalInfo.count.toLocaleString()} Assets</span>
                        <span className="chip" style={{background:"#eff6ff",color:NL_BLUE,border:`1px solid ${NL_BLUE}33`}}>{totalInfo.branch}</span>
                        {groupFilter&&<span className="chip" style={{background:"#f5f3ff",color:"#6d28d9",border:"1px solid #ddd6fe"}}>{totalInfo.group}</span>}
                        {subCatFilter&&<span className="chip" style={{background:"#f0fdf4",color:"#15803d",border:"1px solid #bbf7d0"}}>{totalInfo.subCategory}</span>}
                      </div>
                      <button onClick={clearFilters} style={{display:"inline-flex",height:32,alignItems:"center",justifyContent:"center",borderRadius:9,background:"#0f172a",padding:"0 13px",fontSize:"var(--text-xs)",fontWeight:700,color:"#e2e8f0",border:"none",cursor:"pointer",gap:5}}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Pills */}
              {allSections.length>0&&(
                <div style={{background:"white",border:"1.5px solid var(--gray-200)",borderRadius:13,padding:"clamp(8px,1vw,12px) clamp(12px,1.5vw,16px)",marginTop:9,marginBottom:9,display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",boxShadow:"var(--shadow-sm)"}}>
                  <span style={{fontSize:"var(--text-xs)",fontWeight:700,color:"var(--gray-400)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"Outfit,sans-serif",flexShrink:0}}>Section:</span>
                  <div className="section-pills">
                    <button className={`section-pill${!sectionFilter?" active":""}`} onClick={()=>{setSectionFilter("");setCurrentPage(1);}}>All</button>
                    {allSections.map(sec=>(
                      <button key={sec} className={`section-pill${sectionFilter===sec?" active":""}`} onClick={()=>{setSectionFilter(sectionFilter===sec?"":sec);setCurrentPage(1);}}>
                        {SECTION_ICONS[sec]||""} {sec}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Branch Banner */}
              {activeBranchName&&(
                <div style={{background:NL_GRADIENT_90,borderRadius:13,padding:"clamp(10px,1.2vw,14px) clamp(14px,2vw,20px)",marginBottom:9,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:9}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:"clamp(18px,2.5vw,24px)"}}>🏢</span>
                    <div>
                      <div style={{fontFamily:"Outfit,sans-serif",fontWeight:800,fontSize:"clamp(12px,1.4vw,15px)",color:"white"}}>Viewing: {activeBranchName}</div>
                      <div style={{fontSize:"var(--text-xs)",color:"rgba(255,255,255,0.7)"}}>{totalItems} assets in this branch</div>
                    </div>
                  </div>
                  <button className="ar-btn ar-btn-sm" style={{background:"rgba(255,255,255,0.2)",border:"1.5px solid rgba(255,255,255,0.35)",color:"white"}} onClick={()=>{setBranchFilter("");navigate("/branch-assets-report");}}>✕ Clear</button>
                </div>
              )}

              {/* Table */}
              <div className="ar-table-card" style={{overflowX:"auto"}}>
                {loading?(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"clamp(40px,6vw,70px) 0",gap:14}}>
                    <Spinner size={38}/><p style={{color:"var(--gray-500)",fontSize:"var(--text-base)",margin:0}}>Loading assets…</p>
                  </div>
                ):pagedRows.length?(
                  <table className="ar-table">
                    <thead>
                      <tr>
                        {[
                          {label:"#",         field:null,           color:NL_BLUE},
                          {label:"Asset Name [Asset Code]",field:"assetId",      color:NL_BLUE},
                          {label:"Category",  field:"categoryId",   color:NL_BLUE},
                          {label:"Sub-Cat",   field:"subCategoryCode",color:NL_BLUE},
                          {label:"Branch",    field:"branch",       color:NL_BLUE},
                          {label:"Assigned User",field:"assignedUser",color:NL_BLUE},
                          {label:"Last Updated",field:"lastUpdated",color:NL_RED},
                          {label:"Status",    field:"status",       color:NL_RED},
                          {label:"Action",    field:null,           color:NL_RED},
                        ].map(h=>(
                          <th key={h.label}
                            style={{verticalAlign:"middle",cursor:h.field?"pointer":"default",background:h.color,position:"relative"}}
                            onClick={e=>{if(!h.field) return; openHeaderMenu(e,{type:"sort",field:h.field});}}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:5}}>
                              <span>{h.label}</span>
                              {h.field&&(
                                <span style={{opacity:sortField===h.field?1:0.5,fontSize:11}}>
                                  {sortField===h.field?<span style={{fontWeight:900}}>{sortDir==="asc"?"↑":"↓"}</span>:<span>⇅</span>}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.map((r,idx)=>{
                        const globalIndex=(currentPage-1)*pageSize+idx+1;
                        return (
                          <tr key={`${r.section}-${r.assetId||"NA"}-${globalIndex}`} style={{cursor:"pointer"}} onClick={()=>openDetail(r)}>
                            <td style={{color:"var(--gray-400)",fontWeight:600,fontFamily:"Outfit,sans-serif",fontSize:"var(--text-xs)"}} onClick={e=>e.stopPropagation()}>{globalIndex}</td>
                            <td onClick={e=>e.stopPropagation()}>
                              <div style={{display:"flex",alignItems:"center",gap:7}}>
                                <div>
                                  <div style={{fontWeight:700,color:"var(--gray-900)",fontSize:"var(--text-sm)",fontFamily:"Outfit,sans-serif",display:"flex",alignItems:"center",gap:4,textTransform:"uppercase"}}>{show(r.section)}</div>
                                  <div style={{fontSize:"var(--text-xs)",color:"var(--gray-400)",marginTop:1,letterSpacing:"0.04em",display:"flex",alignItems:"center",gap:4}}>
                                    {show(r.assetId)}{r.assetId&&r.assetId!=="N/A"&&(<button onClick={e=>{e.stopPropagation();copyToClipboard(r.assetId);}} 
                                    style={{background:"none",border:"none",cursor:"pointer",opacity:0.35,padding:"1px 3px",fontSize:10,borderRadius:4,transition:"opacity .15s"}} title="Copy" onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                                    onMouseLeave={e=>e.currentTarget.style.opacity="0.35"}>📋</button>)}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="ar-badge ar-badge-purple">{show(r.categoryId)}</span></td>
                            <td><span className="ar-badge ar-badge-green">{show(r.subCategoryCode)}</span></td>
                            <td style={{color:"var(--gray-700)",fontWeight:500}}><div style={{fontSize:"var(--text-sm)"}}>{show(r.branch)}</div></td>
                            <td>
                              {r.assignedUser?(
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <div style={{width:22,height:22,borderRadius:"50%",background:NL_GRADIENT,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:9,fontWeight:800,flexShrink:0}}>{String(r.assignedUser).charAt(0).toUpperCase()}</div>
                                  <span style={{fontSize:"var(--text-sm)",color:"var(--gray-700)"}}>{r.assignedUser}</span>
                                </div>
                              ):<span style={{fontSize:"var(--text-sm)",color:"var(--gray-300)"}}>—</span>}
                            </td>
                            <td style={{fontSize:"var(--text-xs)",color:"var(--gray-400)",whiteSpace:"nowrap"}}>{formatUpdated(r.lastUpdated)}</td>
                            <td><span className={getStatusClass(r.status)}>{normalizeStatus(r.status)}</span></td>
                            <td onClick={e=>e.stopPropagation()}>
                              <button className="ar-btn ar-btn-primary ar-btn-sm" onClick={()=>openDetail(r)}>View →</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ):(
                  <div className="ar-empty">
                    <svg width="52" height="52" fill="none" stroke="var(--gray-200)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                    <p style={{color:"var(--gray-700)",fontWeight:700,fontSize:"var(--text-lg)",margin:0,fontFamily:"Outfit,sans-serif"}}>No assets found</p>
                    <p style={{color:"var(--gray-400)",fontSize:"var(--text-sm)",margin:0}}>Try adjusting your filters or search query</p>
                    {activeFiltersCount>0&&<button className="ar-btn ar-btn-blue-outline ar-btn-sm" onClick={clearFilters}>Clear all filters</button>}
                  </div>
                )}
              </div>

              {totalItems>0&&(
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={p=>setCurrentPage(p)} pageSize={pageSize} onPageSizeChange={size=>{setPageSize(size);setCurrentPage(1);}} totalItems={totalItems}/>
              )}

              {/* ═══ DETAIL OVERLAY ═══ */}
              {detailOpen&&(
                <div className="ar-detail-overlay" onClick={e=>{if(e.target===e.currentTarget) closeDetail();}}>
                  <div className="ar-detail-panel">
                    {/* Header */}
                    <div className="ar-detail-header">
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,position:"relative",zIndex:1}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                            <div style={{width:40,height:40,borderRadius:11,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                              {SECTION_ICONS[detailRow?.section]||"📦"}
                            </div>
                            <div>
                              <div style={{fontSize:"var(--text-xs)",fontWeight:700,color:"rgba(255,255,255,0.55)",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"Outfit,sans-serif"}}>Asset Details</div>
                              <div style={{fontFamily:"Outfit,sans-serif",fontSize:"clamp(0.95rem,2.5vw,1.3rem)",fontWeight:900,color:"white",letterSpacing:"-0.02em",display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                                {show(detailRow?.assetId)}
                                {detailRow?.assetId&&detailRow.assetId!=="N/A"&&(
                                  <button onClick={()=>copyToClipboard(detailRow.assetId)}
                                    style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",padding:"2px 7px",borderRadius:5,fontSize:10,cursor:"pointer",fontFamily:"Outfit,sans-serif",fontWeight:600}}>
                                    📋 Copy
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
                            <span style={{display:"inline-flex",alignItems:"center",padding:"3px 9px",borderRadius:7,background:"rgba(255,255,255,0.18)",fontSize:"var(--text-xs)",fontWeight:700,color:"white"}}>{show(detailRow?.section)}</span>
                            <span style={{display:"inline-flex",alignItems:"center",padding:"3px 9px",borderRadius:7,background:"rgba(255,255,255,0.12)",fontSize:"var(--text-xs)",color:"rgba(255,255,255,0.85)"}}>{show(detailRow?.subCategoryCode)}</span>
                            <span style={{display:"inline-flex",alignItems:"center",padding:"3px 9px",borderRadius:7,background:"rgba(255,255,255,0.12)",fontSize:"var(--text-xs)",color:"rgba(255,255,255,0.85)"}}>🏢 {show(detailRow?.branch)}</span>
                            {detailRow?.assignedUser&&<span style={{display:"inline-flex",alignItems:"center",padding:"3px 9px",borderRadius:7,background:"rgba(255,255,255,0.12)",fontSize:"var(--text-xs)",color:"rgba(255,255,255,0.8)"}}>👤 {detailRow.assignedUser}</span>}
                            <span className={getStatusClass(detailRow?.status)} style={{borderColor:"rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",color:"white"}}>{normalizeStatus(detailRow?.status)}</span>
                          </div>
                        </div>

                        <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"flex-start"}}>
                          {canEdit&&(
                            <button className="ar-btn ar-btn-sm" style={{background:"rgba(255,255,255,0.12)",border:"1.5px solid rgba(255,255,255,0.2)",color:"white"}}
                              onClick={()=>{const bid=detailRow?.branchId;const cfg=sectionRouteMap[String(detailRow?.section||"").toLowerCase()];const sec=cfg?.plural||detailRow?.section;const aid=detailRow?.details?.id??detailRow?.assetId;const sc=detailRow?.subCategoryCode||"";navigate(`/maintenance?branchId=${bid}&section=${encodeURIComponent(sec)}&assetId=${aid}&subCat=${encodeURIComponent(sc)}`);}} disabled={!detailRow}>
                              🔧 Maintenance
                            </button>
                          )}
                          {canDelete&&<button className="ar-btn ar-btn-sm" style={{background:"rgb(220,12,12)",border:"1.5px solid rgb(200,2,2)",color:"#fca5a5"}} onClick={handleDelete} disabled={saving||deleting||transferring}>{deleting?"Deleting…":"🗑 Delete"}</button>}
                          <button className="ar-btn ar-btn-sm" style={{background:"rgba(255,255,255,0.12)",border:"1.5px solid rgba(255,255,255,0.2)",color:"white"}} onClick={exportSingleAssetDetail}>⬇ Export</button>
                          <button className="ar-btn ar-btn-sm" style={{background:"rgba(255,255,255,0.12)",border:"1.5px solid rgba(255,255,255,0.2)",color:"white"}}
                            onClick={()=>{const assetCodeRaw=String(detailRow?.assetId||"").trim();setTransferHistoryTarget({assetCode:assetCodeRaw||"N/A",section:detailRow?.section,assetId:getRowIdFromRow()});setTransferHistoryOpen(true);}}>
                            🔀 History
                          </button>
                          <button className="ar-btn ar-btn-sm" style={{background:"rgba(255,255,255,0.9)",border:"none",color:"var(--gray-700)",fontWeight:700}} onClick={closeDetail}>✕</button>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="detail-tabs">
                        <button className={`detail-tab${detailTab==="info"?" active":""}`} onClick={()=>setDetailTab("info")}>
                          <span>📋</span><span className="tab-label">Information</span>
                        </button>
                        {canEdit&&(
                          <button className={`detail-tab${detailTab==="edit"?" active":""}`} onClick={handleOpenEdit}>
                            <span>✏️</span><span className="tab-label">Edit</span>
                          </button>
                        )}
                        {canTransfer&&(
                          <button className={`detail-tab${detailTab==="transfer"?" active":""}`} onClick={()=>{setDetailTab("transfer");setToBranchId("");setNewRemark("");}}>
                            <span>🔄</span><span className="tab-label">Transfer</span>
                          </button>
                        )}
                        {detailRow?.section==="cctv"&&detailRow?.details?.cameras?.length>0&&(
                          <button className={`detail-tab${detailTab==="cameras"?" active":""}`} onClick={()=>setDetailTab("cameras")}>
                            <span>📹</span><span className="tab-label">Cameras ({detailRow.details.cameras.length})</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="ar-detail-body">
                      {/* TAB: INFO */}
                      {detailTab==="info"&&(
                        <>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(160px,18vw,200px),1fr))",gap:"clamp(9px,1.2vw,13px)",marginBottom:"clamp(14px,2vw,20px)"}}>
                            {[
                              {icon:"🏢",label:"Branch",value:show(detailRow?.branch),sub:`Updated: ${formatUpdated(detailRow?.lastUpdated)}`,accent:NL_BLUE},
                              {icon:"🗂",label:"Category / Sub",value:show(detailRow?.categoryId),sub:`${show(detailRow?.subCategoryName)} · ${show(detailRow?.subCategoryCode)}`,accent:"#7c3aed"},
                              {icon:"⚙️",label:"Model / Year",value:show(detailRow?.model),sub:`Year: ${show(detailRow?.purchaseYear)}`,accent:NL_BLUE2},
                              {icon:"👤",label:"Assigned User",value:detailRow?.assignedUser||"Unassigned",sub:`Section: ${show(detailRow?.section)}`,accent:NL_RED},
                            ].map((card,i)=>(
                              <div key={i} className="ar-info-card">
                                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                                  <span style={{fontSize:"clamp(15px,1.8vw,19px)"}}>{card.icon}</span>
                                  <span style={{fontSize:"var(--text-xs)",fontWeight:700,color:card.accent,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"Outfit,sans-serif"}}>{card.label}</span>
                                </div>
                                <div style={{fontFamily:"Outfit,sans-serif",fontSize:"clamp(0.82rem,1.2vw,0.95rem)",fontWeight:800,color:"var(--gray-900)",marginBottom:3,wordBreak:"break-word"}}>{card.value}</div>
                                <div style={{fontSize:"var(--text-xs)",color:"var(--gray-400)"}}>{card.sub}</div>
                              </div>
                            ))}
                          </div>

                          <div className="ar-divider">
                            <div className="ar-divider-line"/>
                            <span className="ar-divider-text">All Fields · {detailPairs.length} properties</span>
                            <div className="ar-divider-line"/>
                          </div>

                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(160px,18vw,200px),1fr))",gap:"clamp(7px,0.9vw,10px)"}}>
                            {detailPairs.map(([label,value],i)=>{
                              const isStatus=isStatusField(label);
                              const isRemark=label==="Remarks";
                              const isIP=label.toLowerCase().includes("ip");
                              return (
                                <div key={`${label}-${i}`} className="ar-field-item" style={isRemark?{gridColumn:"1 / -1"}:{}}>
                                  <div style={{fontSize:"var(--text-xs)",fontWeight:700,color:"var(--gray-400)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:4,fontFamily:"Outfit,sans-serif"}}>{label}</div>
                                  {isStatus?(
                                    <span className={getStatusClass(value)}>{value}</span>
                                  ):isIP&&value!=="N/A"?(
                                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                                      <code style={{fontSize:11,fontFamily:"'Courier New',monospace",background:"var(--gray-50)",padding:"2px 6px",borderRadius:5,border:"1px solid var(--gray-200)",color:"var(--gray-800)"}}>{value}</code>
                                      <button onClick={()=>copyToClipboard(value)} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,opacity:0.5}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0.5"}>📋</button>
                                    </div>
                                  ):(
                                    <div style={{fontSize:"var(--text-sm)",fontWeight:value==="N/A"?400:600,color:value==="N/A"?"var(--gray-300)":"var(--gray-900)",wordBreak:"break-word",lineHeight:1.5,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:4}}>
                                      <span>{value}</span>
                                      {value!=="N/A"&&value.length>3&&(
                                        <button className="copy-btn" onClick={()=>copyToClipboard(value)}>📋</button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {/* TAB: EDIT */}
                      {detailTab==="edit"&&canEdit&&(
                        <div className="ar-action-block ar-action-edit" style={{marginBottom:0}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:11,marginBottom:"clamp(12px,1.5vw,18px)"}}>
                            <div>
                              <div style={{fontFamily:"Outfit,sans-serif",fontWeight:800,fontSize:"clamp(13px,1.4vw,15px)",color:"var(--amber-600)",display:"flex",alignItems:"center",gap:7,marginBottom:3}}><span>✏️</span> Edit Asset</div>
                              <div style={{fontSize:"var(--text-sm)",color:"var(--gray-500)"}}>Update fields below — remarks are required</div>
                            </div>
                            <div style={{display:"flex",gap:7}}>
                              <button className="ar-btn ar-btn-amber ar-btn-sm" onClick={handleSaveEdit} disabled={saving||!String(newRemark??"").trim()}>{saving?"Saving…":"✓ Save Changes"}</button>
                              <button className="ar-btn ar-btn-ghost ar-btn-sm" onClick={handleCancelEdit} disabled={saving}>✕ Cancel</button>
                            </div>
                          </div>
                          <div style={{marginBottom:"clamp(12px,1.5vw,16px)",padding:"clamp(10px,1.2vw,13px) clamp(11px,1.3vw,15px)",border:"1.5px solid var(--amber-200)",borderRadius:12,background:"var(--amber-50)"}}>
                            <label style={{display:"block",fontSize:"var(--text-xs)",fontWeight:700,color:"var(--gray-600)",marginBottom:5}}>Remarks * <span style={{color:"var(--red-500)"}}>Required before saving</span></label>
                            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                              <span style={{padding:"8px 10px",background:"var(--amber-100)",border:"1.5px solid var(--amber-200)",borderRadius:9,fontSize:"var(--text-xs)",fontWeight:700,color:"var(--amber-600)",whiteSpace:"nowrap",flexShrink:0}}>By {currentUserName}:</span>
                              <textarea style={{flex:1,minWidth:180,padding:"8px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",outline:"none",fontSize:"var(--text-sm)",resize:"vertical",fontFamily:"DM Sans,sans-serif"}} value={newRemark} onChange={e=>setNewRemark(e.target.value)} placeholder="Describe what changed and why…" rows={2}/>
                            </div>
                          </div>
                          <div className="ar-divider"><div className="ar-divider-line"/><span className="ar-divider-text">Editable Fields</span><div className="ar-divider-line"/></div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(180px,20vw,240px),1fr))",gap:"clamp(8px,1vw,11px)"}}>
                            {(EXCEL_HEADERS[detailRow?.section]||[]).filter(h=>!["Section","Branch","Asset Code","Remarks"].includes(h)).map(header=>{
                              const fieldKey=headerToFieldKey(header,detailRow?.section);
                              if (!fieldKey||!Object.prototype.hasOwnProperty.call(editValues,fieldKey)) return null;
                              const fieldValue=editValues[fieldKey];
                              if (isStatusField(header)) {
                                return (
                                  <div key={fieldKey} style={{padding:"clamp(9px,1.1vw,12px) clamp(10px,1.2vw,14px)",border:"1.5px solid var(--gray-200)",borderRadius:10,background:"white"}}>
                                    <label style={{display:"block",fontSize:"var(--text-xs)",fontWeight:700,color:"var(--gray-400)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:5}}>{header}</label>
                                    <select style={{width:"100%",padding:"7px 11px",borderRadius:9,border:"1.5px solid #e2e8f0",outline:"none",fontSize:"var(--text-sm)"}} value={normalizeStatus(fieldValue)} onChange={e=>setEditValues(prev=>({...prev,[fieldKey]:e.target.value}))}>
                                      {statusOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                  </div>
                                );
                              }
                              return (
                                <div key={fieldKey} style={{padding:"clamp(9px,1.1vw,12px) clamp(10px,1.2vw,14px)",border:"1.5px solid var(--gray-200)",borderRadius:10,background:"white"}}>
                                  <label style={{display:"block",fontSize:"var(--text-xs)",fontWeight:700,color:"var(--gray-400)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:5}}>{header}</label>
                                  <input style={{width:"100%",padding:"7px 11px",borderRadius:9,border:"1.5px solid #e2e8f0",outline:"none",fontSize:"var(--text-sm)",fontFamily:"DM Sans,sans-serif"}} type="text" value={fieldValue??""} onChange={e=>setEditValues(prev=>({...prev,[fieldKey]:e.target.value}))} placeholder={header.includes("Date")?"YYYY-MM-DD":""}/>
                                </div>
                              );
                            }).filter(Boolean)}
                          </div>
                        </div>
                      )}

                      {/* TAB: TRANSFER */}
                      {detailTab==="transfer"&&canTransfer&&(
                        <div className="ar-action-block ar-action-transfer" style={{marginBottom:0}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:11,marginBottom:"clamp(14px,1.8vw,20px)"}}>
                            <div>
                              <div style={{fontFamily:"Outfit,sans-serif",fontWeight:800,fontSize:"clamp(13px,1.4vw,15px)",color:"var(--purple-600)",display:"flex",alignItems:"center",gap:7,marginBottom:3}}><span>🔄</span> Transfer Asset</div>
                              <div style={{fontSize:"var(--text-sm)",color:"var(--gray-500)"}}>Move this asset to another branch permanently</div>
                            </div>
                            <div style={{display:"flex",gap:7}}>
                              <button className="ar-btn ar-btn-purple ar-btn-sm" onClick={handleTransfer} disabled={transferring||!String(newRemark??"").trim()||!toBranchId}>{transferring?"Transferring…":"🔄 Confirm Transfer"}</button>
                              <button className="ar-btn ar-btn-ghost ar-btn-sm" onClick={()=>setDetailTab("info")} disabled={transferring}>✕ Cancel</button>
                            </div>
                          </div>

                          <div style={{display:"flex",alignItems:"center",gap:11,padding:"clamp(11px,1.3vw,15px) clamp(14px,1.8vw,19px)",background:"var(--purple-50)",border:"1.5px solid var(--purple-100)",borderRadius:12,marginBottom:"clamp(12px,1.5vw,16px)",flexWrap:"wrap"}}>
                            <div style={{textAlign:"center"}}>
                              <div style={{fontSize:"var(--text-xs)",fontWeight:700,color:"var(--gray-400)",marginBottom:3,textTransform:"uppercase"}}>From</div>
                              <div style={{fontWeight:700,fontSize:"var(--text-sm)",color:"var(--gray-800)"}}>{activeBranchName||`Branch #${detailRow?.branchId}`}</div>
                            </div>
                            <div style={{flex:1,height:2,background:"linear-gradient(90deg,var(--purple-300),var(--purple-500))",borderRadius:999,position:"relative",minWidth:36}}>
                              <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",background:"white",padding:"2px 5px",borderRadius:5,fontSize:14}}>→</div>
                            </div>
                            <div style={{textAlign:"center"}}>
                              <div style={{fontSize:"var(--text-xs)",fontWeight:700,color:"var(--gray-400)",marginBottom:3,textTransform:"uppercase"}}>To</div>
                              <div style={{fontWeight:700,fontSize:"var(--text-sm)",color:toBranchId?NL_BLUE:"var(--gray-400)"}}>
                                {toBranchId?branchOptions.find(b=>String(b.id)===String(toBranchId))?.name||"Selected":"Select below"}
                              </div>
                            </div>
                          </div>

                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(clamp(200px,25vw,260px),1fr))",gap:"clamp(11px,1.5vw,15px)"}}>
                            <div>
                              <label style={{display:"block",fontSize:"var(--text-xs)",fontWeight:700,color:"var(--gray-600)",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.08em"}}>Target Branch *</label>
                              <select style={{width:"100%",padding:"clamp(8px,1vw,11px) clamp(10px,1.2vw,14px)",borderRadius:10,border:"1.5px solid #e2e8f0",outline:"none",fontSize:"var(--text-sm)",background:"white"}} value={toBranchId} onChange={e=>setToBranchId(e.target.value)} disabled={transferring}>
                                <option value="">-- Select destination branch --</option>
                                {branchOptions.filter(b=>Number(b.id)!==Number(detailRow?.branchId)).map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{display:"block",fontSize:"var(--text-xs)",fontWeight:700,color:"var(--gray-600)",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.08em"}}>Reason / Remarks *</label>
                              <div style={{display:"flex",gap:7}}>
                                <span style={{padding:"8px 9px",background:"var(--purple-50)",border:"1.5px solid var(--purple-100)",borderRadius:9,fontSize:"var(--text-xs)",fontWeight:700,color:"var(--purple-600)",whiteSpace:"nowrap",flexShrink:0}}>By {currentUserName.split(" ")[0]}:</span>
                                <textarea style={{flex:1,padding:"8px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",outline:"none",fontSize:"var(--text-sm)",resize:"vertical",fontFamily:"DM Sans,sans-serif"}} value={newRemark} onChange={e=>setNewRemark(e.target.value)} placeholder="Reason for transfer…" rows={3} disabled={transferring}/>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB: CAMERAS */}
                      {detailTab==="cameras"&&detailRow?.section==="cctv"&&detailRow?.details?.cameras&&(
                        <div>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"clamp(12px,1.5vw,17px)",flexWrap:"wrap",gap:8}}>
                            <div>
                              <div style={{fontFamily:"Outfit,sans-serif",fontWeight:800,fontSize:"clamp(13px,1.5vw,15px)",color:"var(--gray-800)",display:"flex",alignItems:"center",gap:7}}>
                                📹 CCTV Cameras
                                <span style={{background:NL_BLUE,color:"white",borderRadius:999,padding:"1px 8px",fontSize:12,fontWeight:700}}>{detailRow.details.cameras.length}</span>
                              </div>
                              <div style={{fontSize:"var(--text-sm)",color:"var(--gray-500)",marginTop:2}}>NVR: {detailRow.assetId} · {detailRow.branch}</div>
                            </div>
                            <div style={{display:"flex",gap:7}}>
                              <span style={{padding:"4px 11px",borderRadius:999,background:"var(--green-50)",color:"var(--green-700)",border:"1px solid var(--green-200)",fontSize:"var(--text-xs)",fontWeight:700,fontFamily:"Outfit,sans-serif"}}>
                                {detailRow.details.cameras.filter(c=>c.cctv_status==="On").length} Online
                              </span>
                              <span style={{padding:"4px 11px",borderRadius:999,background:"var(--red-50)",color:"var(--red-600)",border:"1px solid var(--red-100)",fontSize:"var(--text-xs)",fontWeight:700,fontFamily:"Outfit,sans-serif"}}>
                                {detailRow.details.cameras.filter(c=>c.cctv_status!=="On").length} Offline
                              </span>
                            </div>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(180px,20vw,230px),1fr))",gap:"clamp(11px,1.5vw,15px)"}}>
                            {detailRow.details.cameras.map((camera,idx)=>{
                              const isOn=camera.cctv_status==="On";
                              return (
                                <div key={camera.id||idx} className="camera-card">
                                  <div className="camera-card-header" style={{background:isOn?"var(--green-50)":"var(--gray-50)"}}>
                                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                                      <div className="camera-icon" style={{background:isOn?NL_GRADIENT:"var(--gray-300)"}}>{idx+1}</div>
                                      <div>
                                        <div style={{fontSize:"var(--text-sm)",fontWeight:700,color:"var(--gray-800)"}}>Camera {idx+1}</div>
                                        <div style={{fontSize:"var(--text-xs)",color:"var(--gray-500)"}}>ID: {camera.id||"N/A"}</div>
                                      </div>
                                    </div>
                                    <span className={`ar-status ${isOn?"ar-status-active":"ar-status-inactive"}`}>{camera.cctv_status||"Unknown"}</span>
                                  </div>
                                  <div style={{padding:"clamp(10px,1.3vw,14px)",display:"flex",flexDirection:"column",gap:7}}>
                                    {[{icon:"📷",label:"Model",val:camera.camera_model},{icon:"📍",label:"Location",val:camera.location}].map(({icon,label,val})=>(
                                      <div key={label} style={{padding:"7px 9px",background:"var(--gray-50)",border:"1px solid var(--gray-200)",borderRadius:8,display:"flex",gap:7,alignItems:"flex-start"}}>
                                        <span style={{fontSize:13,flexShrink:0}}>{icon}</span>
                                        <div>
                                          <div style={{fontSize:"var(--text-xs)",fontWeight:700,color:"var(--gray-400)",textTransform:"uppercase",marginBottom:1}}>{label}</div>
                                          <div style={{fontSize:"var(--text-sm)",fontWeight:600,color:"var(--gray-700)"}}>{val||"Not specified"}</div>
                                        </div>
                                      </div>
                                    ))}
                                    {camera.remarks&&<div style={{padding:"7px 9px",background:"var(--amber-50)",border:"1px solid var(--amber-100)",borderRadius:8,fontSize:"var(--text-xs)",color:"var(--amber-700)",fontStyle:"italic"}}>💬 {camera.remarks}</div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <HeaderMenu/>
              <TransferHistoryModal isOpen={transferHistoryOpen} onClose={()=>setTransferHistoryOpen(false)} assetCode={transferHistoryTarget.assetCode} section={transferHistoryTarget.section} assetId={transferHistoryTarget.assetId} token={token}/>
              <AddAssetModal open={showAddModal} onClose={()=>setShowAddModal(false)} branches={branchOptions} groups={groups} subCats={filteredSubCats} fetchAddSubCats={fetchAddSubCats} addSaving={addSaving} onSubmit={handleAddAssetSubmit}/>
              <AssetHistoryModal isOpen={showHistoryModal} onClose={()=>setShowHistoryModal(false)} token={token} useTransfersTable={true}/>
            </div>
          </section>
        </div>
        <Footer/>
      </div>

      {copyToast&&<div className="copy-toast">{copyToast}</div>}
    </>
  );
}