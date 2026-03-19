import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NepalLifeLogo from "../assets/nepallife.png";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Layout/Footer";

const API_BASE = "http://192.168.0.244:5000";

/* ── Brand ── */
const NL_BLUE        = "#0B5CAB";
const NL_BLUE2       = "#1474F3";
const NL_RED         = "#E11D2E";
const NL_GRADIENT    = `linear-gradient(135deg,${NL_BLUE} 0%,${NL_BLUE2} 55%,${NL_RED} 100%)`;
const NL_GRADIENT_90 = `linear-gradient(90deg,${NL_BLUE} 70%,${NL_RED} 30%)`;

/* ── File-type groups ── */
const FILE_TYPE_GROUPS = [
  { label:"PDF",   value:"pdf",   mime:["application/pdf"] },
  { label:"Image", value:"image", mime:["image/"] },
  { label:"Word",  value:"word",  mime:["application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml"] },
  { label:"Excel", value:"excel", mime:["application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml"] },
  { label:"Text",  value:"text",  mime:["text/plain","text/csv"] },
  { label:"Other", value:"other", mime:[] },
];

const matchTypeGroup = (mime, group) => {
  if (!mime) return group === "other";
  const m = mime.toLowerCase();
  const g = FILE_TYPE_GROUPS.find(x => x.value === group);
  if (!g) return false;
  if (g.value === "other")
    return !FILE_TYPE_GROUPS.filter(x => x.value !== "other").some(x => x.mime.some(p => m.includes(p)));
  return g.mime.some(p => m.includes(p));
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');`;

const PAGE_STYLES = `
  *,*::before,*::after{box-sizing:border-box;}
  :root{
    --nl-blue:${NL_BLUE}; --nl-blue2:${NL_BLUE2}; --nl-red:${NL_RED};
    --blue-50:#eff6ff; --blue-100:#dbeafe; --blue-200:#bfdbfe;
    --blue-500:#3b82f6; --blue-600:#2563eb; --blue-700:#1d4ed8;
    --green-50:#f0fdf4; --green-100:#dcfce7; --green-200:#bbf7d0;
    --green-500:#22c55e; --green-600:#16a34a; --green-700:#15803d;
    --red-50:#fef2f2; --red-100:#fee2e2; --red-600:#dc2626;
    --amber-50:#fffbeb; --amber-100:#fef3c7; --amber-600:#d97706;
    --violet-50:#f5f3ff; --violet-100:#ede9fe; --violet-200:#ddd6fe; --violet-700:#6d28d9;
    --gray-50:#f9fafb; --gray-100:#f3f4f6; --gray-200:#e5e7eb;
    --gray-300:#d1d5db; --gray-400:#9ca3af; --gray-500:#6b7280;
    --gray-600:#4b5563; --gray-700:#374151; --gray-800:#1f2937; --gray-900:#111827;
    --white:#fff;
    --shadow-sm:0 1px 2px rgba(0,0,0,0.05);
    --shadow:0 1px 3px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.05);
    --shadow-md:0 4px 6px rgba(0,0,0,0.06),0 10px 24px rgba(0,0,0,0.08);
    --shadow-lg:0 8px 16px rgba(0,0,0,0.08),0 24px 48px rgba(0,0,0,0.1);
    --radius:10px; --radius-lg:14px; --radius-xl:18px; --nl-ink:#0F172A;
  }

  @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideInRight{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}

  .fl-root{font-family:'DM Sans',sans-serif;background:var(--gray-50);min-height:100vh;color:var(--gray-900);}
  .fl-layout{display:flex;min-height:100vh;}

  /* sidebar */
  .fl-sidebar{
    background:linear-gradient(168deg,#0a1628 0%,#1a3050 45%,#0c1e33 100%);
    border-right:1px solid rgba(59,130,246,0.13);
    box-shadow:5px 0 30px rgba(0,0,0,0.25);
    position:relative;overflow:hidden;
    transition:width 0.3s cubic-bezier(0.4,0,0.2,1);flex-shrink:0;
  }
  .fl-sidebar::before{content:'';position:absolute;top:-70px;right:-50px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,0.18) 0%,transparent 70%);pointer-events:none;}
  .fl-sidebar::after{content:'';position:absolute;bottom:-50px;left:-30px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,0.12) 0%,transparent 70%);pointer-events:none;}
  .fl-sidebar-inner{height:100%;display:flex;flex-direction:column;padding:26px 20px;min-width:220px;position:relative;z-index:1;}
  .fl-nav-item{display:flex;align-items:center;gap:11px;padding:11px 14px;border-radius:13px;background:transparent;border:1.5px solid transparent;color:rgba(255,255,255,0.52);font-size:13.5px;font-weight:500;cursor:pointer;text-align:left;width:100%;transition:all 0.22s cubic-bezier(0.4,0,0.2,1);font-family:'DM Sans',sans-serif;letter-spacing:0.01em;}
  .fl-nav-item:hover{background:linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,197,94,0.08));border-color:rgba(59,130,246,0.28);color:#93c5fd;transform:translateX(5px);}
  .fl-nav-icon{width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,0.07);display:inline-flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}

  .fl-main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;}
  .fl-topbar{background:var(--white);border-bottom:1px solid var(--gray-100);padding:6px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;position:sticky;top:0;z-index:30;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
  .fl-topbar-left,.fl-topbar-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .fl-content{flex:1;padding:0 4px;overflow-y:auto;}

  .fl-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius);font-weight:600;font-size:13px;border:none;cursor:pointer;transition:all 0.18s ease;white-space:nowrap;font-family:'Outfit',sans-serif;letter-spacing:0.01em;line-height:1;text-decoration:none;}
  .fl-btn:disabled{opacity:0.5;cursor:not-allowed;}
  .fl-btn:hover:not(:disabled){transform:translateY(-1px);}
  .fl-btn-success{background:var(--green-600);color:white;box-shadow:0 2px 8px rgba(22,163,74,0.25);}
  .fl-btn-white{background:white;border:1.5px solid var(--gray-200);color:var(--gray-700);box-shadow:var(--shadow-sm);}
  .fl-btn-blue-outline{background:var(--blue-50);border:1.5px solid var(--blue-200);color:var(--blue-700);}
  .fl-btn-red-outline{background:var(--red-50);border:1.5px solid var(--red-100);color:var(--red-600);}
  .fl-btn-sm{padding:6px 12px;font-size:12px;}
  .fl-btn-icon{width:34px;height:34px;padding:0;justify-content:center;border-radius:var(--radius);}

  .fl-filter-card1{background:white;border-radius:12px;padding:20px;box-shadow:var(--shadow);border:1.5px solid var(--gray-200);}

  /* hero */
  .fl-hero-wrap{border:1px solid rgba(11,92,171,0.12);border-radius:26px;padding:0 7px 7px 7px;background:linear-gradient(135deg,rgba(11,92,171,0.10) 0%,rgba(255,255,255,0.72) 45%,rgba(225,29,46,0.06) 100%);box-shadow:0 18px 60px rgba(2,32,53,0.14);overflow:hidden;position:relative;}
  .fl-hero-wrap::before{content:'';position:absolute;inset:-2px;background:radial-gradient(ellipse at 15% 30%,rgba(20,116,243,0.22) 0%,transparent 55%),radial-gradient(ellipse at 85% 20%,rgba(225,29,46,0.14) 0%,transparent 55%),radial-gradient(ellipse at 70% 85%,rgba(11,92,171,0.12) 0%,transparent 60%);pointer-events:none;}
  .fl-hero-inner{position:relative;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:18px;}
  .fl-logo{width:88px;max-width:30vw;height:auto;display:block;filter:drop-shadow(0 8px 18px rgba(2,32,53,0.22));animation:floaty 4.5s ease-in-out infinite;}
  .fl-title{font-family:Syne,sans-serif;font-weight:900;font-size:clamp(1.15rem,2vw,1.55rem);letter-spacing:-0.03em;margin:0;color:var(--nl-ink);line-height:1.1;}
  .fl-title .blue{color:var(--nl-blue);} .fl-title .red{color:var(--nl-red);}
  .fl-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(11,92,171,0.10);border:1px solid rgba(11,92,171,0.20);color:rgba(11,92,171,0.90);border-radius:999px;padding:5px 12px;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;}
  .fl-divider{width:46px;height:3px;border-radius:999px;background:linear-gradient(90deg,var(--nl-blue),var(--nl-red));margin-top:8px;}
  .fl-sub{margin-top:6px;font-size:11.5px;color:rgba(15,23,42,0.62);line-height:1.6;max-width:680px;}

  /* table */
  .fl-table-card{background:white;margin-top:1px;border-radius:var(--radius);border:1.5px solid var(--gray-200);box-shadow:var(--shadow);overflow:hidden;animation:fadeUp 0.35s ease both;margin-bottom:20px;}
  .fl-table{width:100%;border-collapse:collapse;}
  .fl-table thead{background:${NL_GRADIENT_90};}
  .fl-table thead th{padding:12px 16px;text-align:left;font-size:10.5px;font-weight:700;color:rgba(255,255,255,0.92);text-transform:uppercase;letter-spacing:0.09em;white-space:nowrap;font-family:'Outfit',sans-serif;}
  .fl-table tbody tr{border-bottom:1px solid var(--gray-100);transition:background 0.12s;}
  .fl-table tbody tr:last-child{border-bottom:none;}
  .fl-table tbody tr:hover{background:var(--blue-50);}
  .fl-table tbody td{padding:13px 16px;font-size:13px;color:var(--gray-700);vertical-align:top;}

  .fl-badge{display:inline-flex;align-items:center;padding:4px 9px;border-radius:6px;font-size:11px;font-weight:700;font-family:'Outfit',sans-serif;}
  .fl-badge-blue{background:var(--blue-50);color:var(--blue-700);border:1px solid var(--blue-200);}
  .fl-badge-green{background:var(--green-50);color:var(--green-700);border:1px solid var(--green-200);}
  .fl-badge-gray{background:var(--gray-100);color:var(--gray-600);border:1px solid var(--gray-200);}
  .fl-badge-amber{background:var(--amber-50);color:var(--amber-600);border:1px solid var(--amber-100);}
  .fl-badge-violet{background:var(--violet-50);color:var(--violet-700);border:1px solid var(--violet-200);}

  /* form controls */
  .fl-search-wrap{position:relative;}
  .fl-search-wrap .icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--gray-400);pointer-events:none;}
  .fl-input,.fl-select,.fl-textarea,.fl-file{
    width:100%;background:white;border:1.5px solid var(--gray-200);border-radius:var(--radius);
    padding:9px 13px;color:var(--gray-900);font-size:13.5px;
    font-family:'DM Sans',sans-serif;outline:none;transition:all 0.18s ease;
  }
  .fl-select{
    cursor:pointer;appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:calc(100% - 12px) center;padding-right:34px;
  }
  .fl-input:focus,.fl-select:focus,.fl-textarea:focus,.fl-file:focus{border-color:var(--blue-500);box-shadow:0 0 0 3px rgba(59,130,246,0.1);}
  .fl-textarea{resize:vertical;min-height:110px;}
  .fl-label{font-size:11.5px;font-weight:600;color:var(--gray-600);margin-bottom:6px;display:block;}

  .fl-alert{border-radius:var(--radius);padding:12px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:10px;border:1.5px solid;margin:8px 0;}
  .fl-alert-success{background:var(--green-50);border-color:var(--green-200);color:var(--green-700);}
  .fl-alert-error{background:var(--red-50);border-color:var(--red-100);color:var(--red-600);}

  .fl-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;text-align:center;}
  .fl-spinner{border-radius:50%;border:2.5px solid var(--gray-200);border-top-color:var(--blue-500);animation:spin 0.7s linear infinite;}

  .fl-mobile-overlay{position:fixed;inset:0;z-index:49;background:rgba(17,24,39,0.4);}

  /* modal */
  .fl-modal-overlay{position:fixed;inset:0;z-index:9999;background:rgba(17,24,39,0.6);backdrop-filter:blur(8px);display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;animation:fadeIn 0.2s ease;}
  .fl-modal-panel{width:100%;max-width:720px;background:white;border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-lg);animation:scaleIn 0.25s ease both;border:1.5px solid var(--gray-200);margin-top:12px;}
  .fl-modal-header{background:${NL_GRADIENT_90};padding:22px 26px;}
  .fl-modal-body{padding:20px 26px;}
  .fl-modal-footer{padding:16px 26px 24px;display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--gray-100);}

  /* view panel */
  .fl-view-overlay{position:fixed;inset:0;z-index:8888;background:rgba(15,23,42,0.55);backdrop-filter:blur(6px);animation:fadeIn 0.2s ease;}
  .fl-view-panel{position:fixed;top:0;right:0;bottom:0;z-index:8889;width:min(860px,96vw);background:white;box-shadow:-8px 0 48px rgba(0,0,0,0.18);display:flex;flex-direction:column;animation:slideInRight 0.3s cubic-bezier(0.34,1.26,0.64,1) both;border-left:1.5px solid var(--gray-200);}
  .fl-view-header{background:${NL_GRADIENT_90};padding:18px 22px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-shrink:0;}
  .fl-view-body{flex:1;overflow-y:auto;display:flex;flex-direction:column;}

  /* preview zone — where the actual file renders */
  .fl-preview-zone{
    background:#f1f5f9;
    border-bottom:1.5px solid var(--gray-200);
    flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    min-height:320px;
    overflow:hidden;
    position:relative;
  }
  .fl-preview-zone > img{
    max-width:100%;max-height:55vh;
    object-fit:contain;display:block;
  }
  .fl-preview-zone > iframe{
    width:100%;height:55vh;border:none;display:block;
  }

  /* meta */
  .fl-view-meta{padding:20px 24px;flex:1;}
  .fl-meta-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:16px;}
  .fl-meta-item{background:var(--gray-50);border:1.5px solid var(--gray-200);border-radius:var(--radius);padding:11px 13px;}
  .fl-meta-key{font-size:10px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;}
  .fl-meta-val{font-size:13.5px;font-weight:600;color:var(--gray-800);word-break:break-word;}

  /* filter selects row */
  .fl-filter-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;align-items:end;}

  @media(max-width:1024px){.fl-sidebar{position:fixed;top:0;left:0;height:100vh;z-index:100;}.fl-content{padding:3px;}}
  @media(max-width:640px){
    .fl-topbar{padding:8px 10px;}.fl-content{padding:1px;}
    .fl-table thead th,.fl-table tbody td{padding:10px 12px;font-size:12px;}
    .fl-hero-inner{flex-direction:column;text-align:center;}
    .fl-divider{margin-left:auto;margin-right:auto;}
    .fl-modal-body,.fl-modal-header,.fl-modal-footer{padding-left:16px;padding-right:16px;}
    .fl-view-panel{width:100vw;}
    .fl-filter-row{grid-template-columns:1fr;}
  }
`;

/* ── Atoms ── */
const AVATAR_COLORS = ["#2563eb","#16a34a","#7c3aed","#e11d48","#d97706","#0284c7","#0f766e"];
const Avatar = ({ name="U", size=40 }) => {
  const l = name[0]?.toUpperCase() || "U";
  const c = AVATAR_COLORS[(name||"").charCodeAt(0) % AVATAR_COLORS.length || 0];
  return <div style={{ width:size,height:size,borderRadius:"50%",background:c,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:size*0.38,flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.15)",fontFamily:"Outfit,sans-serif" }}>{l}</div>;
};
const Spinner = ({ size=28 }) => (
  <div className="fl-spinner" style={{ width:size, height:size }} />
);

/* ════════════════════════════════════════════
   FILE PREVIEW  — renders content inline
════════════════════════════════════════════ */
function FilePreview({ file, fileUrl }) {
  const [imgErr, setImgErr] = useState(false);
  const mime = (file.mime_type || "").toLowerCase();

  /* image */
  if (mime.startsWith("image/")) {
    if (imgErr) return (
      <div style={{ textAlign:"center",padding:"32px 20px" }}>
        <span style={{ fontSize:64 }}>
         <a href={fileUrl} target="_blank" rel="noreferrer" className="fl-btn fl-btn-sm" style={{ background:"rgba(34, 34, 34, 0.66)",color:"rgba(10, 10, 10, 0.85)",border:"1.5px solid rgba(255,255,255,0.18)" }}>🔗 Open</a>
        </span>
        <div style={{ marginTop:12,fontSize:13,color:"var(--gray-500)",fontWeight:600 }}>{file.original_name}</div>
        <div style={{ marginTop:12,fontSize:13,color:"var(--gray-500)",fontWeight:600 }}>Click Open link to View</div>
      </div>
    );
    return (
      <img
        src={fileUrl}
        alt={file.title || file.original_name}
        onError={() => setImgErr(true)}
      />
    );
  }
  /* pdf */
  if (mime.includes("pdf"))
    return <iframe src={`${fileUrl}#view=FitH&toolbar=1`} title={file.title} />;

  /* office via microsoft viewer */
  if (mime.includes("word") || mime.includes("document") || mime.includes("sheet") || mime.includes("excel") || mime.includes("presentation") || mime.includes("powerpoint"))
    return <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`} title={file.title} />;

  /* plain text / csv */
  if (mime.startsWith("text/"))
    return <iframe src={fileUrl} title={file.title} style={{ background:"white" }} />;

  /* fallback */
  const iconMap = { pdf:"📕", image:"🖼️", word:"📝", excel:"📊", zip:"🗜️" };
  const icon = Object.entries(iconMap).find(([k]) => mime.includes(k))?.[1] || "📄";
  return (
    <div style={{ textAlign:"center",padding:"40px 20px" }}>
      <span style={{ fontSize:72 }}>{icon}</span>
      <div style={{ marginTop:14,fontSize:13,color:"var(--gray-500)",fontWeight:600 }}>No preview available for this file type</div>
      <div style={{ fontSize:11,color:"var(--gray-400)",marginTop:6 }}>{mime || "Unknown type"}</div>
    </div>
  );
}

/* ════════════════════════════════════════════
   HERO
════════════════════════════════════════════ */
function NepalLifeHero() {
  return (
    <div className="fl-hero-wrap">
      <div className="fl-hero-inner">
        <div style={{ flex:1,minWidth:0 }}>
          <div className="fl-tag">
            <span style={{ width:7,height:7,borderRadius:"50%",background:NL_BLUE2,boxShadow:"0 0 8px rgba(20,116,243,0.65)" }} />
            Nepal Life · Document & File Library
          </div>
          <h2 className="fl-title">
            <span className="blue">NEPAL</span><span className="red">LIFE</span>{" "}
            <span style={{ color:"rgba(15,23,42,0.65)",fontWeight:800 }}>File Library</span>
          </h2>
          <div className="fl-divider" />
          <p className="fl-sub">
            Securely upload, organize, search, view, download, and manage letters, memos,
            PDFs, images, and office documents — filtered by branch and file type.
          </p>
        </div>
        <img src={NepalLifeLogo} alt="Nepal Life" className="fl-logo" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   VIEW PANEL
════════════════════════════════════════════ */
function ViewPanel({ file, onClose, getFileUrl, getDownloadUrl, isAdmin, onDelete }) {
  if (!file) return null;
  const fileUrl = getFileUrl(file.file_path);
  return (
    <>
      <div className="fl-view-overlay" onClick={onClose} />
      <div className="fl-view-panel">
        {/* header */}
        <div className="fl-view-header">
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.55)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:6,fontFamily:"Outfit,sans-serif" }}>
              File Preview
            </div>
            <div style={{ fontFamily:"Outfit,sans-serif",fontWeight:800,fontSize:"clamp(1rem,2.5vw,1.3rem)",color:"white",letterSpacing:"-0.02em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
              {file.title || file.original_name || "Untitled"}
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
            <a href={getDownloadUrl(file.id)} className="fl-btn fl-btn-sm" style={{ background:"rgba(255,255,255,0.15)",color:"white",border:"1.5px solid rgba(255,255,255,0.25)" }}>⬇ Download</a>
            <button onClick={onClose} className="fl-btn fl-btn-sm" style={{ background:"rgba(255,255,255,0.12)",border:"1.5px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.9)" }}>✕</button>
          </div>
        </div>
        {/* actual file rendered here */}
        <div className="fl-preview-zone">
          <FilePreview file={file} fileUrl={fileUrl} />
        </div>

        {/* metadata */}
        <div className="fl-view-meta">
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:14,flexWrap:"wrap" }}>
            <div style={{ fontSize:13,fontWeight:700,color:"var(--gray-700)",fontFamily:"Outfit,sans-serif" }}>File Details</div>
            {isAdmin && (
              <button onClick={() => { onClose(); onDelete(file.id); }} className="fl-btn fl-btn-red-outline fl-btn-sm">
                🗑 Delete
              </button>
            )}
          </div>

          <div className="fl-meta-grid">
            {[
              { k:"File ID",       v:`#${file.id}` },
              { k:"Category",      v:file.category || "—",       cap:true },
              { k:"Branch",        v:file.branch ? `🏢 ${file.branch}` : "—" },
              { k:"File Type",     v:file.mime_type || "—" },
              { k:"Original Name", v:file.original_name || "—" },
              { k:"Uploaded",      v:file.created_at ? new Date(file.created_at).toLocaleString() : "—" },
            ].map(({ k, v, cap }) => (
              <div className="fl-meta-item" key={k}>
                <div className="fl-meta-key">{k}</div>
                <div className="fl-meta-val" style={cap ? { textTransform:"capitalize" } : {}}>{v}</div>
              </div>
            ))}
          </div>

          {file.description && (
            <div style={{ background:"var(--blue-50)",border:"1.5px solid var(--blue-100)",borderRadius:"var(--radius)",padding:"14px 16px",marginTop:4 }}>
              <div style={{ fontSize:10,fontWeight:700,color:"var(--blue-700)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8 }}>Description</div>
              <div style={{ fontSize:13.5,color:"var(--gray-700)",lineHeight:1.7 }}>{file.description}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
function Ic({ d, size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const D = {
  branch:   "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75",
  assets:   "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
  requests: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z",
  help:     "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
  graph:    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  users:    "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
};
/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function FileLibraryPage() {
  const navigate  = useNavigate();
  const { token, isAdmin, isSubAdmin, user } = useAuth();

  const userRole = isAdmin
    ? "admin"
    : isSubAdmin
    ? "sub-admin"
    : (user?.role || "user").toLowerCase();
  const [files,        setFiles]        = useState([]);
  const [apiBranches,  setApiBranches]  = useState([]); // real branch names from API
  const [loading,      setLoading]      = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [message,      setMessage]      = useState("");
  const [error,        setError]        = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [search,       setSearch]       = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterType,   setFilterType]   = useState("");
  const [filterCat,    setFilterCat]    = useState("");
  const [menuOpen,     setMenuOpen]     = useState(true);
  const [winW,         setWinW]         = useState(window.innerWidth);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [viewFile,     setViewFile]     = useState(null);
  const [form, setForm] = useState({ title:"", category:"", branch:"", description:"" });

  useEffect(() => {
    const h = () => setWinW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const swWidth = () => {
    if (winW < 640)  return menuOpen ? "85vw" : "0";
    if (winW < 1024) return menuOpen ? "280px" : "0";
    return menuOpen ? "260px" : "0";
  };

  const categories = ["memo","letter","document","image","report","pdf","other"];

  /* ── fetch real branches from API ── */
  const fetchApiBranches = useCallback(async () => {
    try {
      // Try all-branches endpoint; fall back to paginated
      let res = await fetch(`${API_BASE}/api/branches/all`);
      if (!res.ok) res = await fetch(`${API_BASE}/api/branches?limit=500&page=1`);
      const json = await res.json();
      const list = json?.data || json || [];
      const names = [...new Set(
        (Array.isArray(list) ? list : [])
          .map(b => String(b.name || "").trim())
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b));
      setApiBranches(names);
    } catch {
      setApiBranches([]);
    }
  }, []);

  /* ── fetch files ── */
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch(`${API_BASE}/api/files`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch files");
      setFiles(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch files");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFiles(); fetchApiBranches(); }, [fetchFiles, fetchApiBranches]);

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    let list = files;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(f =>
      [f.id, f.title, f.original_name, f.category, f.mime_type, f.description, f.branch]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
    if (filterBranch) list = list.filter(f => (f.branch || "") === filterBranch);
    if (filterType)   list = list.filter(f => matchTypeGroup(f.mime_type, filterType));
    if (filterCat)    list = list.filter(f => (f.category || "").toLowerCase() === filterCat);
    return list;
  }, [files, search, filterBranch, filterType, filterCat]);

  /* branches that actually have files (for option counts) */
  const activeBranches = useMemo(() => {
    const s = new Set(files.map(f => f.branch).filter(Boolean));
    return [...s];
  }, [files]);

  /* branch options for select: from API, only show ones with files */
  const branchSelectOptions = useMemo(() => {
    if (!apiBranches.length) return activeBranches.sort();
    return apiBranches.filter(b => activeBranches.includes(b));
  }, [apiBranches, activeBranches]);

  const handleInput = e => { const { name, value } = e.target; setForm(p => ({ ...p, [name]:value })); };

  const closeModal = () => {
    setModalOpen(false); setSelectedFile(null);
    setForm({ title:"", category:"", branch:"", description:"" });
    const inp = document.getElementById("fileInput");
    if (inp) inp.value = "";
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault(); setMessage(""); setError("");
    if (!selectedFile) { setError("Please choose a file first."); return; }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("title", form.title);
      fd.append("category", form.category);
      fd.append("branch", form.branch);
      fd.append("description", form.description);
      const res = await fetch(`${API_BASE}/api/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Upload failed");
      setMessage("File uploaded successfully.");
      closeModal(); fetchFiles(); fetchApiBranches();
    } catch (err) { setError(err.message || "Upload failed"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setError("Only admins can delete files.");
      return;
    }

    if (!window.confirm("Delete this file?")) return;

    try {
      setMessage("");
      setError("");

      const res = await fetch(`${API_BASE}/api/files/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage("File deleted.");
      fetchFiles();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  const fmtDate    = v => { if (!v) return "—"; const d = new Date(v); return isNaN(d) ? v : d.toLocaleString(); };
  const getFileUrl = fp => `${API_BASE}${fp}`;
  const getDownUrl = id => `${API_BASE}/api/files/download/${id}`;

  const catBadge = cat => {
    const c = (cat || "").toLowerCase();
    if (["memo","letter"].includes(c)) return "fl-badge fl-badge-blue";
    if (c === "image")                 return "fl-badge fl-badge-green";
    if (["pdf","report"].includes(c))  return "fl-badge fl-badge-amber";
    return "fl-badge fl-badge-gray";
  };

  const roleBadge = ({
    admin:       { background:"linear-gradient(135deg,#dc2626,#991b1b)", color:"white" },
    "sub-admin": { background:"linear-gradient(135deg,#d97706,#92400e)", color:"white" },
    user:        { background:"var(--gray-100)", color:"var(--gray-700)" },
  }[userRole] || {});

  const hasFilters = filterBranch || filterType || filterCat || search.trim();

  const navItems = [
  { label: "Analytics",      path: "/assetdashboard",       icon: D.graph },
  { label: "Branches",       path: "/branches",             icon: D.branch },
  { label: "Asset Master",   path: "/branch-assets-report", icon: D.assets },
  { label: "Requests",       path: "/requests",             icon: D.requests, show: isAdmin || isSubAdmin },
  { label: "Users",          path: "/admin/users",          icon: D.users, show: isAdmin },
  { label: "Help & Support", path: "/support",              icon: D.help },
].filter((l) => l.show !== false);

  return (
    <div className="fl-root">
      <style>{FONTS}{PAGE_STYLES}</style>

      <div className="fl-layout">
        {menuOpen && winW < 1024 && <div className="fl-mobile-overlay" onClick={() => setMenuOpen(false)} />}

        {/* ═══ SIDEBAR ═══ */}
        <aside className="fl-sidebar" style={{ width:swWidth(),minHeight:"100vh",position:winW<1024?"fixed":"relative",top:0,left:0,zIndex:300,height:winW<1024?"100vh":"auto" }}>
          {menuOpen && (
            <div className="fl-sidebar-inner">
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32 }}>
                <div onClick={() => navigate("/")} style={{ cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:10 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <img src="https://play-lh.googleusercontent.com/zW5KMgLpmTvg0TA4xYIztb5HedXa6mqbAflXHBnNWix5kKetiqtR1ZOqNghuBtleiJkN" alt="NLI" style={{ width:36,height:36,borderRadius:8,objectFit:"cover",boxShadow:"0 2px 10px rgba(0,0,0,0.4)" }} />
                    <span style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,letterSpacing:"-0.02em",color:"#1474f3ea" }}>Asset<span style={{ color:"#f31225ef" }}>IMS</span></span>
                  </div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,0.38)",fontWeight:600,letterSpacing:"0.06em" }}>FILE LIBRARY</div>
                </div>
              </div>
              <div style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.28)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8,paddingLeft:4,fontFamily:"Outfit,sans-serif" }}>Navigation</div>
              <nav style={{ display:"flex",flexDirection:"column",gap:4,marginBottom:24 }}>
                {navItems.map((item, idx) => (
                <button key={idx} className="b-nav-item" onClick={() => navigate(item.path)}>
                  <span className="b-nav-icon">
                    <Ic d={item.icon} size={14} />
                  </span>
                  {item.label}
                </button>
              ))}
              </nav>
              <div style={{ marginTop:"auto",paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ background:"linear-gradient(135deg,rgba(37,99,235,0.14),rgba(34,197,94,0.07))",border:"1px solid rgba(37,99,235,0.22)",borderRadius:14,padding:14 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <Avatar name="File User" size={40} />
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:700,color:"#f1f5f9",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>Document Library</div>
                      <div style={{ marginTop:4,display:"inline-flex",alignItems:"center",borderRadius:999,padding:"2px 8px",fontSize:9,fontWeight:800,letterSpacing:"0.1em",fontFamily:"Outfit,sans-serif",textTransform:"uppercase",...roleBadge }}>{userRole}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ═══ MAIN ═══ */}
        <main className="fl-main">
          <div className="fl-topbar">
            <div className="fl-topbar-left">
              <button className="fl-btn fl-btn-white fl-btn-icon" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen
                  ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
              </button>
              <div style={{ width:1,height:20,background:"var(--gray-200)" }} />
              <div style={{ fontSize:13,fontWeight:700,color:"var(--gray-700)",fontFamily:"Outfit,sans-serif" }}>File Library</div>
            </div>
            <div className="fl-topbar-right">
              <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:999,fontSize:11,fontWeight:800,fontFamily:"Outfit,sans-serif",letterSpacing:"0.08em",textTransform:"uppercase",border:"1.5px solid var(--gray-200)",...roleBadge }}>
                <span style={{ width:6,height:6,borderRadius:"50%",background:"currentColor",opacity:0.6 }} />{userRole}
              </div>
              <button className="fl-btn fl-btn-blue-outline fl-btn-sm" onClick={fetchFiles}>Refresh</button>
              <button className="fl-btn fl-btn-success fl-btn-sm" onClick={() => setModalOpen(true)}>+ Upload File</button>
            </div>
          </div>

          <div className="fl-content">
            {message && (
              <div className="fl-alert fl-alert-success" style={{ margin:"10px 2px 0" }}>
                ✓ {message}
                <button onClick={() => setMessage("")} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"inherit",fontWeight:800 }}>✕</button>
              </div>
            )}
            {error && (
              <div className="fl-alert fl-alert-error" style={{ margin:"10px 2px 0" }}>
                ✕ {error}
                <button onClick={() => setError("")} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"inherit",fontWeight:800 }}>✕</button>
              </div>
            )}

            <NepalLifeHero />

            {/* ════ FILTER CARD ════ */}
            <div className="fl-filter-card1" style={{ margin:"14px 2px 0" }}>
              {/* Search row */}
              <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12,marginBottom:16,flexWrap:"wrap" }}>
                <div style={{ flex:1,minWidth:220 }}>
                  <label className="fl-label">Search Files</label>
                  <div className="fl-search-wrap">
                    <input type="text" placeholder="Search by title, file name, branch, category…" className="fl-input" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingRight:36 }} />
                    <svg className="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
                  <span className="fl-badge fl-badge-blue">{filtered.length} Visible</span>
                  <span className="fl-badge fl-badge-green">{files.length} Total</span>
                  {hasFilters && (
                    <button className="fl-btn fl-btn-sm" onClick={() => { setSearch(""); setFilterBranch(""); setFilterType(""); setFilterCat(""); }} style={{ background:"var(--red-50)",border:"1.5px solid var(--red-100)",color:"var(--red-600)",padding:"4px 10px",fontSize:11 }}>
                      ✕ Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Three select filters */}
              <div className="fl-filter-row">
                <div>
                  <label className="fl-label">🏢 Branch</label>
                  <select className="fl-select" value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                    <option value="">All Branches</option>
                    {branchSelectOptions.map(b => (
                      <option key={b} value={b}>
                        {b}  ({files.filter(f => f.branch === b).length} files)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="fl-label">📄 File Type</label>
                  <select className="fl-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    {FILE_TYPE_GROUPS.map(tg => (
                      <option key={tg.value} value={tg.value}>{tg.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="fl-label">🗂 Category</label>
                  <select className="fl-select" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ textTransform:"capitalize" }}>
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat} style={{ textTransform:"capitalize" }}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active chips */}
              {hasFilters && (
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:12 }}>
                  {filterBranch && <span className="fl-badge fl-badge-blue">🏢 {filterBranch}</span>}
                  {filterType   && <span className="fl-badge fl-badge-amber">📄 {FILE_TYPE_GROUPS.find(t=>t.value===filterType)?.label}</span>}
                  {filterCat    && <span className="fl-badge fl-badge-violet" style={{ textTransform:"capitalize" }}>🗂 {filterCat}</span>}
                  {search.trim()&& <span className="fl-badge fl-badge-gray">🔍 "{search}"</span>}
                </div>
              )}
            </div>

            {/* ════ TABLE ════ */}
            <div className="fl-table-card" style={{ margin:"2px" }}>
              <div style={{ padding:"12px 16px",borderBottom:"1px solid var(--gray-100)",display:"flex",alignItems:"center",gap:8 }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:"var(--green-500)",boxShadow:"0 0 8px rgba(34,197,94,0.6)" }} />
                <span style={{ fontSize:13,fontWeight:700,color:"var(--gray-700)",fontFamily:"Outfit,sans-serif" }}>
                  {loading ? "Loading…" : `${filtered.length} of ${files.length} files`}
                </span>
              </div>

              {loading ? (
                <div className="fl-empty"><Spinner size={36} /><p style={{ color:"var(--gray-500)",fontSize:14,margin:0 }}>Loading files…</p></div>
              ) : filtered.length === 0 ? (
                <div className="fl-empty">
                  <div style={{ fontSize:48 }}>📁</div>
                  <p style={{ color:"var(--gray-700)",fontWeight:700,fontSize:15,margin:0,fontFamily:"Outfit,sans-serif" }}>No files found</p>
                  <p style={{ color:"var(--gray-400)",fontSize:12,margin:0 }}>{hasFilters ? "Try adjusting your filters" : "Upload a new file to get started"}</p>
                  {hasFilters
                    ? <button className="fl-btn fl-btn-white" onClick={() => { setSearch(""); setFilterBranch(""); setFilterType(""); setFilterCat(""); }}>Clear Filters</button>
                    : <button className="fl-btn fl-btn-success" onClick={() => setModalOpen(true)}>+ Upload First File</button>}
                </div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table className="fl-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Title</th><th>Branch</th><th>Original Name</th>
                        <th>Category</th><th>Type</th><th>Created</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(file => (
                        <tr key={file.id}>
                          <td><span className="fl-badge fl-badge-blue">#{file.id}</span></td>
                          <td>
                            <div style={{ fontWeight:700,color:"var(--gray-900)" }}>{file.title || "—"}</div>
                            {file.description && <div style={{ color:"var(--gray-500)",fontSize:12,marginTop:4,maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{file.description}</div>}
                          </td>
                          <td>
                            {file.branch
                              ? <span className="fl-badge fl-badge-violet">🏢 {file.branch}</span>
                              : <span style={{ color:"var(--gray-400)",fontSize:12 }}>—</span>}
                          </td>
                          <td style={{ maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{file.original_name || "—"}</td>
                          <td><span className={catBadge(file.category)}>{file.category || "other"}</span></td>
                          <td style={{ fontSize:11.5,color:"var(--gray-500)" }}>{file.mime_type || "—"}</td>
                          <td style={{ whiteSpace:"nowrap" }}>{fmtDate(file.created_at)}</td>
                          <td>
                            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                              <button className="fl-btn fl-btn-white fl-btn-sm" onClick={() => setViewFile(file)}>👁 View</button>
                              <a href={getDownUrl(file.id)} className="fl-btn fl-btn-blue-outline fl-btn-sm">⬇ Download</a>
                              {userRole === "admin"
  ? <button className="fl-btn fl-btn-red-outline fl-btn-sm" onClick={() => handleDelete(file.id)}>🗑 Delete</button>
  : <span title="Only admins can delete" style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"6px 10px",borderRadius:"var(--radius)",background:"var(--gray-100)",color:"var(--gray-400)",fontSize:12,fontWeight:600,cursor:"not-allowed",border:"1.5px solid var(--gray-200)",fontFamily:"Outfit,sans-serif" }}>🔒 Delete</span>}
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
        </main>
      </div>
      {/* ═══ VIEW PANEL ═══ */}
      {viewFile && (
        <ViewPanel
          file={viewFile}
          onClose={() => setViewFile(null)}
          getFileUrl={getFileUrl}
          getDownloadUrl={getDownUrl}
          isAdmin={isAdmin}
          onDelete={handleDelete}
        />
      )}
      {/* ═══ UPLOAD MODAL ═══ */}
      {modalOpen && (
        <div className="fl-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="fl-modal-panel">
            <div className="fl-modal-header">
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14,flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.55)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8,fontFamily:"Outfit,sans-serif" }}>Upload New Document</div>
                  <div style={{ fontFamily:"Outfit,sans-serif",fontWeight:800,fontSize:"clamp(1.1rem,3vw,1.5rem)",color:"white",letterSpacing:"-0.02em",marginBottom:8 }}>Add File to Library</div>
                  <div style={{ fontSize:13,color:"rgba(255,255,255,0.75)" }}>Upload letters, memos, PDFs, images, and office documents</div>
                </div>
                <button className="fl-btn fl-btn-sm" onClick={closeModal} style={{ background:"rgba(255,255,255,0.12)",border:"1.5px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.9)" }}>✕ Close</button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="fl-modal-body">
                {error && <div className="fl-alert fl-alert-error" style={{ marginBottom:14 }}>{error}</div>}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
                  <div>
                    <label className="fl-label">Choose File</label>
                    <input id="fileInput" type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="fl-file" />
                  </div>
                  <div>
                    <label className="fl-label">Title</label>
                    <input type="text" name="title" value={form.title} onChange={handleInput} placeholder="Enter document title" className="fl-input" />
                  </div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
                  <div>
                    <label className="fl-label">Category</label>
                    <select name="category" value={form.category} onChange={handleInput} className="fl-select">
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="fl-label">Branch</label>
                    <select name="branch" value={form.branch} onChange={handleInput} className="fl-select">
                      <option value="">Select branch</option>
                      {/* Real branches from API */}
                      {apiBranches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:4 }}>
                  <label className="fl-label">Description</label>
                  <textarea name="description" value={form.description} onChange={handleInput} rows={4} placeholder="Enter a description for this file…" className="fl-textarea" />
                </div>
              </div>

              <div className="fl-modal-footer">
                <button type="button" className="fl-btn fl-btn-white" onClick={closeModal}>Cancel</button>
                <button type="submit" disabled={submitting} className="fl-btn" style={{ background:NL_GRADIENT,color:"white",boxShadow:"0 2px 12px rgba(11,92,171,0.3)" }}>
                  {submitting
                    ? <><div className="fl-spinner" style={{ width:14,height:14,borderColor:"rgba(255,255,255,0.3)",borderTopColor:"white" }} />Uploading…</>
                    : <><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>Upload File</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}