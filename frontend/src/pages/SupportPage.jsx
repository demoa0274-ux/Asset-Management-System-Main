// src/pages/SupportPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Layout/Footer";
import NepalLifeLogo from "../assets/nepallife.png";

/* ── Nepal Life brand ─────────────────────────────────────── */
const NL_BLUE      = "#0B5CAB";
const NL_BLUE2     = "#1474F3";
const NL_RED       = "#f31225ef";
const NL_GRADIENT    = `linear-gradient(135deg, ${NL_BLUE} 0%, ${NL_BLUE2} 55%, ${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg, ${NL_BLUE} 70%, ${NL_RED} 30%)`;

/* ── Fonts ─────────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

/* ── Page Styles ─────────────────────────────────────────── */
const PAGE_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  :root {
    --nl-blue:${NL_BLUE}; --nl-blue-2:${NL_BLUE2}; --nl-red:${NL_RED}; --nl-ink:#0F172A;
    --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-200:#bfdbfe;
    --blue-500:#3b82f6; --blue-600:#2563eb; --blue-700:#1d4ed8; --blue-900:#1e3a8a;
    --green-50:#f0fdf4; --green-100:#dcfce7; --green-200:#bbf7d0;
    --green-500:#22c55e; --green-600:#16a34a; --green-700:#15803d;
    --red-50:#fef2f2; --red-100:#fee2e2; --red-500:#ef4444; --red-600:#dc2626;
    --amber-50:#fffbeb; --amber-100:#fef3c7; --amber-500:#f59e0b; --amber-600:#d97706;
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
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes bounceIn {
    0%{opacity:0;transform:scale(0.94) translateY(10px)}
    60%{transform:scale(1.02) translateY(-3px)}
    100%{opacity:1;transform:scale(1) translateY(0)}
  }
  @keyframes slideDown {
    0%  {transform:translate(-50%,-2rem);opacity:0}
    100%{transform:translate(-50%,0);opacity:1}
  }

  .sp-root   { font-family:'DM Sans',sans-serif; background:var(--gray-50); min-height:100vh; color:var(--gray-900); }
  .sp-layout { display:flex; min-height:100vh; }

  /* ─── Sidebar ─── */
  .sp-sidebar {
    background:linear-gradient(168deg,#0a1628 0%,#1a3050 45%,#0c1e33 100%);
    border-right:1px solid rgba(59,130,246,0.13);
    box-shadow:5px 0 30px rgba(0,0,0,0.25);
    position:relative; overflow:hidden;
    transition:width 0.3s cubic-bezier(0.4,0,0.2,1);
    flex-shrink:0;
  }
  .sp-sidebar::before {
    content:''; position:absolute; top:-70px; right:-50px;
    width:180px; height:180px; border-radius:50%;
    background:radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%);
    pointer-events:none;
  }
  .sp-sidebar::after {
    content:''; position:absolute; bottom:-50px; left:-30px;
    width:140px; height:140px; border-radius:50%;
    background:radial-gradient(circle,rgba(34,197,94,0.12) 0%,transparent 70%);
    pointer-events:none;
  }
  .sp-sidebar-inner { height:100%; display:flex; flex-direction:column; padding:26px 20px; min-width:220px; position:relative; z-index:1; }
  .sp-nav-item {
    display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:13px;
    background:transparent; border:1.5px solid transparent;
    color:rgba(255,255,255,0.52); font-size:13.5px; font-weight:500;
    cursor:pointer; text-align:left; width:100%;
    transition:all 0.22s cubic-bezier(0.4,0,0.2,1);
    font-family:'DM Sans',sans-serif; letter-spacing:0.01em;
  }
  .sp-nav-item:hover {
    background:linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,197,94,0.08));
    border-color:rgba(59,130,246,0.28); color:#93c5fd; transform:translateX(5px);
  }
  .sp-nav-icon {
    width:30px; height:30px; border-radius:9px; background:rgba(255,255,255,0.07);
    display:inline-flex; align-items:center; justify-content:center; font-size:14px;
    flex-shrink:0; transition:background 0.2s;
  }
  .sp-nav-item:hover .sp-nav-icon { background:rgba(59,130,246,0.2); }

  /* ─── Main ─── */
  .sp-main     { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }
  .sp-topbar   {
    background:var(--white); border-bottom:1px solid var(--gray-100);
    padding:6px 12px; display:flex; align-items:center; justify-content:space-between;
    gap:12px; flex-wrap:wrap; position:sticky; top:0; z-index:30;
    box-shadow:0 1px 4px rgba(0,0,0,0.06);
  }
  .sp-topbar-left  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .sp-topbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .sp-content      { flex:1; padding:0 4px; overflow-y:auto; }

  /* ─── Panel Toggle Bar ─── */
  .sp-panel-toggle-bar {
    background:white; border-bottom:1px solid var(--gray-100);
    padding:8px 12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;
    position:sticky; top:49px; z-index:25; box-shadow:0 1px 3px rgba(0,0,0,0.04);
  }
  .sp-toggle-pill {
    display:inline-flex; align-items:center; gap:6px; padding:6px 14px;
    border-radius:999px; font-size:12px; font-weight:700;
    border:1.5px solid var(--gray-200); background:var(--gray-50);
    color:var(--gray-600); cursor:pointer; transition:all 0.18s ease;
    font-family:'Outfit',sans-serif; position:relative;
  }
  .sp-toggle-pill:hover { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .sp-toggle-pill.active {
    background:${NL_GRADIENT}; color:white; border-color:transparent;
    box-shadow:0 2px 10px rgba(11,92,171,0.3);
  }

  /* ─── Active Filter Chips ─── */
  .sp-active-filters { display:flex; align-items:center; gap:6px; flex-wrap:wrap; flex:1; min-width:0; }
  .sp-filter-chip {
    display:inline-flex; align-items:center; gap:5px; padding:4px 10px;
    border-radius:999px; font-size:11px; font-weight:700;
    background:rgba(11,92,171,0.08); border:1px solid rgba(11,92,171,0.2);
    color:var(--blue-700); font-family:'Outfit',sans-serif;
  }
  .sp-filter-chip button {
    width:14px; height:14px; border-radius:50%; border:none;
    background:rgba(11,92,171,0.15); color:var(--blue-700);
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:900; padding:0; transition:background 0.15s;
  }
  .sp-filter-chip button:hover { background:var(--red-500); color:white; }
  .sp-clear-all {
    font-size:11px; font-weight:700; color:var(--red-600); cursor:pointer;
    background:none; border:none; padding:2px 6px; border-radius:6px;
    font-family:'Outfit',sans-serif;
  }
  .sp-clear-all:hover { background:var(--red-50); }

  /* ─── Collapsible Panel ─── */
  .sp-collapsible-panel {
    overflow:hidden; transition:max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
    max-height:0; opacity:0;
  }
  .sp-collapsible-panel.open { max-height:600px; opacity:1; }

  /* ─── Buttons ─── */
  .sp-btn {
    display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
    border-radius:var(--radius); font-weight:600; font-size:13px; border:none;
    cursor:pointer; transition:all 0.18s ease; white-space:nowrap;
    font-family:'Outfit',sans-serif; letter-spacing:0.01em; line-height:1;
  }
  .sp-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .sp-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .sp-btn:active:not(:disabled) { transform:translateY(0) scale(0.98); }
  .sp-btn-primary      { background:var(--blue-600); color:white; box-shadow:0 2px 8px rgba(37,99,235,0.25); }
  .sp-btn-primary:hover:not(:disabled) { background:var(--blue-700); }
  .sp-btn-success      { background:var(--green-600); color:white; box-shadow:0 2px 8px rgba(22,163,74,0.25); }
  .sp-btn-success:hover:not(:disabled) { background:var(--green-700); }
  .sp-btn-amber        { background:var(--amber-500); color:white; }
  .sp-btn-amber:hover:not(:disabled) { background:var(--amber-600); }
  .sp-btn-white        { background:white; border:1.5px solid var(--gray-200); color:var(--gray-700); box-shadow:var(--shadow-sm); }
  .sp-btn-white:hover:not(:disabled) { border-color:var(--blue-300); color:var(--blue-700); background:var(--blue-50); }
  .sp-btn-ghost        { background:transparent; border:1.5px solid var(--gray-200); color:var(--gray-600); }
  .sp-btn-ghost:hover:not(:disabled) { background:var(--gray-100); }
  .sp-btn-blue-outline { background:var(--blue-50); border:1.5px solid var(--blue-200); color:var(--blue-700); }
  .sp-btn-blue-outline:hover:not(:disabled) { background:var(--blue-100); }
  .sp-btn-green-outline{ background:var(--green-50); border:1.5px solid var(--green-200); color:var(--green-700); }
  .sp-btn-green-outline:hover:not(:disabled) { background:var(--green-100); }
  .sp-btn-red-outline  { background:var(--red-50); border:1.5px solid var(--red-100); color:var(--red-600); }
  .sp-btn-red-outline:hover:not(:disabled) { background:var(--red-100); }
  .sp-btn-sm   { padding:6px 12px; font-size:12px; }
  .sp-btn-icon { width:34px; height:34px; padding:0; justify-content:center; border-radius:var(--radius); }
  .sp-btn-label { display:inline; }
  @media(max-width:480px) { .sp-btn-label { display:none; } }

  /* ─── Inputs ─── */
  .sp-input, .sp-select, .sp-textarea {
    width:100%; background:white; border:1.5px solid var(--gray-200); border-radius:var(--radius);
    padding:9px 13px; color:var(--gray-900); font-size:13.5px;
    font-family:'DM Sans',sans-serif; outline:none; transition:all 0.18s ease;
  }
  .sp-input:focus, .sp-select:focus, .sp-textarea:focus {
    border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,130,246,0.1);
  }
  .sp-input::placeholder, .sp-textarea::placeholder { color:var(--gray-400); }
  .sp-select {
    cursor:pointer; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:calc(100% - 12px) center; padding-right:34px;
  }
  .sp-label   { font-size:11.5px; font-weight:600; color:var(--gray-600); margin-bottom:6px; display:block; }
  .sp-textarea { resize:vertical; }

  /* ─── Cards ─── */
  .sp-filter-card  { background:white; border-radius:10px; padding:14px 12px; box-shadow:var(--shadow); }
  .sp-filter-card1 { background:white; border-radius:10px; padding:20px 12px; box-shadow:var(--shadow); }

  /* ─── Table ─── */
  .sp-table-card {
    background:white; margin-top:1px; border-radius:var(--radius); border:1.5px solid var(--gray-200);
    box-shadow:var(--shadow); overflow:hidden; animation:fadeUp 0.35s ease both; margin-bottom:20px;
  }
  .sp-table { width:100%; border-collapse:collapse; }
  .sp-table thead th {
    padding:12px 16px; text-align:left; font-size:10.5px; font-weight:700;
    color:rgba(255,255,255,0.92); text-transform:uppercase; letter-spacing:0.09em;
    white-space:nowrap; font-family:'Outfit',sans-serif;
    background:${NL_BLUE}; border-right:0.5px solid rgba(255,255,255,0.15);
  }
  .sp-table thead th:last-child { background:${NL_RED}; }
  .sp-table tbody tr { border-bottom:1px solid var(--gray-100); transition:background 0.12s; }
  .sp-table tbody tr:last-child { border-bottom:none; }
  .sp-table tbody tr:hover { background:var(--blue-50); }
  .sp-table tbody td { padding:13px 16px; font-size:13px; color:var(--gray-700); border-right:0.5px solid rgba(0,0,0,0.06); }

  /* ─── Badges ─── */
  .sp-badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:6px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; }
  .sp-badge-blue  { background:var(--blue-50);  color:var(--blue-700);   border:1px solid var(--blue-200);   }
  .sp-badge-green { background:var(--green-50); color:var(--green-700);  border:1px solid var(--green-200);  }
  .sp-badge-gray  { background:var(--gray-100); color:var(--gray-600);   border:1px solid var(--gray-200);   }
  .sp-badge-amber { background:var(--amber-50); color:var(--amber-600);  border:1px solid var(--amber-100);  }
  .sp-badge-red   { background:var(--red-50);   color:var(--red-600);    border:1px solid var(--red-100);    }

  /* ─── Preview / Modal ─── */
  .sp-preview-overlay {
    position:fixed; inset:0; z-index:9999; background:rgba(17,24,39,0.6);
    backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center;
    padding:16px; animation:fadeIn 0.2s ease;
  }
  .sp-preview-panel {
    width:100%; max-width:1000px; max-height:90vh; background:white; border-radius:var(--radius-xl);
    overflow:hidden; display:flex; flex-direction:column; box-shadow:var(--shadow-lg);
    animation:bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    border:1.5px solid var(--gray-200);
  }
  .sp-preview-header { background:${NL_GRADIENT_90}; padding:22px 26px; flex-shrink:0; }
  .sp-preview-body   { flex:1; overflow-y:auto; background:var(--gray-50); padding:24px 26px; }

  /* ─── Detail ─── */
  .sp-detail-card { background:white; border-radius:var(--radius-lg); border:1.5px solid var(--gray-200); overflow:hidden; box-shadow:var(--shadow-sm); }
  .sp-detail-card-header { padding:14px 18px; background:var(--gray-50); border-bottom:1.5px solid var(--gray-200); display:flex; align-items:center; gap:10px; }
  .sp-detail-card-body { padding:6px 18px 18px; }
  .sp-detail-row { display:flex; justify-content:space-between; align-items:flex-start; padding:10px 0; border-bottom:1px solid var(--gray-100); gap:12px; }
  .sp-detail-row:last-child { border-bottom:none; }
  .sp-detail-label { font-size:12px; font-weight:600; color:var(--gray-500); white-space:nowrap; }
  .sp-detail-value { font-size:13px; font-weight:600; color:var(--gray-900); text-align:right; max-width:65%; word-break:break-word; }

  /* ─── Search ─── */
  .sp-search-wrap { position:relative; }
  .sp-search-wrap input { padding-right:38px; }
  .sp-search-wrap .icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--gray-400); pointer-events:none; }

  /* ─── Empty ─── */
  .sp-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:12px; text-align:center; }

  /* ─── Spinner ─── */
  .sp-spinner { border-radius:50%; border:2.5px solid var(--gray-200); border-top-color:var(--blue-500); animation:spin 0.7s linear infinite; }

  /* ─── Toast ─── */
  .sp-toast-wrap { position:fixed; top:16px; left:50%; transform:translateX(-50%); z-index:10000; width:min(540px,95vw); }
  .sp-toast { display:flex; align-items:flex-start; gap:12px; border-radius:18px; padding:14px 16px; box-shadow:0 20px 40px rgba(15,23,42,.18); backdrop-filter:blur(10px); animation:slideDown 0.35s ease; }
  .sp-toast-success { border:1px solid #86efac; background:rgba(220,252,231,.92); color:#166534; }
  .sp-toast-error   { border:1px solid #fda4af; background:rgba(255,228,230,.94); color:#9f1239; }

  /* ─── Hero ─── */
  .sp-hero-wrap {
    background:linear-gradient(135deg,rgba(11,92,171,0.10) 0%,rgba(255,255,255,0.72) 45%,rgba(225,29,46,0.06) 100%);
    box-shadow:0 18px 60px rgba(2,32,53,0.14); overflow:hidden; position:relative;
  }
  .sp-hero-wrap::before {
    content:''; position:absolute; inset:-2px;
    background:
      radial-gradient(ellipse at 15% 30%,rgba(20,116,243,0.22) 0%,transparent 55%),
      radial-gradient(ellipse at 85% 20%,rgba(225,29,46,0.14) 0%,transparent 55%),
      radial-gradient(ellipse at 70% 85%,rgba(11,92,171,0.12) 0%,transparent 60%);
    pointer-events:none;
  }
  .sp-hero-inner {
    position:relative; padding:12px 18px;
    display:flex; align-items:center; justify-content:space-between; gap:18px;
  }
  .sp-hero-logo { width:80px; max-width:28vw; height:auto; display:block; filter:drop-shadow(0 8px 18px rgba(2,32,53,0.22)); animation:floaty 4.5s ease-in-out infinite; }
  .sp-hero-title { font-family:Syne,sans-serif; font-weight:900; font-size:clamp(1.1rem,2vw,1.45rem); letter-spacing:-0.03em; margin:0; color:var(--nl-ink); line-height:1.1; }
  .sp-hero-title .blue { color:var(--nl-blue); }
  .sp-hero-title .red  { color:var(--nl-red); }
  .sp-hero-divider { width:46px; height:3px; border-radius:999px; background:linear-gradient(90deg,var(--nl-blue),var(--nl-red)); margin-top:8px; }
  .sp-hero-sub { margin-top:8px; font-size:11.5px; color:rgba(15,23,42,0.62); line-height:1.6; max-width:680px; }

  /* ─── Mobile overlay ─── */
  .sp-mobile-overlay { position:fixed; inset:0; z-index:49; background:rgba(17,24,39,0.4); }

  /* ─── Scrollbar ─── */
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--gray-300); border-radius:999px; }
  ::-webkit-scrollbar-thumb:hover { background:var(--gray-400); }

  @media(max-width:1024px) {
    .sp-sidebar { position:fixed; top:0; left:0; height:100vh; z-index:100; }
    .sp-content { padding:3px; }
  }
  @media(max-width:640px) {
    .sp-topbar { padding:8px 10px; }
    .sp-content { padding:1px; }
    .sp-table thead th, .sp-table tbody td { padding:10px 12px; font-size:12px; }
    .sp-hero-inner { flex-direction:column; text-align:center; }
    .sp-hero-divider { margin-left:auto; margin-right:auto; }
  }
  @media(max-width:768px) {
    .sp-two-col { grid-template-columns:1fr !important; }
  }
`;

/* ─── Hero ─────────────────────────────────────────────────── */
function NepalLifeHeroCompact() {
  return (
    <div className="sp-hero-wrap">
      <div className="sp-hero-inner">
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(11,92,171,0.10)", border:"1px solid rgba(11,92,171,0.20)", color:"rgba(11,92,171,0.90)", borderRadius:999, padding:"5px 12px", fontSize:10, fontWeight:900, letterSpacing:".08em", textTransform:"uppercase", marginBottom:10 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:NL_BLUE2, boxShadow:"0 0 8px rgba(20,116,243,0.65)" }} />
            Nepal Life · Help & Support
          </div>
          <h2 className="sp-hero-title">
            <span className="blue">NEPAL</span>
            <span className="red">LIFE</span>{" "}
            <span style={{ color:"rgba(15,23,42,0.65)", fontWeight:800 }}>Insurance Co. Ltd.</span>
          </h2>
          <div className="sp-hero-divider" />
          <p className="sp-hero-sub">"किनकी जीवन अमूल्य छ" · Help & Support Desk — Submit tickets, track replies, view FAQs.</p>
        </div>
        <img src={NepalLifeLogo} alt="Nepal Life" className="sp-hero-logo" />
      </div>
    </div>
  );
}

/* ─── Atoms ─────────────────────────────────────────────────── */
const Spinner = ({ size = 28, color }) => (
  <div className="sp-spinner" style={{ width:size, height:size, borderTopColor:color || "var(--blue-500)" }} />
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="sp-detail-card-header">
    <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,var(--blue-500),var(--green-500))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:13, color:"var(--gray-800)" }}>{title}</div>
      {subtitle && <div style={{ fontSize:11, color:"var(--gray-400)", marginTop:1 }}>{subtitle}</div>}
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
export default function SupportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const role      = String(user?.role || "").toLowerCase().replace(/[\s_-]/g, "");
  const isAdmin   = role === "admin";
  const isSubAdmin = role === "subadmin";
  const isStaff   = isAdmin || isSubAdmin;
  const roleLabel = isAdmin ? "ADMIN" : isSubAdmin ? "SUB ADMIN" : "USER";

  const [menuOpen, setMenuOpen]     = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPanel, setShowPanel]   = useState("hero"); // "hero" | "filters" | ""

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
  const togglePanel = (panel) => setShowPanel(prev => prev === panel ? "" : panel);

  /* ─── Notifications ─── */
  const [notify, setNotify] = useState({ show:false, type:"success", message:"" });
  const showNotify = useCallback((type, message, ms = 3000) => {
    setNotify({ show:true, type, message });
    window.clearTimeout(showNotify._t);
    showNotify._t = window.setTimeout(() => setNotify(p => ({ ...p, show:false })), ms);
  }, []);

  /* ─── Form ─── */
  const [form, setForm] = useState({ name:user?.name||"", email:user?.email||"", subject:"", message:"" });
  const [loading, setLoading] = useState(false);
  const handleChange = e => { const { name, value } = e.target; setForm(p => ({ ...p, [name]:value })); };

  /* ─── Tickets ─── */
  const [showTickets, setShowTickets] = useState(false);
  const [tickets, setTickets]         = useState([]);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [search, setSearch]           = useState("");

  /* ─── Ticket detail ─── */
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplies, setTicketReplies]   = useState([]);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText]           = useState("");
  const [replyLoading, setReplyLoading]     = useState(false);
  const [forwardRemark, setForwardRemark]   = useState("");
  const [forwardLoading, setForwardLoading] = useState(false);
  const [isEditing, setIsEditing]           = useState(false);
  const [editSubject, setEditSubject]       = useState("");
  const [editMessage, setEditMessage]       = useState("");
  const [editLoading, setEditLoading]       = useState(false);

  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = i => setOpenFaq(openFaq === i ? null : i);

  const navItems = [
    { label:"Dashboard",    path:"/assetdashboard",       icon:"📊" },
    { label:"Branches",     path:"/branches",             icon:"🏢" },
    { label:"Asset Master", path:"/branch-assets-report", icon:"📦" },
    ...(isAdmin || isSubAdmin ? [{ label:"Requests", path:"/requests", icon:"📋" },{ label:"Users", path:"/admin/users", icon:"👥" }] : []),
    { label:"Help & Support", path:"/support", icon:"💬" },
  ];

  const loadTickets = useCallback(async () => {
    try {
      setTicketLoading(true);
      const url = isStaff ? "/api/support" : "/api/support/my";
      const res = await api.get(url);
      setTickets(res.data || []);
    } catch (err) {
      showNotify("error", err?.response?.data?.message || "Failed to load tickets", 4000);
    } finally { setTicketLoading(false); }
  }, [isStaff, showNotify]);

  useEffect(() => { if (isStaff) loadTickets(); }, [isStaff, loadTickets]);
  useEffect(() => { if (!isStaff && showTickets) loadTickets(); }, [showTickets, isStaff, loadTickets]);

  const filteredTickets = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    if (!q) return tickets;
    return (tickets || []).filter(t => {
      const blob = [t?.id, t?.name, t?.email, t?.subject, t?.message, t?.assigned_to_role].filter(Boolean).join(" ").toLowerCase();
      return blob.includes(q);
    });
  }, [tickets, search]);

  const activeFiltersCount = [search].filter(Boolean).length;

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/api/support", form);
      showNotify("success", "Thanks! Your message has been submitted.", 3000);
      setForm(p => ({ ...p, subject:"", message:"" }));
      if (!isStaff && showTickets) loadTickets();
      if (isStaff) loadTickets();
    } catch (err) {
      showNotify("error", err?.response?.data?.message || "Submit failed. Try again.", 4000);
    } finally { setLoading(false); }
  };

  const openTicket = async ticketId => {
    try {
      const res = await api.get(`/api/support/${ticketId}`);
      setSelectedTicket(res.data.ticket);
      setTicketReplies(res.data.replies || []);
      setReplyText(""); setShowReplyInput(false); setIsEditing(false);
      setEditSubject(res.data.ticket?.subject || ""); setEditMessage(res.data.ticket?.message || "");
      setForwardRemark("");
    } catch (err) { showNotify("error", err?.response?.data?.message || "Failed to open ticket", 4000); }
  };

  const closeTicketModal = () => { setSelectedTicket(null); setTicketReplies([]); setReplyText(""); setShowReplyInput(false); setIsEditing(false); setEditSubject(""); setEditMessage(""); setForwardRemark(""); };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    try {
      setReplyLoading(true);
      await api.post(`/api/support/${selectedTicket.id}/reply`, { message:replyText });
      showNotify("success", "Reply sent successfully", 2500);
      await openTicket(selectedTicket.id); await loadTickets();
    } catch (err) { showNotify("error", err?.response?.data?.message || "Reply failed", 4000); }
    finally { setReplyLoading(false); }
  };

  const forwardToAdmin = async () => {
    if (!forwardRemark.trim()) { showNotify("error", "Remark is required to forward", 3000); return; }
    try {
      setForwardLoading(true);
      await api.post(`/api/support/${selectedTicket.id}/forward`, { remark:forwardRemark });
      showNotify("success", "Forwarded to Admin", 2500);
      closeTicketModal(); await loadTickets();
    } catch (err) { showNotify("error", err?.response?.data?.message || "Forward failed", 4000); }
    finally { setForwardLoading(false); }
  };

  const saveEdit = async () => {
    if (!editSubject.trim() || !editMessage.trim()) { showNotify("error", "Subject and message are required", 3000); return; }
    try {
      setEditLoading(true);
      await api.patch(`/api/support/${selectedTicket.id}/edit`, { subject:editSubject, message:editMessage });
      showNotify("success", "Ticket updated", 2500);
      await openTicket(selectedTicket.id); await loadTickets(); setIsEditing(false);
    } catch (err) { showNotify("error", err?.response?.data?.message || "Update failed", 4000); }
    finally { setEditLoading(false); }
  };

  const deleteTicket = async ticketId => {
    if (!window.confirm("Delete this ticket?")) return;
    try {
      await api.delete(`/api/support/${ticketId}`);
      showNotify("success", "Ticket deleted", 2500);
      if (selectedTicket?.id === ticketId) closeTicketModal();
      await loadTickets();
    } catch (err) { showNotify("error", err?.response?.data?.message || "Delete failed", 4000); }
  };

  const canUserEdit = !isStaff && selectedTicket?.email && selectedTicket.email === user?.email;

  return (
    <div className="sp-root">
      <style>{FONTS}{PAGE_STYLES}</style>

      {/* ─── Toast ─── */}
      {notify.show && (
        <div className="sp-toast-wrap">
          <div className={`sp-toast ${notify.type === "success" ? "sp-toast-success" : "sp-toast-error"}`}>
            <div style={{ flex:1, fontSize:14, fontWeight:700 }}>{notify.message}</div>
            <button onClick={() => setNotify(p => ({ ...p, show:false }))} style={{ border:"1px solid rgba(0,0,0,0.1)", background:"rgba(255,255,255,0.7)", borderRadius:10, padding:"6px 10px", fontWeight:800, cursor:"pointer" }}>✕</button>
          </div>
        </div>
      )}

      <div className="sp-layout">
        {menuOpen && windowWidth < 1024 && <div className="sp-mobile-overlay" onClick={() => setMenuOpen(false)} />}

        {/* ─── SIDEBAR ─── */}
        <aside className="sp-sidebar" style={{ width:sidebarWidth(), minHeight:"100vh", position:windowWidth<1024?"fixed":"relative", top:0, left:0, zIndex:300, height:windowWidth<1024?"100vh":"auto" }}>
          {menuOpen && (
            <div className="sp-sidebar-inner">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
                <div onClick={() => navigate("/")} style={{ cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                    <img src="https://play-lh.googleusercontent.com/zW5KMgLpmTvg0TA4xYIztb5HedXa6mqbAflXHBnNWix5kKetiqtR1ZOqNghuBtleiJkN" alt="NLI Logo" style={{ width:36, height:36, borderRadius:8, objectFit:"cover", boxShadow:"0 2px 10px rgba(0,0,0,0.4)" }} />
                    <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, letterSpacing:"-0.02em", color:"#1474f3ea" }}>Asset<span style={{ color:"#f31225ef" }}>IMS</span></span>
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.38)", fontWeight:600, letterSpacing:"0.06em" }}>HELP & SUPPORT</div>
                </div>
              </div>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:8, paddingLeft:4, fontFamily:"Outfit,sans-serif" }}>Navigation</div>
              <nav style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:24 }}>
                {navItems.map((item, idx) => (
                  <button key={idx} className="sp-nav-item" onClick={() => navigate(item.path)}>
                    <span className="sp-nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
              <div style={{ marginTop:"auto", paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ background:"linear-gradient(135deg,rgba(37,99,235,0.14),rgba(34,197,94,0.07))", border:"1px solid rgba(37,99,235,0.22)", borderRadius:14, padding:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#2563eb,#22c55e)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:16, flexShrink:0 }}>
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name}</div>
                      <div style={{ fontSize:10, background:"linear-gradient(135deg,#60a5fa,#4ade80)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontWeight:700, letterSpacing:"0.06em", fontFamily:"Outfit,sans-serif" }}>{roleLabel}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ─── MAIN ─── */}
        <main className="sp-main">
          {/* Topbar */}
          <div className="sp-topbar">
            <div className="sp-topbar-left">
              <button className="sp-btn sp-btn-white sp-btn-icon" onClick={() => setMenuOpen(!menuOpen)} title="Toggle Menu">
                {menuOpen
                  ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>}
              </button>
              <div style={{ width:1, height:20, background:"var(--gray-200)" }} />
              <div style={{ fontSize:13, fontWeight:700, color:"var(--gray-700)", fontFamily:"Outfit,sans-serif" }}>Help & Support</div>
            </div>
            <div className="sp-topbar-right">
              {isStaff ? (
                <button className="sp-btn sp-btn-blue-outline sp-btn-sm" onClick={loadTickets} disabled={ticketLoading}>
                  {ticketLoading ? "Loading…" : "↻ Refresh"}
                </button>
              ) : (
                <button className="sp-btn sp-btn-green-outline sp-btn-sm" onClick={() => setShowTickets(p => !p)}>
                  {showTickets ? "Hide Tickets" : "My Tickets"}
                </button>
              )}
            </div>
          </div>

          {/* ─── Panel Toggle Bar ─── */}
          <div className="sp-panel-toggle-bar">
            <button className={`sp-toggle-pill ${showPanel === "hero" ? "active" : ""}`} onClick={() => togglePanel("hero")}>
              🏛️ Overview
            </button>
            <button className={`sp-toggle-pill ${showPanel === "filters" ? "active" : ""}`} onClick={() => togglePanel("filters")}>
              🔍 Search
              {activeFiltersCount > 0 && (
                <span style={{ position:"absolute", top:-6, right:-6, width:16, height:16, borderRadius:"50%", background:"var(--red-500)", color:"white", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid white", fontFamily:"Outfit,sans-serif" }}>{activeFiltersCount}</span>
              )}
            </button>

            <div className="sp-active-filters">
              {search && (
                <span className="sp-filter-chip">
                  🔎 "{search.length > 18 ? search.slice(0,18)+"…" : search}"
                  <button onClick={() => setSearch("")}>×</button>
                </span>
              )}
              {search && <button className="sp-clear-all" onClick={() => setSearch("")}>Clear all</button>}
            </div>

            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
              <span className="sp-badge sp-badge-blue" style={{ fontSize:11 }}>{filteredTickets.length} tickets</span>
              <span className="sp-badge sp-badge-gray" style={{ fontSize:11 }}>{roleLabel}</span>
            </div>
          </div>

          {/* ─── Collapsible: Hero ─── */}
          <div className={`sp-collapsible-panel ${showPanel === "hero" ? "open" : ""}`}>
            <div className="sp-filter-card" style={{ margin:"2px 2px 0" }}>
              <NepalLifeHeroCompact />
            </div>
          </div>

          {/* ─── Collapsible: Filters ─── */}
          <div className={`sp-collapsible-panel ${showPanel === "filters" ? "open" : ""}`}>
            <div className="sp-filter-card1" style={{ margin:"2px 2px 0" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:14, flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:"var(--gray-500)", textTransform:"uppercase", letterSpacing:"0.12em", fontFamily:"Outfit,sans-serif", marginBottom:4 }}>Support Overview</div>
                  <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:18, color:"var(--gray-900)" }}>Ticket Search</div>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span className="sp-badge sp-badge-blue">{filteredTickets.length} Visible</span>
                  <span className="sp-badge sp-badge-green">{tickets.length} Total</span>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14, alignItems:"end" }}>
                <div style={{ gridColumn:"span 2", minWidth:0 }}>
                  <label className="sp-label">Search Tickets</label>
                  <div className="sp-search-wrap">
                    <input type="text" placeholder="ID, name, email, subject…" className="sp-input" value={search} onChange={e => setSearch(e.target.value)} />
                    <svg className="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Content ─── */}
          <div className="sp-content">
            {/* Staff: Ticket Table */}
            {isStaff ? (
              <div className="sp-table-card">
                <div style={{ padding:18 }}>
                  {ticketLoading ? (
                    <div className="sp-empty"><Spinner size={38} /><p style={{ color:"var(--gray-500)", fontSize:14, margin:0 }}>Loading tickets…</p></div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="sp-empty">
                      <div style={{ fontSize:48 }}>💬</div>
                      <p style={{ color:"var(--gray-700)", fontWeight:700, fontSize:15, margin:0, fontFamily:"Outfit,sans-serif" }}>No tickets found</p>
                      <p style={{ color:"var(--gray-400)", fontSize:12, margin:0 }}>Adjust search or refresh</p>
                    </div>
                  ) : (
                    <div style={{ overflowX:"auto" }}>
                      <table className="sp-table">
                        <thead>
                          <tr>{["ID","Name","Email","Subject","Message","Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {filteredTickets.map(t => (
                            <tr key={t.id}>
                              <td><span className="sp-badge sp-badge-blue">#{t.id}</span></td>
                              <td style={{ fontWeight:700, color:"var(--gray-900)" }}>{t.name}</td>
                              <td style={{ color:"var(--gray-500)", fontSize:12 }}>{t.email}</td>
                              <td style={{ fontWeight:600, color:"var(--gray-900)" }}>{t.subject}</td>
                              <td style={{ color:"var(--gray-500)", maxWidth:240, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.message}</td>
                              <td>
                                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                  <button className="sp-btn sp-btn-primary sp-btn-sm" onClick={() => openTicket(t.id)}>View →</button>
                                  {isAdmin && <button className="sp-btn sp-btn-ghost sp-btn-sm" onClick={() => deleteTicket(t.id)}>Delete</button>}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* User: FAQ + Contact Form */
              <div className="sp-two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginTop:2 }}>
                {/* FAQ */}
                <div className="sp-table-card">
                  <div style={{ padding:"18px 20px", borderBottom:"1px solid var(--gray-200)", background:"linear-gradient(to right,#f8fafc,#faf5ff)" }}>
                    <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:18, color:"var(--gray-900)" }}>Frequently Asked Questions</div>
                    <div style={{ fontSize:13, color:"var(--gray-500)", marginTop:4 }}>Quick answers to common questions</div>
                  </div>
                  <div style={{ padding:18, display:"flex", flexDirection:"column", gap:12 }}>
                    {[
                      { q:"How do I reset my password?", a:"Go to the login page and click 'Forgot Password'. Enter your email and follow the instructions." },
                      { q:"How do I contact support?", a:"Submit the contact form on this page. Our team will respond as soon as possible." },
                      { q:"What info should I include in a ticket?", a:"Include a clear subject, detailed issue description, branch, device/browser info, and screenshots if available." },
                      { q:"How long does a response take?", a:"Most tickets receive a response within business hours. Urgent issues are prioritized." },
                    ].map((item, idx) => {
                      const open = openFaq === idx;
                      return (
                        <button key={idx} type="button" onClick={() => toggleFaq(idx)} style={{ width:"100%", textAlign:"left", borderRadius:12, border:`1px solid ${open ? "#93c5fd" : "#e5e7eb"}`, padding:"14px 16px", background:open ? "#eff6ff" : "white", cursor:"pointer", transition:"all .2s ease" }}>
                          <div style={{ fontWeight:700, color:"var(--gray-900)", display:"flex", alignItems:"center", gap:8, fontSize:13.5 }}>
                            <span style={{ transform:open ? "rotate(90deg)" : "rotate(0deg)", transition:"transform .2s ease", fontSize:11 }}>▶</span>
                            {item.q}
                          </div>
                          {open && <div style={{ marginTop:10, fontSize:13, color:"var(--gray-600)", paddingLeft:20, lineHeight:1.6 }}>{item.a}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contact Form */}
                <div className="sp-table-card" style={{ height:"fit-content" }}>
                  <div style={{ padding:"18px 20px", borderBottom:"1px solid var(--gray-200)", background:"linear-gradient(135deg,#eff6ff,#f0fdf4)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:18, color:"var(--gray-900)" }}>Contact Support</div>
                      <div style={{ fontSize:13, color:"var(--gray-500)", marginTop:4 }}>We're here to help. Send us a message.</div>
                    </div>
                    <button className="sp-btn sp-btn-green-outline sp-btn-sm" onClick={() => setShowTickets(p => !p)}>
                      {showTickets ? "Hide" : "My Tickets"}
                    </button>
                  </div>
                  <form style={{ padding:18, display:"flex", flexDirection:"column", gap:16 }} onSubmit={handleSubmit}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <div>
                        <label className="sp-label">Your Name *</label>
                        <input className="sp-input" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="sp-label">Your Email *</label>
                        <input className="sp-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="sp-label">Subject *</label>
                      <input className="sp-input" name="subject" value={form.subject} onChange={handleChange} required placeholder="Brief description of your issue" />
                    </div>
                    <div>
                      <label className="sp-label">Your Message *</label>
                      <textarea className="sp-textarea" name="message" value={form.message} onChange={handleChange} required rows={6} placeholder="Provide detailed information about your issue…" />
                    </div>
                    <button type="submit" disabled={loading} className="sp-btn sp-btn-success" style={{ justifyContent:"center", padding:"12px 16px", fontSize:15 }}>
                      {loading ? "Submitting…" : "📤 Submit Request"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* User ticket list overlay */}
            {!isStaff && showTickets && (
              <div onClick={() => setShowTickets(false)} style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(15,23,42,0.42)", backdropFilter:"blur(6px)", display:"flex", justifyContent:"center", alignItems:"flex-start", padding:"18px 16px 16px", overflowY:"auto", animation:"fadeIn 0.2s ease" }}>
                <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:1100, background:"white", borderRadius:18, border:"1px solid var(--gray-200)", boxShadow:"0 20px 60px rgba(0,0,0,0.18)", overflow:"hidden", animation:"bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                  <div style={{ padding:"18px 20px", borderBottom:"1px solid var(--gray-200)", background:NL_GRADIENT_90, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                    <div>
                      <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:19, color:"white" }}>My Support Tickets</div>
                      <div style={{ fontSize:13, color:"rgba(255,255,255,0.78)", marginTop:4 }}>Track your submitted requests and replies</div>
                    </div>
                    <button className="sp-btn sp-btn-sm" onClick={() => setShowTickets(false)} style={{ background:"rgba(255,255,255,0.14)", color:"white", border:"1px solid rgba(255,255,255,0.24)" }}>✕ Close</button>
                  </div>
                  <div style={{ padding:18 }}>
                    {ticketLoading ? (
                      <div className="sp-empty"><Spinner size={34} /><p style={{ color:"var(--gray-500)", fontSize:14, margin:0 }}>Loading tickets…</p></div>
                    ) : filteredTickets.length === 0 ? (
                      <div className="sp-empty">
                        <div style={{ fontSize:40 }}>📭</div>
                        <p style={{ color:"var(--gray-700)", fontWeight:700, fontSize:15, margin:0, fontFamily:"Outfit,sans-serif" }}>No tickets yet</p>
                        <p style={{ color:"var(--gray-400)", fontSize:12, margin:0 }}>Submit your first support request above</p>
                      </div>
                    ) : (
                      <div style={{ overflowX:"auto" }}>
                        <table className="sp-table" style={{ minWidth:"100%" }}>
                          <thead><tr><th>ID</th><th>Subject</th><th>Message</th><th>View</th></tr></thead>
                          <tbody>
                            {filteredTickets.map(t => (
                              <tr key={t.id}>
                                <td><span className="sp-badge sp-badge-blue">#{t.id}</span></td>
                                <td style={{ fontWeight:700, color:"var(--gray-900)" }}>{t.subject}</td>
                                <td style={{ color:"var(--gray-600)", maxWidth:420, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }} title={t.message}>{t.message}</td>
                                <td><button className="sp-btn sp-btn-primary sp-btn-sm" onClick={() => openTicket(t.id)}>View →</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Ticket Detail Modal ─── */}
            {selectedTicket && (
              <div className="sp-preview-overlay" onClick={closeTicketModal}>
                <div className="sp-preview-panel" onClick={e => e.stopPropagation()}>
                  <div className="sp-preview-header">
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.55)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8, fontFamily:"Outfit,sans-serif" }}>Ticket Details</div>
                        <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:"clamp(1.1rem,3vw,1.5rem)", color:"white", letterSpacing:"-0.02em", marginBottom:8 }}>
                          #{selectedTicket.id} — {selectedTicket.subject}
                        </div>
                        <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)" }}>
                          <span style={{ fontWeight:700, color:"white" }}>{selectedTicket.name}</span> ({selectedTicket.email})
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                        {isAdmin && (
                          <button className="sp-btn sp-btn-sm" style={{ background:"rgb(226, 11, 11)", border:"1.5px solid rgb(90, 6, 6)", color:"#f7f7f7" }} onClick={() => deleteTicket(selectedTicket.id)}>Delete</button>
                        )}
                        <button className="sp-btn sp-btn-sm" style={{ background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.8)" }} onClick={closeTicketModal}>✕ Close</button>
                      </div>
                    </div>
                  </div>

                  <div className="sp-preview-body">
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:18 }}>
                      {/* Original Message */}
                      <div className="sp-detail-card">
                        <SectionHeader icon="📨" title="Original Message" subtitle="Ticket subject and content" />
                        <div className="sp-detail-card-body">
                          {!isEditing ? (
                            <>
                              <div className="sp-detail-row">
                                <div className="sp-detail-label">Subject</div>
                                <div className="sp-detail-value">{selectedTicket.subject}</div>
                              </div>
                              <div className="sp-detail-row">
                                <div className="sp-detail-label">Message</div>
                                <div className="sp-detail-value" style={{ textAlign:"left", maxWidth:"100%" }}>{selectedTicket.message}</div>
                              </div>
                              {canUserEdit && (
                                <div style={{ marginTop:14 }}>
                                  <button className="sp-btn sp-btn-amber sp-btn-sm" onClick={() => setIsEditing(true)}>✏ Edit</button>
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:10 }}>
                              <div><label className="sp-label">Subject</label><input className="sp-input" value={editSubject} onChange={e => setEditSubject(e.target.value)} /></div>
                              <div><label className="sp-label">Message</label><textarea className="sp-textarea" rows={5} value={editMessage} onChange={e => setEditMessage(e.target.value)} /></div>
                              <div style={{ display:"flex", gap:10 }}>
                                <button className="sp-btn sp-btn-success sp-btn-sm" onClick={saveEdit} disabled={editLoading}>{editLoading ? "Saving…" : "💾 Save Changes"}</button>
                                <button className="sp-btn sp-btn-white sp-btn-sm" onClick={() => { setIsEditing(false); setEditSubject(selectedTicket.subject||""); setEditMessage(selectedTicket.message||""); }}>Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Conversation */}
                      <div className="sp-detail-card">
                        <SectionHeader icon="💬" title="Conversation" subtitle={`${ticketReplies.length} ${ticketReplies.length === 1 ? "reply" : "replies"}`} />
                        <div className="sp-detail-card-body">
                          {ticketReplies.length === 0 ? (
                            <div className="sp-empty" style={{ padding:"36px 0" }}>
                              <p style={{ color:"var(--gray-700)", fontWeight:700, fontSize:14, margin:0 }}>No replies yet</p>
                              <p style={{ color:"var(--gray-400)", fontSize:12, margin:0 }}>The conversation will appear here</p>
                            </div>
                          ) : (
                            <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:10 }}>
                              {ticketReplies.map(r => (
                                <div key={r.id} style={{ borderRadius:12, padding:14, border:r.sender_role === "user" ? "1px solid var(--gray-200)" : "none", background:r.sender_role === "user" ? "white" : NL_GRADIENT, color:r.sender_role === "user" ? "var(--gray-900)" : "white", boxShadow:"var(--shadow-sm)", whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.6 }}>
                                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                                    <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, background:r.sender_role === "user" ? "#9ca3af" : "rgba(255,255,255,0.25)", color:"white" }}>
                                      {r.sender_role === "user" ? "U" : "S"}
                                    </div>
                                    <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.12em", opacity:.8 }}>{String(r.sender_role||"staff").toUpperCase()}</div>
                                  </div>
                                  {r.message}
                                </div>
                              ))}
                            </div>
                          )}

                          {isSubAdmin && selectedTicket?.assigned_to_role === "subadmin" && (
                            <div style={{ marginTop:16, padding:14, borderRadius:12, border:"1px solid #fed7aa", background:"linear-gradient(135deg,#fffbeb,#fff7ed)" }}>
                              <div style={{ fontWeight:800, color:"var(--gray-900)", marginBottom:4 }}>Forward to Admin</div>
                              <div style={{ fontSize:12, color:"var(--gray-500)", marginBottom:10 }}>Add a remark before forwarding</div>
                              <textarea className="sp-textarea" rows={3} placeholder="Enter remark…" value={forwardRemark} onChange={e => setForwardRemark(e.target.value)} />
                              <div style={{ marginTop:10 }}>
                                <button className="sp-btn sp-btn-ghost sp-btn-sm" onClick={forwardToAdmin} disabled={forwardLoading}>{forwardLoading ? "Forwarding…" : "⬆️ Forward to Admin"}</button>
                              </div>
                            </div>
                          )}

                          {(isStaff || isSubAdmin) && (
                            <div style={{ marginTop:16, padding:14, borderRadius:12, border:"1px solid #bfdbfe", background:"linear-gradient(135deg,#eff6ff,#f0fdfa)" }}>
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:10 }}>
                                <div>
                                  <div style={{ fontWeight:800, color:"var(--gray-900)" }}>Send Reply</div>
                                  <div style={{ fontSize:12, color:"var(--gray-500)" }}>Respond to the submitter</div>
                                </div>
                                <button className="sp-btn sp-btn-white sp-btn-sm" onClick={() => setShowReplyInput(p => !p)}>{showReplyInput ? "Hide" : "Write"}</button>
                              </div>
                              {showReplyInput && (
                                <>
                                  <textarea className="sp-textarea" rows={4} placeholder="Type your response…" value={replyText} onChange={e => setReplyText(e.target.value)} />
                                  <div style={{ display:"flex", gap:10, marginTop:10 }}>
                                    <button className="sp-btn sp-btn-success sp-btn-sm" onClick={sendReply} disabled={replyLoading}>{replyLoading ? "Sending…" : "📤 Send Reply"}</button>
                                    <button className="sp-btn sp-btn-white sp-btn-sm" onClick={() => setShowReplyInput(false)}>Cancel</button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}