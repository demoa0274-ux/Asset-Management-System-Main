// src/pages/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Footer from "../components/Layout/Footer";
import NepalLifeLogo from "../assets/nepallife.png";

/* ── Brand ──────────────────────────────────────────────────── */
const NL_BLUE      = "#0B5CAB";
const NL_BLUE2     = "#1474F3";
const NL_RED       = "#f31225ef";
const NL_GRADIENT    = `linear-gradient(135deg, ${NL_BLUE} 0%, ${NL_BLUE2} 55%, ${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg, ${NL_BLUE} 70%, ${NL_RED} 30%)`;

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

const PAGE_STYLES = `
  *, *::before, *::after { box-sizing:border-box; }
  :root {
    --nl-blue:${NL_BLUE}; --nl-blue-2:${NL_BLUE2}; --nl-red:${NL_RED}; --nl-ink:#0F172A;
    --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-200:#bfdbfe;
    --blue-500:#3b82f6; --blue-600:#2563eb; --blue-700:#1d4ed8;
    --green-50:#f0fdf4; --green-100:#dcfce7; --green-200:#bbf7d0;
    --green-500:#22c55e; --green-600:#16a34a; --green-700:#15803d;
    --red-50:#fef2f2; --red-100:#fee2e2; --red-500:#ef4444; --red-600:#dc2626;
    --amber-50:#fffbeb; --amber-100:#fef3c7; --amber-500:#f59e0b; --amber-600:#d97706;
    --violet-50:#f5f3ff; --violet-100:#ede9fe; --violet-200:#ddd6fe;
    --violet-600:#7c3aed; --violet-700:#6d28d9;
    --rose-50:#fff1f2; --rose-100:#ffe4e6; --rose-200:#fecdd3;
    --rose-600:#e11d48; --rose-700:#be123c;
    --sky-50:#f0f9ff; --sky-100:#e0f2fe; --sky-200:#bae6fd;
    --sky-600:#0284c7; --sky-700:#0369a1;
    --gray-50:#f9fafb; --gray-100:#f3f4f6; --gray-200:#e5e7eb;
    --gray-300:#d1d5db; --gray-400:#9ca3af; --gray-500:#6b7280;
    --gray-600:#4b5563; --gray-700:#374151; --gray-800:#1f2937; --gray-900:#111827;
    --white:#ffffff;
    --shadow-sm:0 1px 2px rgba(0,0,0,0.05);
    --shadow:0 1px 3px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.05);
    --shadow-md:0 4px 6px rgba(0,0,0,0.06),0 10px 24px rgba(0,0,0,0.08);
    --shadow-lg:0 8px 16px rgba(0,0,0,0.08),0 24px 48px rgba(0,0,0,0.1);
    --radius:10px; --radius-lg:14px; --radius-xl:18px;
  }

  @keyframes floaty  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes bounceIn {
    0%{opacity:0;transform:scale(0.94) translateY(10px)}
    60%{transform:scale(1.02) translateY(-3px)}
    100%{opacity:1;transform:scale(1) translateY(0)}
  }

  .au-root   { font-family:'DM Sans',sans-serif; background:var(--gray-50); min-height:100vh; color:var(--gray-900); }
  .au-layout { display:flex; min-height:100vh; }

  /* ─── Sidebar ─── */
  .au-sidebar {
    background:linear-gradient(168deg,#0a1628 0%,#1a3050 45%,#0c1e33 100%);
    border-right:1px solid rgba(59,130,246,0.13);
    box-shadow:5px 0 30px rgba(0,0,0,0.25);
    position:relative; overflow:hidden;
    transition:width 0.3s cubic-bezier(0.4,0,0.2,1);
    flex-shrink:0;
  }
  .au-sidebar::before {
    content:''; position:absolute; top:-70px; right:-50px;
    width:180px; height:180px; border-radius:50%;
    background:radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%);
    pointer-events:none;
  }
  .au-sidebar::after {
    content:''; position:absolute; bottom:-50px; left:-30px;
    width:140px; height:140px; border-radius:50%;
    background:radial-gradient(circle,rgba(34,197,94,0.12) 0%,transparent 70%);
    pointer-events:none;
  }
  .au-sidebar-inner { height:100%; display:flex; flex-direction:column; padding:26px 20px; min-width:220px; position:relative; z-index:1; }
  .au-nav-item {
    display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:13px;
    background:transparent; border:1.5px solid transparent;
    color:rgba(255,255,255,0.52); font-size:13.5px; font-weight:500;
    cursor:pointer; text-align:left; width:100%;
    transition:all 0.22s cubic-bezier(0.4,0,0.2,1);
    font-family:'DM Sans',sans-serif; letter-spacing:0.01em;
  }
  .au-nav-item:hover {
    background:linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,197,94,0.08));
    border-color:rgba(59,130,246,0.28); color:#93c5fd; transform:translateX(5px);
  }
  .au-nav-icon {
    width:30px; height:30px; border-radius:9px; background:rgba(255,255,255,0.07);
    display:inline-flex; align-items:center; justify-content:center; font-size:14px;
    flex-shrink:0; transition:background 0.2s;
  }
  .au-nav-item:hover .au-nav-icon { background:rgba(59,130,246,0.2); }

  /* ─── Main ─── */
  .au-main    { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
  .au-topbar  {
    background:var(--white); border-bottom:1px solid var(--gray-100);
    padding:6px 12px; display:flex; align-items:center; justify-content:space-between;
    gap:12px; flex-wrap:wrap; position:sticky; top:0; z-index:30;
    box-shadow:0 1px 4px rgba(0,0,0,0.06);
  }
  .au-topbar-left  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .au-topbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .au-content      { flex:1; padding:0 4px; overflow-y:auto; }

  /* ─── Panel Toggle Bar ─── */
  .au-panel-toggle-bar {
    background:white; border-bottom:1px solid var(--gray-100);
    padding:8px 12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;
    position:sticky; top:49px; z-index:25; box-shadow:0 1px 3px rgba(0,0,0,0.04);
  }
  .au-toggle-pill {
    display:inline-flex; align-items:center; gap:6px; padding:6px 14px;
    border-radius:999px; font-size:12px; font-weight:700;
    border:1.5px solid var(--gray-200); background:var(--gray-50);
    color:var(--gray-600); cursor:pointer; transition:all 0.18s ease;
    font-family:'Outfit',sans-serif; position:relative;
  }
  .au-toggle-pill:hover { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .au-toggle-pill.active {
    background:${NL_GRADIENT}; color:white; border-color:transparent;
    box-shadow:0 2px 10px rgba(11,92,171,0.3);
  }

  /* ─── Active Filter Chips ─── */
  .au-active-filters { display:flex; align-items:center; gap:6px; flex-wrap:wrap; flex:1; min-width:0; }
  .au-filter-chip {
    display:inline-flex; align-items:center; gap:5px; padding:4px 10px;
    border-radius:999px; font-size:11px; font-weight:700;
    background:rgba(11,92,171,0.08); border:1px solid rgba(11,92,171,0.2);
    color:var(--blue-700); font-family:'Outfit',sans-serif;
  }
  .au-filter-chip button {
    width:14px; height:14px; border-radius:50%; border:none;
    background:rgba(11,92,171,0.15); color:var(--blue-700);
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:900; padding:0; transition:background 0.15s;
  }
  .au-filter-chip button:hover { background:var(--red-500); color:white; }
  .au-clear-all { font-size:11px; font-weight:700; color:var(--red-600); cursor:pointer; background:none; border:none; padding:2px 6px; border-radius:6px; font-family:'Outfit',sans-serif; }
  .au-clear-all:hover { background:var(--red-50); }

  /* ─── Collapsible Panel ─── */
  .au-collapsible-panel {
    overflow:hidden; transition:max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
    max-height:0; opacity:0;
  }
  .au-collapsible-panel.open { max-height:600px; opacity:1; }

  /* ─── Buttons ─── */
  .au-btn {
    display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
    border-radius:var(--radius); font-weight:600; font-size:13px; border:none;
    cursor:pointer; transition:all 0.18s ease; white-space:nowrap;
    font-family:'Outfit',sans-serif; letter-spacing:0.01em; line-height:1;
  }
  .au-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .au-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .au-btn:active:not(:disabled) { transform:translateY(0) scale(0.98); }
  .au-btn-primary      { background:var(--blue-600); color:white; box-shadow:0 2px 8px rgba(37,99,235,0.25); }
  .au-btn-primary:hover:not(:disabled) { background:var(--blue-700); }
  .au-btn-success      { background:var(--green-600); color:white; box-shadow:0 2px 8px rgba(22,163,74,0.25); }
  .au-btn-success:hover:not(:disabled) { background:var(--green-700); }
  .au-btn-white        { background:white; border:1.5px solid var(--gray-200); color:var(--gray-700); box-shadow:var(--shadow-sm); }
  .au-btn-white:hover:not(:disabled) { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .au-btn-ghost        { background:transparent; border:1.5px solid var(--gray-200); color:var(--gray-600); }
  .au-btn-ghost:hover:not(:disabled) { background:var(--gray-100); }
  .au-btn-blue-outline { background:var(--blue-50); border:1.5px solid var(--blue-200); color:var(--blue-700); }
  .au-btn-blue-outline:hover:not(:disabled) { background:var(--blue-100); }
  .au-btn-green-outline{ background:var(--green-50); border:1.5px solid var(--green-200); color:var(--green-700); }
  .au-btn-green-outline:hover:not(:disabled) { background:var(--green-100); }
  .au-btn-sky-outline  { background:var(--sky-50);  border:1.5px solid var(--sky-200);  color:var(--sky-700); }
  .au-btn-sky-outline:hover:not(:disabled) { background:var(--sky-100); }
  .au-btn-rose-outline { background:var(--rose-50); border:1.5px solid var(--rose-200); color:var(--rose-600); }
  .au-btn-rose-outline:hover:not(:disabled) { background:var(--rose-100); }
  .au-btn-sm   { padding:6px 12px; font-size:12px; }
  .au-btn-icon { width:34px; height:34px; padding:0; justify-content:center; border-radius:var(--radius); }
  .au-btn-label { display:inline; }
  @media(max-width:480px) { .au-btn-label { display:none; } }

  /* ─── Inputs ─── */
  .au-input, .au-select, .au-textarea {
    width:100%; background:rgba(55,65,82,0.06); border:1.5px solid var(--gray-200);
    border-radius:var(--radius); padding:9px 13px; color:var(--gray-900); font-size:13.5px;
    font-family:'DM Sans',sans-serif; outline:none; transition:all 0.18s ease;
  }
  .au-input:focus, .au-select:focus, .au-textarea:focus { border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
  .au-input::placeholder { color:var(--gray-400); }
  .au-select { cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:calc(100% - 12px) center; padding-right:34px; }
  .au-label { font-size:11.5px; font-weight:600; color:var(--gray-600); margin-bottom:6px; display:block; }

  /* ─── Filter card ─── */
  .au-filter-card  { background:white; border-radius:10px; padding:14px 12px; box-shadow:var(--shadow); }
  .au-filter-card1 { background:white; border-radius:10px; padding:20px 12px; box-shadow:var(--shadow); }

  /* ─── Hero ─── */
  .au-hero-wrap {
    background:linear-gradient(135deg,rgba(11,92,171,0.10) 0%,rgba(255,255,255,0.72) 45%,rgba(225,29,46,0.06) 100%);
    box-shadow:0 18px 60px rgba(2,32,53,0.14); overflow:hidden; position:relative;
  }
  .au-hero-wrap::before {
    content:''; position:absolute; inset:-2px;
    background:
      radial-gradient(ellipse at 15% 30%,rgba(20,116,243,0.22) 0%,transparent 55%),
      radial-gradient(ellipse at 85% 20%,rgba(225,29,46,0.14) 0%,transparent 55%),
      radial-gradient(ellipse at 70% 85%,rgba(11,92,171,0.12) 0%,transparent 60%);
    pointer-events:none;
  }
  .au-hero-inner { position:relative; padding:14px 20px; display:flex; align-items:center; justify-content:space-between; gap:18px; }
  .au-hero-logo  { width:80px; max-width:28vw; height:auto; display:block; filter:drop-shadow(0 8px 18px rgba(2,32,53,0.22)); animation:floaty 4.5s ease-in-out infinite; }
  .au-hero-title { font-family:Syne,sans-serif; font-weight:900; font-size:clamp(1.1rem,2vw,1.45rem); letter-spacing:-0.03em; margin:0; color:var(--nl-ink); line-height:1.1; }
  .au-hero-title .blue { color:var(--nl-blue); }
  .au-hero-title .red  { color:var(--nl-red); }
  .au-hero-divider { width:46px; height:3px; border-radius:999px; background:linear-gradient(90deg,var(--nl-blue),var(--nl-red)); margin-top:8px; }
  .au-hero-sub { margin-top:6px; font-size:11.5px; color:rgba(15,23,42,0.62); line-height:1.6; max-width:680px; }

  /* ─── Stat cards ─── */
  .au-stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:14px; margin-bottom:20px; }
  .au-stat-card  { background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); padding:16px 18px; box-shadow:var(--shadow-sm); transition:all 0.18s ease; }
  .au-stat-card:hover { border-color:var(--blue-200); box-shadow:var(--shadow); transform:translateY(-2px); }
  .au-stat-icon  { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:16px; margin-bottom:10px; }
  .au-stat-value { font-family:'Outfit',sans-serif; font-size:1.5rem; font-weight:800; color:var(--gray-900); line-height:1; }
  .au-stat-label { font-size:11.5px; color:var(--gray-500); margin-top:4px; font-weight:500; }

  /* ─── Table ─── */
  .au-table-card { background:white; margin-top:1px; border-radius:var(--radius); border:1.5px solid var(--gray-200); box-shadow:var(--shadow); overflow:hidden; animation:fadeUp 0.35s ease both; margin-bottom:20px; }
  .au-table      { width:100%; border-collapse:collapse; }
  .au-table thead th {
    padding:12px 16px; text-align:left; font-size:10.5px; font-weight:700;
    color:rgba(255,255,255,0.92); text-transform:uppercase; letter-spacing:0.09em;
    white-space:nowrap; font-family:'Outfit',sans-serif;
    background:${NL_BLUE}; border-right:0.5px solid rgba(255,255,255,0.15);
  }
  .au-table thead th:last-child { background:${NL_RED}; }
  .au-table tbody tr { border-bottom:1px solid var(--gray-100); transition:background 0.12s; }
  .au-table tbody tr:last-child { border-bottom:none; }
  .au-table tbody tr:hover { background:var(--blue-50); }
  .au-table tbody td { padding:13px 16px; font-size:13px; color:var(--gray-700); border-right:0.5px solid rgba(0,0,0,0.05); }

  /* ─── Badges ─── */
  .au-badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:6px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; }
  .au-badge-blue   { background:var(--blue-50);   color:var(--blue-700);   border:1px solid var(--blue-200);   }
  .au-badge-green  { background:var(--green-50);  color:var(--green-700);  border:1px solid var(--green-200);  }
  .au-badge-gray   { background:var(--gray-100);  color:var(--gray-600);   border:1px solid var(--gray-200);   }
  .au-badge-rose   { background:var(--rose-50);   color:var(--rose-600);   border:1px solid var(--rose-200);   }
  .au-badge-violet { background:var(--violet-50); color:var(--violet-700); border:1px solid var(--violet-200); }
  .au-badge-amber  { background:var(--amber-50);  color:var(--amber-600);  border:1px solid var(--amber-100);  }

  /* ─── Empty / Spinner ─── */
  .au-empty   { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:12px; text-align:center; }
  .au-spinner { border-radius:50%; border:2.5px solid var(--gray-200); border-top-color:var(--blue-500); animation:spin 0.7s linear infinite; }

  /* ─── Alert ─── */
  .au-alert { border-radius:var(--radius); padding:12px 16px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:10px; border:1.5px solid; margin:8px 0; }
  .au-alert-error { background:var(--red-50); border-color:var(--red-100); color:var(--red-600); }

  /* ─── Modal ─── */
  .au-modal-overlay {
    position:fixed; inset:0; z-index:9999; background:rgba(17,24,39,0.6);
    backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center;
    padding:16px; animation:fadeIn 0.2s ease;
  }
  .au-modal-panel {
    width:100%; max-width:560px; background:white; border-radius:var(--radius-xl);
    overflow:hidden; box-shadow:var(--shadow-lg);
    animation:bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    border:1.5px solid var(--gray-200);
  }
  .au-modal-header { padding:22px 26px; flex-shrink:0; }
  .au-modal-body   { padding:20px 26px; }
  .au-modal-footer { padding:16px 26px 24px; display:flex; justify-content:flex-end; gap:10px; border-top:1px solid var(--gray-100); }

  /* ─── Toggle ─── */
  .au-toggle-track {
    position:relative; width:44px; height:24px; border-radius:999px;
    transition:background 0.3s; cursor:pointer; border:none; outline:none;
  }
  .au-toggle-track.on  { background:var(--green-500); }
  .au-toggle-track.off { background:var(--gray-300); }
  .au-toggle-thumb {
    position:absolute; top:2px; width:20px; height:20px; border-radius:50%;
    background:white; box-shadow:0 2px 6px rgba(0,0,0,0.2);
    transition:left 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .au-toggle-track.on  .au-toggle-thumb { left:22px; }
  .au-toggle-track.off .au-toggle-thumb { left:2px; }

  /* ─── Search ─── */
  .au-search-wrap { position:relative; }
  .au-search-wrap input { padding-right:38px; }
  .au-search-wrap .icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--gray-400); pointer-events:none; }

  /* ─── Mobile overlay ─── */
  .au-mobile-overlay { position:fixed; inset:0; z-index:49; background:rgba(17,24,39,0.4); }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--gray-300); border-radius:999px; }
  ::-webkit-scrollbar-thumb:hover { background:var(--gray-400); }

  @media(max-width:1024px) {
    .au-sidebar { position:fixed; top:0; left:0; height:100vh; z-index:100; }
    .au-content { padding:3px; }
  }
  @media(max-width:640px) {
    .au-topbar { padding:8px 10px; }
    .au-content { padding:1px; }
    .au-table thead th, .au-table tbody td { padding:10px 12px; font-size:12px; }
    .au-hero-inner { flex-direction:column; text-align:center; }
    .au-hero-divider { margin-left:auto; margin-right:auto; }
  }
`;

/* ── Helpers ─────────────────────────────────────────────────── */
const AVATAR_COLORS = ["#2563eb","#16a34a","#7c3aed","#e11d48","#d97706","#0284c7","#0f766e"];

const Avatar = ({ name, size = 36 }) => {
  const letter = (name || "?")[0].toUpperCase();
  const color  = AVATAR_COLORS[(name || "").charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:size * 0.38, flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.15)", fontFamily:"Outfit,sans-serif" }}>
      {letter}
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const r = (role || "").toLowerCase();
  if (r === "admin") return <span className="au-badge au-badge-rose" style={{ textTransform:"uppercase", letterSpacing:"0.06em" }}>Admin</span>;
  if (r === "sub_admin" || r === "subadmin") return <span className="au-badge au-badge-violet" style={{ textTransform:"uppercase", letterSpacing:"0.06em" }}>Sub Admin</span>;
  return <span className="au-badge au-badge-green" style={{ textTransform:"uppercase", letterSpacing:"0.06em" }}>User</span>;
};

const Spinner = ({ size = 28, color }) => (
  <div className="au-spinner" style={{ width:size, height:size, borderTopColor:color || "var(--blue-500)" }} />
);

/* ── Hero Component ──────────────────────────────────────────── */
function NepalLifeHero() {
  return (
    <div className="au-hero-wrap">
      <div className="au-hero-inner">
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(11,92,171,0.10)", border:"1px solid rgba(11,92,171,0.20)", color:"rgba(11,92,171,0.90)", borderRadius:999, padding:"5px 12px", fontSize:10, fontWeight:900, letterSpacing:".08em", textTransform:"uppercase", marginBottom:10 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:NL_BLUE2, boxShadow:"0 0 8px rgba(20,116,243,0.65)" }} />
            Nepal Life · User Management
          </div>
          <h2 className="au-hero-title">
            <span className="blue">NEPAL</span>
            <span className="red">LIFE</span>{" "}
            <span style={{ color:"rgba(15,23,42,0.65)", fontWeight:800 }}>Insurance Co. Ltd.</span>
          </h2>
          <div className="au-hero-divider" />
          <p className="au-hero-sub">Manage system users, assign roles, and control access permissions.</p>
        </div>
        <img src={NepalLifeLogo} alt="Nepal Life" className="au-hero-logo" />
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function AdminUsers() {
  const navigate = useNavigate();
  const { token, isAdmin, isSubAdmin, user } = useAuth();
  const roleLabel = isAdmin ? "ADMIN" : isSubAdmin ? "SUB ADMIN" : "USER";

  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [err,        setErr]        = useState("");
  const [q,          setQ]          = useState("");
  const [menuOpen,   setMenuOpen]   = useState(true);
  const [windowWidth,setWindowWidth]= useState(window.innerWidth);
  const [showPanel,  setShowPanel]  = useState("hero");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({ name:"", email:"", role:"user", is_admin:false, password:"" });

  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const sidebarWidth = () => {
    if (windowWidth < 640)  return menuOpen ? "85vw" : "0";
    if (windowWidth < 1024) return menuOpen ? "280px" : "0";
    return menuOpen ? "260px" : "0";
  };

  const togglePanel = panel => setShowPanel(prev => prev === panel ? "" : panel);
  const activeFiltersCount = [q].filter(Boolean).length;

  /* ─── Data ─── */
  const fetchUsers = async () => {
    if (!token || !isAdmin) return;
    setLoading(true); setErr("");
    try {
      const res = await api.get("/api/admin/users", { headers:{ Authorization:`Bearer ${token}` } });
      setRows(res?.data?.data || []);
    } catch (e) { setErr(e?.response?.data?.message || "Failed to load users"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchUsers(); }, [token, isAdmin]);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    if (!s) return rows;
    return rows.filter(u => [u?.name, u?.email, u?.role, String(u?.id)].filter(Boolean).join(" ").toLowerCase().includes(s));
  }, [rows, q]);

  /* ─── Counts ─── */
  const totalUsers   = rows.length;
  const adminCount   = rows.filter(u => (u.role||"").toLowerCase() === "admin").length;
  const subAdminCount = rows.filter(u => (u.role||"").toLowerCase().includes("sub")).length;
  const userCount    = rows.filter(u => (u.role||"").toLowerCase() === "user").length;

  /* ─── Modal ─── */
  const openCreate = () => { setEditing(null); setForm({ name:"", email:"", role:"user", is_admin:false, password:"" }); setModalOpen(true); };
  const openEdit   = u => { setEditing(u); setForm({ name:u?.name||"", email:u?.email||"", role:u?.role||"user", is_admin:u?.is_admin||false, password:"" }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setSaving(false); };

  const save = async () => {
    if (!token) return;
    setErr(""); setSaving(true);
    try {
      if (editing) await api.put(`/api/admin/users/${editing.id}`, form, { headers:{ Authorization:`Bearer ${token}` } });
      else         await api.post(`/api/admin/users`, form, { headers:{ Authorization:`Bearer ${token}` } });
      closeModal(); fetchUsers();
    } catch (e) { setErr(e?.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!token || !window.confirm("Permanently delete this user?")) return;
    try {
      await api.delete(`/api/admin/users/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      fetchUsers();
    } catch (e) { setErr(e?.response?.data?.message || "Failed to delete"); }
  };

  /* ─── Nav ─── */
  const navItems = [
    { label:"Dashboard",    path:"/assetdashboard",       icon:"📊" },
    { label:"Branches",     path:"/branches",             icon:"🏢" },
    { label:"Asset Master", path:"/branch-assets-report", icon:"📦" },
    ...(isAdmin || isSubAdmin ? [{ label:"Requests", path:"/requests", icon:"📋" },{ label:"Users", path:"/admin/users", icon:"👥" }] : []),
    { label:"Help & Support", path:"/support", icon:"💬" },
  ];

  /* ─── Access Denied ─── */
  if (!isAdmin) {
    return (
      <>
        <div className="au-root" style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:"white", border:"1.5px solid var(--red-100)", borderRadius:"var(--radius-xl)", padding:"48px 40px", textAlign:"center", maxWidth:380, boxShadow:"var(--shadow-lg)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🚫</div>
            <h2 style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:20, color:"var(--gray-900)", margin:"0 0 8px" }}>Access Denied</h2>
            <p style={{ color:"var(--gray-500)", fontSize:14, margin:"0 0 20px" }}>You do not have permission to view this page.</p>
            <button className="au-btn au-btn-primary" onClick={() => navigate(-1)}>← Go Back</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="au-root">
      <style>{FONTS}{PAGE_STYLES}</style>
      <div className="au-layout">
        {menuOpen && windowWidth < 1024 && <div className="au-mobile-overlay" onClick={() => setMenuOpen(false)} />}

        {/* ─── SIDEBAR ─── */}
        <aside className="au-sidebar" style={{ width:sidebarWidth(), minHeight:"100vh", position:windowWidth<1024?"fixed":"relative", top:0, left:0, zIndex:300, height:windowWidth<1024?"100vh":"auto" }}>
          {menuOpen && (
            <div className="au-sidebar-inner">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
                <div onClick={() => navigate("/")} style={{ cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                    <img src="https://play-lh.googleusercontent.com/zW5KMgLpmTvg0TA4xYIztb5HedXa6mqbAflXHBnNWix5kKetiqtR1ZOqNghuBtleiJkN" alt="NLI Logo" style={{ width:36, height:36, borderRadius:8, objectFit:"cover", boxShadow:"0 2px 10px rgba(0,0,0,0.4)" }} />
                    <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, letterSpacing:"-0.02em", color:"#1474f3ea" }}>Asset<span style={{ color:"#f31225ef" }}>IMS</span></span>
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.38)", fontWeight:600, letterSpacing:"0.06em" }}>USER MANAGEMENT</div>
                </div>
              </div>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:8, paddingLeft:4, fontFamily:"Outfit,sans-serif" }}>Navigation</div>
              <nav style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:24 }}>
                {navItems.map((item, idx) => (
                  <button key={idx} className="au-nav-item" onClick={() => navigate(item.path)}>
                    <span className="au-nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
              <div style={{ marginTop:"auto", paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ background:"linear-gradient(135deg,rgba(37,99,235,0.14),rgba(34,197,94,0.07))", border:"1px solid rgba(37,99,235,0.22)", borderRadius:14, padding:14, marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar name={user?.name} size={40} />
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name}</div>
                      <div style={{ fontSize:10, background:"linear-gradient(135deg,#60a5fa,#4ade80)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontWeight:700, letterSpacing:"0.06em", fontFamily:"Outfit,sans-serif" }}>{roleLabel}</div>
                    </div>
                  </div>
                </div>
                <Link to="/register" style={{ display:"block", textAlign:"center", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)", color:"rgba(255,255,255,0.7)", borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:"Outfit,sans-serif", transition:"background 0.18s" }}>
                  + Register New User
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* ─── MAIN ─── */}
        <main className="au-main">
          {/* Topbar */}
          <div className="au-topbar">
            <div className="au-topbar-left">
              <button className="au-btn au-btn-white au-btn-icon" onClick={() => setMenuOpen(!menuOpen)} title="Toggle Menu">
                {menuOpen
                  ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>}
              </button>
              <div style={{ width:1, height:20, background:"var(--gray-200)" }} />
              <div style={{ fontSize:13, fontWeight:700, color:"var(--gray-700)", fontFamily:"Outfit,sans-serif" }}>User Management</div>
            </div>
            <div className="au-topbar-right">
              <button className="au-btn au-btn-success au-btn-sm" onClick={openCreate}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                Add User
              </button>
            </div>
          </div>

          {/* ─── Panel Toggle Bar ─── */}
          <div className="au-panel-toggle-bar">
            <button className={`au-toggle-pill ${showPanel === "hero" ? "active" : ""}`} onClick={() => togglePanel("hero")}>
              🏛️ Overview
            </button>
            <button className={`au-toggle-pill ${showPanel === "filters" ? "active" : ""}`} onClick={() => togglePanel("filters")}>
              🔍 Search
              {activeFiltersCount > 0 && (
                <span style={{ position:"absolute", top:-6, right:-6, width:16, height:16, borderRadius:"50%", background:"var(--red-500)", color:"white", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid white", fontFamily:"Outfit,sans-serif" }}>{activeFiltersCount}</span>
              )}
            </button>

            <div className="au-active-filters">
              {q && (
                <span className="au-filter-chip">
                  🔎 "{q.length > 18 ? q.slice(0,18)+"…" : q}"
                  <button onClick={() => setQ("")}>×</button>
                </span>
              )}
              {q && <button className="au-clear-all" onClick={() => setQ("")}>Clear</button>}
            </div>

            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
              <span className="au-badge au-badge-blue" style={{ fontSize:11 }}>{filtered.length} / {totalUsers}</span>
              <span className="au-badge au-badge-gray" style={{ fontSize:11 }}>{roleLabel}</span>
            </div>
          </div>

          {/* ─── Collapsible: Hero ─── */}
          <div className={`au-collapsible-panel ${showPanel === "hero" ? "open" : ""}`}>
            <div className="au-filter-card" style={{ margin:"2px 2px 0" }}>
              <NepalLifeHero />
            </div>
          </div>

          {/* ─── Collapsible: Filters / Search ─── */}
          <div className={`au-collapsible-panel ${showPanel === "filters" ? "open" : ""}`}>
            <div className="au-filter-card1" style={{ margin:"2px 2px 0" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14, alignItems:"end" }}>
                <div style={{ gridColumn:"span 2", minWidth:0 }}>
                  <label className="au-label">Search Users</label>
                  <div className="au-search-wrap">
                    <input type="text" placeholder="Name, email, role, ID…" className="au-input" value={q} onChange={e => setQ(e.target.value)} />
                    <svg className="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Content ─── */}
          <div className="au-content">
            {/* Error */}
            {err && (
              <div className="au-alert au-alert-error">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                {err}
                <button onClick={() => setErr("")} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"inherit", fontWeight:800 }}>✕</button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="au-stats-grid" style={{ margin:"14px 2px 0" }}>
              {[
                { label:"Total Users",  value:totalUsers,   icon:"👥", color:"var(--blue-100)" },
                { label:"Admins",       value:adminCount,   icon:"🔑", color:"var(--rose-50)"  },
                { label:"Sub Admins",   value:subAdminCount,icon:"🛡️", color:"var(--violet-50)"},
                { label:"Users",        value:userCount,    icon:"👤", color:"var(--green-50)" },
              ].map(s => (
                <div key={s.label} className="au-stat-card">
                  <div className="au-stat-icon" style={{ background:s.color }}>{s.icon}</div>
                  <div className="au-stat-value">{s.value}</div>
                  <div className="au-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* User Table */}
            <div className="au-table-card" style={{ overflowX:"auto", margin:"2px" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--gray-100)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--green-500)", boxShadow:"0 0 8px rgba(34,197,94,0.6)" }} />
                  <span style={{ fontSize:13, fontWeight:700, color:"var(--gray-700)", fontFamily:"Outfit,sans-serif" }}>
                    {loading ? "Loading…" : `${filtered.length} of ${totalUsers} users`}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="au-empty"><Spinner size={36} /><p style={{ color:"var(--gray-500)", fontSize:14, margin:0 }}>Loading users…</p></div>
              ) : filtered.length === 0 ? (
                <div className="au-empty">
                  <div style={{ fontSize:48 }}>👥</div>
                  <p style={{ color:"var(--gray-700)", fontWeight:700, fontSize:15, margin:0, fontFamily:"Outfit,sans-serif" }}>No users found</p>
                  <p style={{ color:"var(--gray-400)", fontSize:12, margin:0 }}>{q ? "Try a different search term" : "Add a user to get started"}</p>
                  {!q && <button className="au-btn au-btn-success" onClick={openCreate}>+ Add First User</button>}
                </div>
              ) : (
                <table className="au-table">
                  <thead>
                    <tr>{["#ID","User","Email","Role","Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id}>
                        <td>
                          <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:30, height:30, borderRadius:8, background:"var(--gray-100)", color:"var(--gray-600)", fontWeight:800, fontSize:12, border:"1.5px solid var(--gray-200)", fontFamily:"Outfit,sans-serif" }}>{u.id}</span>
                        </td>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <Avatar name={u.name} size={32} />
                            <span style={{ fontWeight:700, color:"var(--gray-900)", fontSize:13.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>{u.name || "—"}</span>
                          </div>
                        </td>
                        <td style={{ color:"var(--gray-500)", fontSize:12 }}>{u.email || "—"}</td>
                        <td><RoleBadge role={u.role} /></td>
                        <td>
                          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                            <button className="au-btn au-btn-sky-outline au-btn-sm" onClick={() => openEdit(u)}>
                              <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              Edit
                            </button>
                            <button className="au-btn au-btn-rose-outline au-btn-sm" onClick={() => del(u.id)}>
                              <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* ─── Modal ─── */}
      {modalOpen && (
        <div className="au-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="au-modal-panel">
            {/* Header */}
            <div className="au-modal-header" style={{ background:editing ? "linear-gradient(90deg,var(--sky-50),white)" : NL_GRADIENT, padding:"22px 26px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:editing ? "var(--gray-400)" : "rgba(255,255,255,0.6)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6, fontFamily:"Outfit,sans-serif" }}>
                    {editing ? "Edit Existing User" : "Create New User"}
                  </div>
                  <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:"clamp(1.1rem,3vw,1.4rem)", color:editing ? "var(--gray-900)" : "white", letterSpacing:"-0.02em" }}>
                    {editing ? `Edit: ${editing.name}` : "Add User"}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  {editing && <Avatar name={editing.name} size={36} />}
                  <button className="au-btn au-btn-sm" onClick={closeModal} style={{ background:editing ? "var(--gray-100)" : "rgba(255,255,255,0.15)", border:editing ? "1.5px solid var(--gray-200)" : "1.5px solid rgba(255,255,255,0.25)", color:editing ? "var(--gray-600)" : "white", width:36, height:36, padding:0, justifyContent:"center", borderRadius:"var(--radius)" }}>✕</button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="au-modal-body">
              {err && (
                <div className="au-alert au-alert-error" style={{ marginBottom:14 }}>⚠ {err}</div>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                <div>
                  <label className="au-label">Full Name</label>
                  <input className="au-input" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} />
                </div>
                <div>
                  <label className="au-label">Email Address</label>
                  <input className="au-input" type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))} />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                <div>
                  <label className="au-label">Role</label>
                  <select className="au-select" value={form.role} onChange={e => setForm(f => ({ ...f, role:e.target.value }))}>
                    <option value="user">User</option>
                    <option value="sub_admin">Sub Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="au-label">{editing ? "New Password (blank = keep)" : "Password"}</label>
                  <input className="au-input" type="password" placeholder={editing ? "Leave blank to keep" : "Min. 8 characters"} value={form.password} onChange={e => setForm(f => ({ ...f, password:e.target.value }))} />
                </div>
              </div>

              {/* Admin Toggle */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderRadius:"var(--radius)", border:"1.5px solid var(--gray-200)", background:"var(--gray-50)", padding:"12px 16px" }}>
                <div>
                  <div style={{ fontWeight:700, color:"var(--gray-800)", fontSize:14 }}>Admin Privileges</div>
                  <div style={{ fontSize:12, color:"var(--gray-400)", marginTop:2 }}>Grant full system access</div>
                </div>
                <button
                  type="button"
                  className={`au-toggle-track ${form.is_admin ? "on" : "off"}`}
                  onClick={() => setForm(f => ({ ...f, is_admin:!f.is_admin }))}
                >
                  <span className="au-toggle-thumb" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="au-modal-footer">
              <button className="au-btn au-btn-white" onClick={closeModal}>Cancel</button>
              <button
                className="au-btn"
                onClick={save}
                disabled={saving}
                style={{ background:editing ? "linear-gradient(135deg,var(--sky-600),var(--blue-600))" : NL_GRADIENT, color:"white", boxShadow:editing ? "0 2px 12px rgba(2,132,199,0.3)" : "0 2px 12px rgba(11,92,171,0.3)" }}
              >
                {saving ? (
                  <><div className="au-spinner" style={{ width:14, height:14, borderColor:"rgba(255,255,255,0.3)", borderTopColor:"white" }} />Saving…</>
                ) : editing ? (
                  <><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>Update User</>
                ) : (
                  <><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>Create User</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}