// src/components/Layout/Nav.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Bell, Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import api from "../../services/api";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`;

const NAV_STYLES = `
  .nav-root { font-family: 'DM Sans', sans-serif; }

  .nav-link-item {
    position: relative; display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 12px; border-radius: 10px; font-size: 13.5px; font-weight: 650;
    color: rgba(255,255,255,0.78); text-decoration: none;
    transition: color .2s, background .2s, border-color .2s;
    white-space: nowrap; border: 1px solid transparent;
  }
  .nav-link-item:hover { color: #fff; background: rgba(255,255,255,0.06); }
  .nav-link-item.active { color:#fff; background: rgba(59,130,246,0.14); border-color: rgba(59,130,246,0.28); }
  .nav-link-item.active::after {
    content:''; position:absolute; bottom:-1px; left:50%; transform:translateX(-50%);
    width:18px; height:2px; border-radius:99px; background:#3b82f6;
  }

  /* Mobile drawer */
  .mobile-drawer {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: min(360px, 88vw);
    background: #0d1117;
    border-left: 1px solid rgba(255,255,255,0.08);
    transform: translateX(102%);
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
    z-index: 300;
    display:flex; flex-direction:column;
    padding: 18px 16px;
    box-shadow: -24px 0 70px rgba(0,0,0,0.55);
    overflow-y: auto;
  }
  .mobile-drawer.open { transform: translateX(0); }

  .drawer-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.62);
    backdrop-filter: blur(4px);
    z-index: 299;
    opacity: 0; pointer-events: none;
    transition: opacity .25s;
  }
  .drawer-overlay.open { opacity: 1; pointer-events: all; }

  .drawer-link {
    display:flex; align-items:center; gap:10px;
    padding: 12px 12px; border-radius: 12px;
    font-size: 14px; font-weight: 650;
    color: rgba(255,255,255,0.62);
    text-decoration:none;
    border:1px solid transparent;
    transition: all .18s;
  }
  .drawer-link:hover { color:#fff; background: rgba(255,255,255,0.06); }
  .drawer-link.active { color:#fff; background: rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.25); }

  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .ticker-track { display: inline-flex; animation: ticker 28s linear infinite; white-space: nowrap; }
  .ticker-track:hover { animation-play-state: paused; }

  .user-dropdown{
    position:absolute; top: calc(100% + 10px); right:0; min-width: 240px;
    background:#0d1117; border:1px solid rgba(255,255,255,0.10);
    border-radius: 14px; padding: 8px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.55);
    z-index: 400; animation: dropIn .2s ease;
  }
  @keyframes dropIn { from{ opacity:0; transform: translateY(-8px) scale(.97);} to{ opacity:1; transform: translateY(0) scale(1);} }

  .dropdown-item{
    display:flex; align-items:center; gap:10px;
    padding: 10px 12px; border-radius: 10px;
    font-size: 13px; font-weight: 650;
    color: rgba(255,255,255,0.68);
    cursor:pointer; transition: background .15s, color .15s;
    border:none; background:none; width:100%;
    text-align:left; text-decoration:none;
  }
  .dropdown-item:hover { background: rgba(255,255,255,0.08); color:#fff; }
  .dropdown-item.danger:hover { background: rgba(239,68,68,0.12); color:#f87171; }
  .dropdown-divider { height:1px; background: rgba(255,255,255,0.08); margin: 6px 0; }

  @keyframes bellWiggle {
    0%,100% { transform: rotate(0); }
    20% { transform: rotate(15deg); }
    40% { transform: rotate(-12deg); }
    60% { transform: rotate(8deg); }
    80% { transform: rotate(-5deg); }
  }
  .bell-wiggle { animation: bellWiggle .6s ease; }

  @keyframes fadeOverlay { from { opacity:0; } to { opacity:1; } }
  @keyframes modalIn {
    from { opacity:0; transform: translate(-50%,-48%) scale(0.95); }
    to   { opacity:1; transform: translate(-50%,-50%) scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .hidden-mobile { display:none !important; }
    .show-mobile { display:flex !important; }
  }
  @media (min-width: 769px) {
    .show-mobile { display:none !important; }
  }
`;

const NAV_ICONS = {
  branch: (
    <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
    </svg>
  ),
  assets: (
    <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
    </svg>
  ),
  requests: (
    <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
  ),
  help: (
    <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  ),
  graph: (
    <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  users: (
    <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  ),
};

const cx = (...a) => a.filter(Boolean).join(" ");

function Pill({ children, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-700",
    purple: "border-violet-200 bg-violet-50 text-violet-700",
  };
  return (
    <span className={cx("inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black tracking-widest", tones[tone] || tones.slate)}>
      {children}
    </span>
  );
}

/* ─── Avatar ─────────────────────────────────────────────────────────────── */
// img_url stored in DB is either a base64 string or null
function Avatar({ name, size = 34, src }) {
  const [imgErr, setImgErr] = useState(false);
  const initials = (name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  if (src && !imgErr) {
    return (
      <img
        src={src}
        alt={name || "User"}
        onError={() => setImgErr(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        color: "#fff",
        fontFamily: "Syne, sans-serif",
        flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.12)",
      }}
    >
      {initials}
    </div>
  );
}

function compressImage(file, maxWidth = 300, maxHeight = 300, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ─── Profile Modal ───────────────────────────────────────────────────────── */
function ProfileModal({ user, isAdmin, isSubAdmin, token, onClose, onImgUpdate }) {
  const [preview, setPreview] = useState(user?.img_url || null);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const isDirty = preview !== (user?.img_url || null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }
    setError("");
    setCompressing(true);
    try {
      const compressed = await compressImage(file, 300, 300, 0.82);
      setPreview(compressed);
    } catch {
      setError("Failed to process image. Try another file.");
    } finally {
      setCompressing(false);
    }
  };

  const handleSave = async () => {
    if (!isDirty) {
      onClose();
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await api.patch(
        "/api/users/profile-image",
        { img_url: preview },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const saved = res?.data?.data?.img_url ?? preview;
      onImgUpdate(saved);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setError("");
    try {
      await api.patch("/api/users/profile-image", { img_url: null }, { headers: { Authorization: `Bearer ${token}` } });
      setPreview(null);
      onImgUpdate(null);
    } catch {
      setError("Failed to remove photo.");
    } finally {
      setSaving(false);
    }
  };

  const isLoading = compressing || saving;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(10px)",
          zIndex: 998,
          animation: "fadeOverlay 0.2s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 999,
          width: "min(430px, 94vw)",
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 24,
          boxShadow: "0 40px 100px rgba(0,0,0,0.85)",
          animation: "modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
          overflow: "hidden",
        }}
      >
        <div style={{ height: 90, background: "linear-gradient(135deg, #0f2847 0%, #160d30 100%)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 70%, rgba(59,130,246,0.45) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 30%, rgba(139,92,246,0.2) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 12, left: 28, fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            My Profile
          </div>
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "5px 7px", cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", transition: "background 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", marginTop: -46, marginBottom: 16 }}>
            <div style={{ width: 92, height: 92, borderRadius: "50%", border: "4px solid #0d1117", overflow: "hidden", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, color: "#fff", fontFamily: "Syne, sans-serif" }}>
              {compressing ? (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
                  <svg style={{ width: 28, height: 28, color: "#fff", animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>
              ) : preview ? (
                <img src={preview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setPreview(null)} />
              ) : (
                (user?.name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
              )}
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              title="Change photo"
              disabled={isLoading}
              style={{ position: "absolute", bottom: 2, right: 2, width: 29, height: 29, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", border: "3px solid #0d1117", display: "flex", alignItems: "center", justifyContent: "center", cursor: isLoading ? "not-allowed" : "pointer", boxShadow: "0 2px 12px rgba(59,130,246,0.6)", transition: "transform 0.15s" }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.transform = "scale(1.13)"; }}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <svg style={{ width: 13, height: 13, color: "#fff" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
              onClick={(e) => { e.target.value = ""; }}
            />
          </div>

          {compressing && (
            <div style={{ fontSize: 11, color: "#60a5fa", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <svg style={{ width: 11, height: 11, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Optimising image…
            </div>
          )}

          <div style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 3, textAlign: "center" }}>{user?.name || "User"}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 12, textAlign: "center" }}>{user?.email}</div>

          {(isAdmin || isSubAdmin) && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 6,
                background: isAdmin ? "rgba(59,130,246,0.14)" : "rgba(16,185,129,0.12)",
                color: isAdmin ? "#60a5fa" : "#34d399",
                border: `1px solid ${isAdmin ? "rgba(59,130,246,0.25)" : "rgba(16,185,129,0.2)"}`,
                marginBottom: 20,
              }}
            >
              {isAdmin ? "Administrator" : "Sub-Admin"}
            </span>
          )}

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {[
              { label: "Full Name", value: user?.name || "—", icon: <User size={12} /> },
              {
                label: "Email",
                value: user?.email || "—",
                icon: (
                  <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                ),
              },
              {
                label: "Photo",
                value: user?.img_url ? (
                  <span style={{ color: "#34d399", display: "flex", alignItems: "center", gap: 4 }}>
                    <svg style={{ width: 11, height: 11 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Saved in DB
                  </span>
                ) : (
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>Not set</span>
                ),
                icon: (
                  <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                ),
              },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.3)", fontSize: 12, minWidth: 90 }}>
                  {row.icon} {row.label}
                </div>
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 500, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => !isLoading && fileRef.current?.click()}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: `2px dashed ${dragging ? "#3b82f6" : isDirty ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)"}`,
              background: dragging ? "rgba(59,130,246,0.07)" : isDirty ? "rgba(59,130,246,0.04)" : "transparent",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              transition: "all 0.2s",
              marginBottom: 8,
            }}
          >
            <svg style={{ width: 15, height: 15, color: isDirty ? "#3b82f6" : "rgba(255,255,255,0.3)", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <span style={{ fontSize: 12.5, color: isDirty ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)", textAlign: "center" }}>
              {compressing ? "Processing image…" : isDirty ? "Image ready — click Save to store in DB" : preview ? "Change photo · drag & drop or click" : "Upload profile photo · drag & drop or click"}
            </span>
            {isDirty && !isLoading && (
              <button onClick={(e) => { e.stopPropagation(); setPreview(user?.img_url || null); setError(""); }} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 11, flexShrink: 0 }}>
                ✕
              </button>
            )}
          </div>

          {error && <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8, textAlign: "center", width: "100%" }}>{error}</div>}
          {success && (
            <div style={{ fontSize: 12, color: "#34d399", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <svg style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Saved to database!
            </div>
          )}

          <div style={{ width: "100%", display: "flex", gap: 10, marginTop: 4 }}>
            {preview && !isDirty && (
              <button
                onClick={handleRemove}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid rgba(239,68,68,0.25)",
                  background: "rgba(239,68,68,0.07)",
                  color: "#f87171",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  opacity: saving ? 0.6 : 1,
                }}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
              >
                Remove
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isLoading || !isDirty}
              style={{
                flex: 2,
                padding: "10px",
                borderRadius: 10,
                border: "none",
                background: isDirty && !isLoading ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "rgba(255,255,255,0.06)",
                color: isDirty && !isLoading ? "#fff" : "rgba(255,255,255,0.25)",
                fontSize: 13,
                fontWeight: 800,
                cursor: isLoading || !isDirty ? "not-allowed" : "pointer",
                boxShadow: isDirty && !isLoading ? "0 4px 14px rgba(59,130,246,0.35)" : "none",
                transition: "all 0.2s",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {saving ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg style={{ width: 14, height: 14, animation: "spin 0.8s linear infinite" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Saving…
                </span>
              ) : compressing ? (
                "Processing…"
              ) : (
                "Save to DB"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main Nav ────────────────────────────────────────────────────────────── */
export default function Nav() {
  const { user, logout, isAdmin, isSubAdmin, token, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellAnimate, setBellAnimate] = useState(false);

  const dropRef = useRef(null);

  const canSeeRequests = isAdmin || isSubAdmin;
  const canSeeUsers = isAdmin;
  const isLandingPage = location.pathname === "/";
  const hideNavMenu = location.pathname === "/login";

  // ✅ close dropdown outside click
  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ✅ close drawer + dropdown when route changes
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  // ✅ ESC closes drawer + dropdown + modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDropOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ✅ lock body scroll while drawer open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // ✅ notifications
  useEffect(() => {
    if (!token || !isAdmin) return;

    const load = async () => {
      try {
        const res = await api.get("/api/notifications/unread-count", { headers: { Authorization: `Bearer ${token}` } });
        const count = Number(res?.data?.data?.count || 0);
        setUnreadCount((prev) => {
          if (count > prev) {
            setBellAnimate(true);
            setTimeout(() => setBellAnimate(false), 700);
          }
          return count;
        });
      } catch {
        setUnreadCount(0);
      }
    };

    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [token, isAdmin]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setDropOpen(false);
    navigate("/login");
  };

  const handleSignIn = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMobile = () => setMenuOpen(false);

  const handleImgUpdate = (newBase64) => {
    if (typeof setUser === "function") setUser((prev) => ({ ...prev, img_url: newBase64 }));
  };

  const navLinks = [
    { to: "/branches", label: "Branch", icon: NAV_ICONS.branch, always: true },
    { to: "/branch-assets-report", label: "Asset Master", icon: NAV_ICONS.assets, always: true },
    { to: "/requests", label: "Requests", icon: NAV_ICONS.requests, show: canSeeRequests },
    { to: "/support", label: "Help", icon: NAV_ICONS.help, always: true },
    { to: "/assetdashboard", label: "Graph", icon: NAV_ICONS.graph, always: true },
    { to: "/admin/users", label: "Users", icon: NAV_ICONS.users, show: canSeeUsers },
  ].filter((l) => l.always || l.show);

  return (
    <>
      <style>{FONTS}{NAV_STYLES}</style>

      {profileOpen && (
        <ProfileModal
          user={user}
          isAdmin={isAdmin}
          isSubAdmin={isSubAdmin}
          token={token}
          onClose={() => setProfileOpen(false)}
          onImgUpdate={handleImgUpdate}
        />
      )}

      {/* ── Header ───────────────────────────────────────────── */}
      <header
        className="nav-root"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 150,
          background: "rgba(2, 32, 53, 0.8)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 14px", height: 58, display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <img
              src="https://play-lh.googleusercontent.com/zW5KMgLpmTvg0TA4xYIztb5HedXa6mqbAflXHBnNWix5kKetiqtR1ZOqNghuBtleiJkN"
              alt="NLI Logo"
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", display: "block", boxShadow: "0 2px 10px rgba(0,0,0,0.4)" }}
            />
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", color: "#1474f3ea" }}>
              Asset<span style={{ color:"#f31225ef" }}>IMS</span>
            </span>
          </Link>

          <div style={{ flex: 1 }} />

          {!hideNavMenu && (
            <nav style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden-mobile">
              {navLinks.map(({ to, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `nav-link-item${isActive ? " active" : ""}`}>
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          {!hideNavMenu && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
              {user && isAdmin && (
                <NavLink
                  to="/admin/expiry"
                  className={`nav-bell ${bellAnimate ? "bell-wiggle" : ""}`}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    color: "rgba(238, 234, 20, 0.88)",
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    transition: "all 0.2s",
                  }}
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        background: "linear-gradient(135deg,#ef4444,#dc2626)",
                        borderRadius: 999,
                        minWidth: 18,
                        height: 18,
                        fontSize: 10,
                        fontWeight: 900,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                        border: "2px solid #080b12",
                        boxShadow: "0 2px 8px rgba(239,68,68,0.5)",
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </NavLink>
              )}

              {user ? (
                <div ref={dropRef} className="hidden-mobile" style={{ position: "relative" }}>
                  <button
                    onClick={() => setDropOpen(!dropOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: 10,
                      padding: "5px 10px 5px 6px",
                      cursor: "pointer",
                      color: "#fff",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  >
                    <Avatar name={user?.name} size={36} src={user?.img_url} />
                    <span style={{ fontSize: 13, fontWeight: 650, color: "rgba(255,255,255,0.82)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name || user.email}
                    </span>
                    <ChevronDown size={13} style={{ color: "rgba(255,255,255,0.4)", transform: dropOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                  </button>

                  {dropOpen && (
                    <div className="user-dropdown">
                      <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={user?.name} size={36} src={user?.img_url} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name || "User"}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                          {(isAdmin || isSubAdmin) && (
                            <span
                              style={{
                                display: "inline-block",
                                marginTop: 5,
                                fontSize: 9,
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                padding: "2px 6px",
                                borderRadius: 6,
                                background: isAdmin ? "rgba(59,130,246,0.15)" : "rgba(16,185,129,0.12)",
                                color: isAdmin ? "#60a5fa" : "#34d399",
                                border: `1px solid ${isAdmin ? "rgba(59,130,246,0.25)" : "rgba(16,185,129,0.2)"}`,
                              }}
                            >
                              {isAdmin ? "Admin" : "Sub-Admin"}
                            </span>
                          )}
                        </div>
                      </div>

                      <button className="dropdown-item" onClick={() => { setDropOpen(false); setProfileOpen(true); }}>
                        <User size={14} /> My Profile
                      </button>

                      <div className="dropdown-divider" />

                      <button className="dropdown-item danger" onClick={handleLogout}>
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="hidden-mobile"
                  onClick={handleSignIn}
                  style={{
                    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                    border: "none",
                    borderRadius: 10,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#fff",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                  }}
                >
                  Sign in
                </button>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="show-mobile"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  padding: "7px 8px",
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.78)",
                  cursor: "pointer",
                }}
                aria-label="Open menu"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile Drawer ────────────────────────────────────── */}
      <div className={`drawer-overlay ${menuOpen ? "open" : ""}`} onClick={closeMobile} />
      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: "#fff" }}>Navigation</span>
          <button
            onClick={closeMobile}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 10,
              padding: "7px 8px",
              cursor: "pointer",
              color: "rgba(255,255,255,0.7)",
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {user && (
          <div
            onClick={() => { closeMobile(); setProfileOpen(true); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 12px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: 12,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            <Avatar name={user?.name} size={38} src={user?.img_url} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name || "User"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </div>
              <div style={{ marginTop: 7 }}>
                <Pill tone={isAdmin ? "blue" : isSubAdmin ? "green" : "slate"}>
                  {isAdmin ? "ADMIN" : isSubAdmin ? "SUB ADMIN" : "USER"}
                </Pill>
              </div>
            </div>
            <svg style={{ width: 14, height: 14, color: "rgba(255,255,255,0.25)" }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 0 12px" }} />

        {navLinks.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} onClick={closeMobile} className={({ isActive }) => `drawer-link${isActive ? " active" : ""}`}>
            <span style={{ opacity: 0.8 }}>{icon}</span>
            {label}
          </NavLink>
        ))}

        {user && isAdmin && (
          <NavLink to="/admin/expiry" onClick={closeMobile} className={({ isActive }) => `drawer-link${isActive ? " active" : ""}`} style={{ marginTop: 4 }}>
            <Bell size={15} style={{ opacity: 0.8 }} /> Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: "auto", background: "#ef4444", borderRadius: 999, fontSize: 10, fontWeight: 900, color: "#fff", padding: "2px 8px" }}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "12px 0" }} />

        {user ? (
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 900,
              color: "#f87171",
              cursor: "pointer",
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.18)",
              width: "100%",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.14)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
          >
            <LogOut size={15} /> Sign out
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            style={{
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              border: "none",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 900,
              color: "#fff",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Sign in
          </button>
        )}
      </div>

      {/* Landing ticker */}
      {isLandingPage && (
        <div style={{ background: "rgba(5,23,51,0.62)", borderBottom: "1px solid rgba(59,130,246,0.18)", overflow: "hidden", height: 32, display: "flex", alignItems: "center" }}>
          <div style={{ overflow: "hidden", width: "100%" }}>
            <div className="ticker-track">
              {[1, 2].map((_, i) => (
                <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.81)", padding: "0 40px", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Update</span>
                  Sub-Admin can now submit new requests · Admin can update status, edit, or delete requests · Stay compliant with monthly asset audits
                  <span style={{ color: "rgba(255,255,255,0.15)", padding: "0 20px" }}>·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}