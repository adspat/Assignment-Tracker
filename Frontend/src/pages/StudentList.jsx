import API from "../api/axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { playScanErrorSound, playScanSuccessSound } from "../utils/scanSounds";

/* ─── Palette tokens updated to the earthy pastel theme ─── */
const tk = {
  canvas: "#FFFFFF",          // Pure White base for main layout backdrops
  card: "#FFFFFF",            // Pure White background surface for modules
  accent: "#CCD5AE",          // 1. Sage Green for primary confirmation accents & buttons
  accentHover: "#b6bf96",     // Darker iteration of Sage Green for interactive actions
  accentSoft: "#E9EDC9",      // 2. Olive Cream for active tags, badge fills, and structural markers
  accentBorder: "#D4A373",    // 5. Rich Tan Accent for explicit outlines & focal framework links
  cardBorder: "rgba(212,163,115,0.25)", // Softened Tan wire edges
  textPrimary: "#4A443A",     // Charcoal-Brown ensures premium high-contrast readability
  textSecondary: "#6E675F",   // Medium muted text accents
  textMuted: "#918A82",       // Soft label subtext color values
  metaBg: "#FAEDCD",          // 4. Sand color for distinct content info matrices
  danger: "#e5484d",
  dangerSoft: "rgba(229,72,77,0.08)",
  success: "#30a46c",
  successSoft: "rgba(48,164,108,0.10)",
};

/* ─── Google Fonts injection ─── */
if (!document.getElementById("edu-fonts")) {
  const link = document.createElement("link");
  link.id = "edu-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

/* ─── Keyframe animations ─── */
if (!document.getElementById("student-list-animations")) {
  const s = document.createElement("style");
  s.id = "student-list-animations";
  s.textContent = `
    @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
    @keyframes rowIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideUpCenter { from{opacity:0;transform:translate(-50%,-40%)} to{opacity:1;transform:translate(-50%,-50%)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes dropdownIn { from{opacity:0;transform:translateY(-6px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes scanLine {
      0%, 100% { top: 20%; opacity: 0.5; }
      50%        { top: 80%; opacity: 1;   }
    }
    .student-row { animation: rowIn 0.35s ease both; }
    .mobile-card { animation: rowIn 0.3s ease both; }
    .shimmer-pulse { animation: shimmer 1.4s ease-in-out infinite; }
    .spin { animation: spin 0.7s linear infinite; }
    .dropdown-menu { animation: dropdownIn 0.18s cubic-bezier(0.34,1.3,0.64,1) forwards; }

    /* ── html5-qrcode UI overrides ── */
    #qr-scanner-container video {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      border-radius: 14px !important;
    }
    #qr-scanner-container img[alt="Info icon"],
    #qr-scanner-container img[alt="Camera based scan"],
    #qr-scanner-container select,
    #qr-scanner-container button,
    #qr-scanner-container span {
      display: none !important;
    }
    #qr-scanner-container {
      border: none !important;
      padding: 0 !important;
    }
  `;
  document.head.appendChild(s);
}

/* ─── Breakpoint hook ─── */
const useIsMobile = () => {
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
};

/* ─── Avatar ─── */
const Avatar = ({ name, size = "md" }) => {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  const hue = [...(name || "")].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const sizeClasses = size === "lg" ? "w-12 h-12 text-sm" : "w-9 h-9 text-xs";
  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center font-bold flex-shrink-0 tracking-wide border`}
      style={{
        background: `hsl(${hue},40%,93%)`,
        borderColor: `hsl(${hue},25%,83%)`,
        color: tk.textPrimary,
      }}
    >
      {initials}
    </div>
  );
};

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => {
  const submitted = status === "submitted";
  return (
    <span
      className="inline-flex items-center gap-1 text-[0.65rem] font-bold tracking-wide px-2.5 py-1 rounded-full border whitespace-nowrap"
      style={{
        backgroundColor: submitted ? tk.successSoft : tk.metaBg,
        borderColor: submitted ? "rgba(48,164,108,0.2)" : tk.cardBorder,
        color: submitted ? tk.success : tk.textPrimary,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: submitted ? tk.success : tk.accentBorder }}
      />
      {submitted ? "Submitted" : "Pending"}
    </span>
  );
};

/* ─── Spinner ─── */
const Spinner = () => (
  <span
    className="spin inline-block w-3 h-3 rounded-full border-2 border-white/30 border-t-white"
    style={{ animation: "spin 0.7s linear infinite" }}
  />
);

/* ─── Skeleton row (desktop) ─── */
const SkeletonRow = () => (
  <tr>
    {[44, 28, 16, 16, 14, 18, 14].map((w, i) => (
      <td key={i} className="px-5 py-4">
        <div
          className="shimmer-pulse h-3 rounded-md"
          style={{ width: `${w}%`, backgroundColor: tk.metaBg, opacity: 0.5 }}
        />
      </td>
    ))}
  </tr>
);

/* ─── Skeleton card (mobile) ─── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ border: `1px solid ${tk.cardBorder}` }}>
    <div className="shimmer-pulse w-11 h-11 rounded-full bg-black/[0.04] flex-shrink-0" />
    <div className="flex-1">
      <div className="shimmer-pulse h-3 w-[55%] rounded-md bg-black/[0.04] mb-2" />
      <div className="shimmer-pulse h-2.5 w-[30%] rounded-md bg-black/[0.04]" />
    </div>
    <div className="shimmer-pulse w-20 h-8 rounded-xl bg-black/[0.04]" />
  </div>
);

/* ─── Search Bar ─── */
const SearchBar = ({ value, onChange, isMobile, resultCount, totalCount }) => {
  const inputRef = useRef(null);
  const hasQuery = value.length > 0;
  return (
    <div className={`${isMobile ? "mb-3" : "mb-4"}`}>
      <div className="relative flex items-center">
        <i
          className="ri-search-line absolute left-3.5 text-base pointer-events-none z-10 transition-colors duration-200"
          style={{ color: hasQuery ? tk.accentBorder : tk.textMuted }}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by name, enrollment, branch…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${isMobile ? "py-2.5" : "py-3"} pl-10 pr-10 bg-white rounded-xl text-[0.82rem] font-medium transition-all duration-200 focus:outline-none`}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: tk.textPrimary,
            border: hasQuery ? `2px solid ${tk.accent}` : `1px solid ${tk.cardBorder}`,
            boxShadow: hasQuery ? `0 0 0 3px ${tk.accentSoft}` : "0 1px 2px rgba(0,0,0,0.03)",
          }}
        />
        {hasQuery && (
          <button
            onClick={() => { onChange(""); inputRef.current?.focus(); }}
            className="absolute right-2.5 w-6 h-6 rounded-full border-none flex items-center justify-center cursor-pointer transition-colors duration-150"
            style={{ backgroundColor: tk.metaBg, color: tk.textSecondary }}
          >
            <i className="ri-close-line" />
          </button>
        )}
      </div>
      {hasQuery && (
        <p
          className="mt-1.5 ml-0.5 text-[0.68rem] font-semibold"
          style={{ animation: "fadeIn 0.15s ease", color: resultCount === 0 ? tk.danger : tk.accentBorder }}
        >
          {resultCount === 0
            ? "No students match your search"
            : `${resultCount} of ${totalCount} student${resultCount !== 1 ? "s" : ""} match`}
        </p>
      )}
    </div>
  );
};

/* ─── Filter Tabs ─── */
const FilterTabs = ({ activeFilter, onChange, counts, isMobile }) => {
  const tabs = [
    { key: "all", label: "All", count: counts.all, icon: "ri-team-line" },
    { key: "submitted", label: "Submitted", count: counts.submitted, icon: "ri-checkbox-circle-line" },
    { key: "pending", label: "Pending", count: counts.pending, icon: "ri-time-line" },
  ];
  return (
    <div className={`flex gap-2 ${isMobile ? "mb-3" : "mb-4"}`}>
      {tabs.map(({ key, label, count, icon }) => {
        const isActive = activeFilter === key;
        
        let btnBg = "#FFFFFF";
        let btnText = tk.textSecondary;
        let btnBorder = tk.cardBorder;

        if (isActive) {
          if (key === "all") { btnBg = tk.textPrimary; btnText = "#FFFFFF"; btnBorder = tk.textPrimary; }
          else if (key === "submitted") { btnBg = tk.success; btnText = "#FFFFFF"; btnBorder = tk.success; }
          else if (key === "pending") { btnBg = tk.accentBorder; btnText = "#FFFFFF"; btnBorder = tk.accentBorder; }
        }

        const badgeBg = isActive ? "rgba(255,255,255,0.2)" : tk.metaBg;
        const badgeText = isActive ? "#FFFFFF" : tk.textPrimary;

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 px-3.5 ${isMobile ? "py-2 text-[0.72rem]" : "py-2 text-[0.74rem]"} font-bold rounded-xl border transition-all duration-150 cursor-pointer whitespace-nowrap`}
            style={{ backgroundColor: btnBg, color: btnText, borderColor: btnBorder }}
          >
            <i className={`${icon} text-[0.85rem]`} />
            {label}
            <span className="text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: badgeBg, color: badgeText }}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

/* ─── CSV Download Dropdown ─── */
const DownloadDropdown = ({ students, assignmentId, isMobile }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const buildCSV = (rows) => {
    const headers = ["Name", "Enrollment", "Class", "Branch", "Semester", "Status"];
    const data = rows.map((item) => [
      item.studentId?.name || "",
      item.studentId?.enrollment || "",
      item.studentId?.classs || "",
      item.studentId?.branch || "",
      item.studentId?.semester || "",
      item.status || "",
    ]);
    return [headers, ...data].map((r) => r.join(",")).join("\n");
  };
  const triggerDownload = (csv, suffix) => {
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `assignment_${assignmentId}_${suffix}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setOpen(false);
  };
  const options = [
    { label: "All Students", icon: "ri-team-line", color: tk.textPrimary, bg: "hover:bg-[#FEFAE0]", action: () => triggerDownload(buildCSV(students), "all"), count: students.length },
    { label: "Submitted Only", icon: "ri-checkbox-circle-line", color: tk.success, bg: "hover:bg-emerald-50", action: () => triggerDownload(buildCSV(students.filter((s) => s.status === "submitted")), "submitted"), count: students.filter((s) => s.status === "submitted").length },
    { label: "Pending Only", icon: "ri-time-line", color: tk.accentBorder, bg: "hover:bg-amber-50", action: () => triggerDownload(buildCSV(students.filter((s) => s.status !== "submitted")), "pending"), count: students.filter((s) => s.status !== "submitted").length },
  ];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-white border-none rounded-xl text-[0.75rem] font-bold cursor-pointer active:scale-[0.97] transition-all duration-150 ${isMobile ? "w-full" : ""}`}
        style={{ backgroundColor: tk.textPrimary }}
      >
        <i className="ri-download-2-line" />
        CSV
        <i className={`ri-arrow-down-s-line text-base transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="dropdown-menu absolute right-0 top-[calc(100%+6px)] z-50 bg-white border rounded-2xl shadow-xl overflow-hidden" style={{ minWidth: 200, borderColor: tk.cardBorder }}>
          <div className="px-3.5 pt-3 pb-2">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] m-0" style={{ color: tk.textMuted }}>Download as CSV</p>
          </div>
          <div className="px-2 pb-2">
            {options.map(({ label, icon, color, bg, action, count }) => (
              <button key={label} onClick={action} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-none bg-transparent cursor-pointer text-left transition-colors duration-150 ${bg}`}>
                <i className={`${icon} text-base`} style={{ color }} />
                <span className="text-[0.8rem] font-semibold flex-1" style={{ color: tk.textPrimary }}>{label}</span>
                <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: tk.metaBg, color: tk.textPrimary }}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════
   ADD STUDENT MODAL
════════════════════════════════ */
const AddStudentModal = ({ onClose, onAdd }) => {
  const [enrollment, setEnrollment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);
  const handleAdd = async () => {
    const trimmed = enrollment.trim();
    if (!trimmed) { setError("Please enter an enrollment number."); return; }
    setError("");
    setLoading(true);
    try {
      await onAdd(trimmed);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Student not found or already added.");
    } finally {
      setLoading(false);
    }
  };
  const handleKeyDown = (e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") onClose(); };
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]" style={{ animation: "fadeIn 0.2s ease" }} />
      <div
        className="fixed left-1/2 top-1/2 z-[999] bg-white rounded-[22px] shadow-2xl w-[min(420px,calc(100vw-32px))]"
        style={{ animation: "slideUpCenter 0.3s cubic-bezier(0.34,1.3,0.64,1) forwards", padding: "28px 28px 24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: tk.accentSoft, border: `1px solid ${tk.accent}` }}>
              <i className="ri-user-add-line" style={{ color: tk.textPrimary }} />
            </div>
            <div>
              <h2 className="m-0 text-[1.1rem] font-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: tk.textPrimary }}>Add Student</h2>
              <p className="mt-0.5 text-[0.68rem] font-medium" style={{ color: tk.textMuted }}>Link student by enrollment number</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-none flex items-center justify-center cursor-pointer text-base hover:bg-black/10 transition-colors flex-shrink-0" style={{ backgroundColor: tk.metaBg, color: tk.textSecondary }}>
            <i className="ri-close-line" />
          </button>
        </div>
        <div className="mb-2">
          <label className="block text-[0.62rem] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: tk.textMuted }}>Enrollment Number</label>
          <div className="relative">
            <i className="ri-hashtag absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.9rem] pointer-events-none transition-colors duration-200" style={{ color: enrollment ? tk.accentBorder : tk.textMuted }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. 0101CS211001"
              value={enrollment}
              onChange={(e) => { setEnrollment(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              className="w-full py-3 pl-9 pr-4 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none placeholder:font-normal"
              style={{ 
                fontFamily: "'DM Sans', sans-serif",
                color: tk.textPrimary,
                backgroundColor: "#FFFFFF",
                border: error ? `2px solid ${tk.danger}` : enrollment ? `2px solid ${tk.accent}` : `1px solid ${tk.cardBorder}`,
                boxShadow: error ? `0 0 0 3px ${tk.danger}22` : enrollment ? `0 0 0 3px ${tk.accentSoft}` : "none"
              }}
            />
          </div>
          {error && (
            <p className="mt-2 text-[0.7rem] font-semibold flex items-center gap-1.5" style={{ animation: "fadeIn 0.15s ease", color: tk.danger }}>
              <i className="ri-error-warning-line text-sm" />{error}
            </p>
          )}
        </div>
        <p className="text-[0.68rem] mb-5 flex items-center gap-1.5" style={{ color: tk.textMuted }}>
          <i className="ri-information-line text-xs" style={{ color: tk.accentBorder }} />
          The student will be added to this assignment's submission list.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl text-[0.82rem] font-semibold cursor-pointer transition-colors duration-150" style={{ backgroundColor: tk.metaBg, border: `1px solid ${tk.cardBorder}`, color: tk.textPrimary }}>Cancel</button>
          <button
            onClick={handleAdd}
            disabled={loading}
            className={`flex-1 py-3 px-4 border-none rounded-xl text-[0.82rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all duration-150 ${loading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-px active:scale-[0.97]"}`}
            style={{ backgroundColor: tk.textPrimary, color: "#FFFFFF" }}
          >
            {loading ? <><Spinner /> Adding…</> : <><i className="ri-user-add-line text-base" />Add Student</>}
          </button>
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════
   QR SCANNER MODAL — html5-qrcode
════════════════════════════════ */
const SCAN_COOLDOWN_MS = 2200;

const QRScannerModal = ({ onClose, onScan, isProcessing, error: externalError, successMessage }) => {
  const html5QrRef = useRef(null);
  const scannerStartedRef = useRef(false);
  const processingRef = useRef(false);
  const lastScannedRef = useRef(null);
  const SCANNER_ID = "qr-scanner-container";

  const [camError, setCamError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    processingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(SCANNER_ID, { verbose: false });
      html5QrRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCamError("No camera found on this device.");
        return;
      }

      const backCam = cameras.find((c) =>
        c.label.toLowerCase().includes("back") ||
        c.label.toLowerCase().includes("rear") ||
        c.label.toLowerCase().includes("environment")
      ) || cameras[cameras.length - 1];

      await html5QrCode.start(
        backCam.id,
        {
          fps: 15,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          const text = decodedText.trim();
          if (!text || processingRef.current) return;

          const now = Date.now();
          const last = lastScannedRef.current;
          if (last?.text === text && now - last.time < SCAN_COOLDOWN_MS) return;

          lastScannedRef.current = { text, time: now };
          processingRef.current = true;

          if (navigator.vibrate) navigator.vibrate(100);

          Promise.resolve(onScan(text)).finally(() => {
            setTimeout(() => {
              processingRef.current = false;
            }, 500);
          });
        },
        () => {}
      );

      scannerStartedRef.current = true;
      setReady(true);
    } catch (err) {
      console.error("QR Scanner error:", err);
      if (err?.message?.toLowerCase().includes("permission")) {
        setCamError("Camera permission denied. Please allow camera access and try again.");
      } else if (err?.message?.toLowerCase().includes("notfound") || err?.message?.toLowerCase().includes("no camera")) {
        setCamError("No camera found on this device.");
      } else {
        setCamError("Could not start camera. Please try again.");
      }
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current && scannerStartedRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (_) {}
      scannerStartedRef.current = false;
    }
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  const displayError = externalError || camError;

  return (
    <>
      <div onClick={handleClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]" style={{ animation: "fadeIn 0.2s ease" }} />
      <div
        className="fixed left-1/2 top-1/2 z-[999] bg-white rounded-[22px] shadow-2xl w-[min(420px,calc(100vw-32px))]"
        style={{ animation: "slideUpCenter 0.3s cubic-bezier(0.34,1.3,0.64,1) forwards", padding: "28px 28px 24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: tk.accentSoft, border: `1px solid ${tk.accent}` }}>
              <i className="ri-qr-scan-2-line" style={{ color: tk.textPrimary }} />
            </div>
            <div>
              <h2 className="m-0 text-[1.1rem] font-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: tk.textPrimary }}>
                Scan QR Code
              </h2>
              <p className="mt-0.5 text-[0.68rem] font-medium" style={{ color: tk.textMuted }}>
                Scan continuously — camera stays on after each student
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full border-none flex items-center justify-center cursor-pointer text-base hover:bg-black/10 transition-colors flex-shrink-0" style={{ backgroundColor: tk.metaBg, color: tk.textSecondary }}>
            <i className="ri-close-line" />
          </button>
        </div>

        {/* Camera View */}
        <div
          className="rounded-2xl overflow-hidden mb-4 bg-black relative shadow-inner"
          style={{ aspectRatio: "1/1", minHeight: 260, border: `2px solid ${tk.cardBorder}` }}
        >
          <div id={SCANNER_ID} className="w-full h-full" style={{ width: "100%", height: "100%" }} />

          {!ready && !camError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
              <Spinner />
              <p className="mt-3 text-[0.78rem] font-semibold text-white/60">Starting camera…</p>
            </div>
          )}

          {isProcessing && (
            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 py-2.5 bg-black/75 backdrop-blur-sm">
              <Spinner />
              <p className="text-[0.78rem] font-semibold text-white m-0">Updating status…</p>
            </div>
          )}

          {ready && !isProcessing && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-5 left-5 w-7 h-7 border-t-[3px] border-l-[3px] rounded-tl-lg opacity-80" style={{ borderColor: tk.accent }} />
              <div className="absolute top-5 right-5 w-7 h-7 border-t-[3px] border-r-[3px] rounded-tr-lg opacity-80" style={{ borderColor: tk.accent }} />
              <div className="absolute bottom-5 left-5 w-7 h-7 border-b-[3px] border-l-[3px] rounded-bl-lg opacity-80" style={{ borderColor: tk.accent }} />
              <div className="absolute bottom-5 right-5 w-7 h-7 border-b-[3px] border-r-[3px] rounded-br-lg opacity-80" style={{ borderColor: tk.accent }} />
              <div
                className="absolute left-8 right-8 h-[2px] rounded-full"
                style={{ animation: "scanLine 2s ease-in-out infinite", backgroundImage: `linear-gradient(to right, transparent, ${tk.accent}, transparent)` }}
              />
            </div>
          )}

          {camError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-3">
                <i className="ri-camera-off-line text-red-400 text-xl" />
              </div>
              <p className="text-[0.75rem] font-semibold text-white/80">{camError}</p>
            </div>
          )}
        </div>

        {/* Status text */}
        {successMessage && !camError ? (
          <p
            className="mb-4 text-[0.75rem] font-semibold flex items-center justify-center gap-1.5 border rounded-xl py-2.5 px-3"
            style={{ animation: "fadeIn 0.15s ease", backgroundColor: tk.successSoft, borderColor: "rgba(48,164,108,0.2)", color: tk.success }}
          >
            <i className="ri-checkbox-circle-fill text-sm" />
            {successMessage}
          </p>
        ) : displayError && !camError ? (
          <p
            className="mb-4 text-[0.75rem] font-semibold flex items-center justify-center gap-1.5 border rounded-xl py-2.5 px-3"
            style={{ animation: "fadeIn 0.15s ease", backgroundColor: tk.dangerSoft, borderColor: "rgba(229,72,77,0.2)", color: tk.danger }}
          >
            <i className="ri-error-warning-line text-sm" />
            {displayError}
          </p>
        ) : !camError ? (
          <p className="text-[0.68rem] text-center mb-4 flex items-center justify-center gap-1.5" style={{ color: tk.textMuted }}>
            <i className="ri-focus-3-line" style={{ color: tk.accentBorder }} />
            Point at a student QR — scanner stays open for the next scan
          </p>
        ) : (
          <div className="mb-4" />
        )}

        <button
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-xl text-[0.82rem] font-semibold cursor-pointer transition-colors duration-150"
          style={{ backgroundColor: tk.metaBg, border: `1px solid ${tk.cardBorder}`, color: tk.textPrimary }}
        >
          Done Scanning
        </button>
      </div>
    </>
  );
};

/* ════════════════════════════════
   MAIN COMPONENT
════════════════════════════════ */
const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [scannerSuccess, setScannerSuccess] = useState("");
  const [qrProcessing, setQrProcessing] = useState(false);
  const successClearTimerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const location = useLocation();
  const navigate = useNavigate();
  const { semester, classs, branch } = location.state || {};
  const { assignmentId } = useParams();
  const isMobile = useIsMobile();

  /* ─── Filter logic ─── */
  const filteredStudents = students.filter((item) => {
    if (statusFilter === "submitted" && item.status !== "submitted") return false;
    if (statusFilter === "pending" && item.status === "submitted") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.studentId?.name?.toLowerCase().includes(q) ||
        item.studentId?.enrollment?.toLowerCase().includes(q) ||
        item.studentId?.branch?.toLowerCase().includes(q) ||
        item.studentId?.classs?.toLowerCase().includes(q) ||
        item.studentId?.semester?.toString().includes(q) ||
        item.status?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* ── Fetch ── */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await API.get(`/api/submission/${assignmentId}`);
        if (data.success) {
          const sorted = [...data.data].sort((a, b) =>
            (a.studentId?.name?.toLowerCase() || "").localeCompare(b.studentId?.name?.toLowerCase() || "")
          );
          setStudents(sorted);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [assignmentId]);

  /* ── Add Student ── */
  const handleAddStudent = async (enrollment) => {
    const { data } = await API.post(`/api/submission/add/${assignmentId}`, { enrollment });
    if (data.success) {
      const res = await API.get(`/api/submission/${assignmentId}`);
      if (res.data.success) {
        const sorted = [...res.data.data].sort((a, b) =>
          (a.studentId?.name?.toLowerCase() || "").localeCompare(b.studentId?.name?.toLowerCase() || "")
        );
        setStudents(sorted);
      }
    } else {
      throw new Error(data.message || "Failed to add student");
    }
  };

  /* ── Submit ── */
  const handleSubmit = async (submissionId) => {
    setSubmittingId(submissionId);
    try {
      const { data } = await API.put(`/api/submission/submit/${submissionId}`, {});
      if (data.success) {
        setStudents((prev) =>
          prev.map((item) => item._id === submissionId ? { ...item, status: "submitted" } : item)
        );
        setSelectedStudent((prev) =>
          prev && prev._id === submissionId ? { ...prev, status: "submitted" } : prev
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmittingId(null);
    }
  };

  /* ── Unsubmit ── */
  const handleUnsubmit = async (submissionId) => {
    setSubmittingId(submissionId);
    try {
      const { data } = await API.put(`/api/submission/unsubmit/${submissionId}`, {});
      if (data.success) {
        setStudents((prev) =>
          prev.map((item) => item._id === submissionId ? { ...item, status: "pending" } : item)
        );
        setSelectedStudent((prev) =>
          prev && prev._id === submissionId ? { ...prev, status: "pending" } : prev
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmittingId(null);
    }
  };

  const showScannerFeedback = (type, message) => {
    if (successClearTimerRef.current) {
      clearTimeout(successClearTimerRef.current);
    }

    if (type === "success") {
      setScannerError("");
      setScannerSuccess(message);
      playScanSuccessSound();
    } else {
      setScannerSuccess("");
      setScannerError(message);
      playScanErrorSound();
    }

    successClearTimerRef.current = setTimeout(() => {
      setScannerSuccess("");
      setScannerError("");
    }, 2800);
  };

  useEffect(() => () => {
    if (successClearTimerRef.current) clearTimeout(successClearTimerRef.current);
  }, []);

  /* ── QR Scan handler ── */
  const handleQRScan = async (scannedText) => {
    if (!scannedText) return;
    const normalised = scannedText.trim().toLowerCase();
    const student = students.find(
      (s) => s.studentId?.enrollment?.trim().toLowerCase() === normalised
    );

    if (!student) {
      showScannerFeedback("error", `Enrollment "${scannedText}" not found in this assignment.`);
      return;
    }

    if (student.status === "submitted") {
      showScannerFeedback("error", `${student.studentId?.name || scannedText} is already submitted.`);
      return;
    }

    setQrProcessing(true);
    try {
      const { data } = await API.put(`/api/submission/submit/${student._id}`, {});
      if (data.success) {
        setStudents((prev) =>
          prev.map((item) => (item._id === student._id ? { ...item, status: "submitted" } : item))
        );
        setSelectedStudent((prev) =>
          prev && prev._id === student._id ? { ...prev, status: "submitted" } : prev
        );
        showScannerFeedback("success", `${student.studentId?.name || scannedText} marked as submitted`);
      } else {
        showScannerFeedback("error", data.message || "Failed to update submission.");
      }
    } catch (error) {
      showScannerFeedback(
        "error",
        error.response?.data?.message || "Failed to update submission. Please try again."
      );
    } finally {
      setQrProcessing(false);
    }
  };

  const totalSubmitted = students.filter((s) => s.status === "submitted").length;
  const totalStudents = students.length;
  const totalPending = totalStudents - totalSubmitted;
  const pct = totalStudents ? Math.round((totalSubmitted / totalStudents) * 100) : 0;
  const filterCounts = { all: totalStudents, submitted: totalSubmitted, pending: totalPending };

  const openModal = (student) => { setSelectedStudent(student); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setTimeout(() => setSelectedStudent(null), 200); };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: tk.canvas, fontFamily: "'DM Sans', sans-serif", color: tk.textPrimary, padding: isMobile ? "20px 14px 32px" : "44px 48px" }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: isMobile ? "100%" : 1100 }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold bg-transparent rounded-[9px] px-3.5 py-1.5 cursor-pointer mb-7 hover:bg-black/[0.04] transition-all duration-150"
          style={{ border: `1px solid ${tk.cardBorder}`, color: tk.textSecondary }}
        >
          <i className="ri-arrow-left-s-line text-base" />Back to Dashboard
        </button>

        {/* Page header */}
        <header className={`flex justify-between items-start flex-wrap ${isMobile ? "gap-3.5 mb-4 pb-4" : "gap-5 mb-7 pb-6"} border-b`} style={{ borderColor: tk.cardBorder }}>
          <div className="min-w-0">
            <p className="text-[0.62rem] font-bold tracking-[0.12em] uppercase mb-1.5" style={{ color: tk.accentBorder }}>Assignment Submissions</p>
            <h1
              className={`${isMobile ? "text-[1.55rem]" : "text-[2rem]"} font-black tracking-tight leading-tight m-0`}
              style={{ fontFamily: "'Playfair Display', serif", color: tk.textPrimary }}
            >
              Student<span style={{ color: tk.accentBorder }}> Records</span>
            </h1>
            {branch && (
              <p className="mt-2 text-[0.76rem] font-normal flex items-center gap-1.5 flex-wrap" style={{ color: tk.textSecondary }}>
                <i className="ri-git-branch-line text-[0.85rem]" style={{ color: tk.accentBorder }} />{branch}
                <span style={{ opacity: 0.2 }}>·</span>
                <i className="ri-hotel-line text-[0.85rem]" style={{ color: tk.accentBorder }} />Class {classs}
                <span style={{ opacity: 0.2 }}>·</span>
                <i className="ri-calendar-event-line text-[0.85rem]" style={{ color: tk.accentBorder }} />Semester {semester}
              </p>
            )}
          </div>

          {/* Stat pills */}
          {!loading && totalStudents > 0 && (
            <div className={`flex ${isMobile ? "gap-2 w-full" : "gap-2.5"} flex-wrap`}>
              {[
                { label: "Total", val: totalStudents, colorClass: tk.textPrimary, bgStyle: tk.metaBg, borderStyle: tk.cardBorder },
                { label: "Submitted", val: totalSubmitted, colorClass: tk.success, bgStyle: tk.successSoft, borderStyle: "rgba(48,164,108,0.2)" },
                { label: "Pending", val: totalPending, colorClass: tk.textPrimary, bgStyle: tk.accentSoft, borderStyle: tk.cardBorder },
              ].map(({ label, val, colorClass, bgStyle, borderStyle }) => (
                <div key={label} className={`${isMobile ? "px-3.5 py-2 flex-1" : "px-4 py-2.5"} rounded-xl text-center border`} style={{ backgroundColor: bgStyle, borderColor: borderStyle }}>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.08em] m-0 mb-0.5" style={{ color: tk.textMuted }}>{label}</p>
                  <p className={`${isMobile ? "text-base" : "text-xl"} font-bold m-0`} style={{ fontFamily: "'Playfair Display', serif", color: colorClass }}>{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          {!loading && (
            <div className={`flex flex-wrap gap-2 ${isMobile ? "w-full" : ""}`}>
              <button
                onClick={() => { setScannerError(""); setScannerSuccess(""); setShowScannerModal(true); }}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[0.75rem] font-bold cursor-pointer hover:-translate-y-px active:scale-[0.97] transition-all duration-150 ${isMobile ? "flex-1 min-w-[120px]" : ""}`}
                style={{ backgroundColor: tk.accentSoft, border: `1px solid ${tk.accent}`, color: tk.textPrimary }}
              >
                <i className="ri-qr-scan-2-line text-base" />Scan QR
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 border-none rounded-xl text-[0.75rem] font-bold cursor-pointer hover:-translate-y-px active:scale-[0.97] transition-all duration-150 ${isMobile ? "flex-1 min-w-[120px]" : ""}`}
                style={{ backgroundColor: tk.textPrimary, color: "#FFFFFF" }}
              >
                <i className="ri-user-add-line text-base" />Add Student
              </button>
              {students.length > 0 && (
                <DownloadDropdown students={students} assignmentId={assignmentId} isMobile={isMobile} />
              )}
            </div>
          )}
        </header>

        {/* Progress bar */}
        {!loading && totalStudents > 0 && (
          <div className={`bg-white rounded-2xl ${isMobile ? "p-3.5 mb-4" : "p-5 mb-5"} flex items-center gap-4`} style={{ border: `1px solid ${tk.cardBorder}` }}>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[0.7rem] font-semibold tracking-[0.05em] uppercase" style={{ color: tk.textMuted }}>Completion</span>
                <span className="text-[0.9rem] font-bold" style={{ color: pct === 100 ? tk.success : tk.textPrimary }}>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden border" style={{ backgroundColor: tk.metaBg, borderColor: tk.cardBorder }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: pct === 100 ? tk.success : tk.accent }}
                />
              </div>
            </div>
            <div className="text-[0.72rem] font-semibold whitespace-nowrap flex-shrink-0" style={{ color: tk.textSecondary }}>{totalSubmitted}/{totalStudents}</div>
          </div>
        )}

        {/* Filters */}
        {!loading && students.length > 0 && (
          <>
            <FilterTabs
              activeFilter={statusFilter}
              onChange={(f) => { setStatusFilter(f); setSearchQuery(""); }}
              counts={filterCounts}
              isMobile={isMobile}
            />
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              isMobile={isMobile}
              resultCount={filteredStudents.length}
              totalCount={statusFilter === "all" ? totalStudents : statusFilter === "submitted" ? totalSubmitted : totalPending}
            />
          </>
        )}

        {/* Content list area */}
        {loading ? (
          isMobile ? (
            <div className="flex flex-col gap-2.5">{[1,2,3,4,5].map((n) => <SkeletonCard key={n} />)}</div>
          ) : (
            <div className="bg-white rounded-[18px] overflow-hidden" style={{ border: `1px solid ${tk.cardBorder}` }}>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: tk.cardBorder, backgroundColor: tk.metaBg }}>
                    {["Student","Enrollment","Class","Branch","Semester","Status","Action"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[0.6rem] font-bold tracking-[0.1em] uppercase text-left" style={{ color: tk.textMuted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{[1,2,3,4,5].map((n) => <SkeletonRow key={n} />)}</tbody>
              </table>
            </div>
          )
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white border-2 border-dashed rounded-[20px] text-center py-20 px-8" style={{ borderColor: tk.accent }}>
            <div className="w-14 h-14 rounded-full border flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: tk.accentSoft, borderColor: tk.accent }}>
              <i className={`${searchQuery ? "ri-search-line" : statusFilter !== "all" ? "ri-filter-line" : "ri-user-search-line"} text-2xl`} style={{ color: tk.textPrimary }} />
            </div>
            <h3 className="text-[1.05rem] font-bold mb-1.5" style={{ fontFamily: "'Playfair Display', serif", color: tk.textPrimary }}>
              {searchQuery ? "No results found" : statusFilter !== "all" ? `No ${statusFilter} students` : "No student records"}
            </h3>
            <p className="text-[0.78rem]" style={{ color: tk.textSecondary }}>
              {searchQuery
                ? `No students match "${searchQuery}". Try a different search.`
                : statusFilter === "submitted" ? "No students have submitted this assignment yet."
                : statusFilter === "pending" ? "All students have submitted — great work!"
                : "No submissions have been recorded for this assignment yet."}
            </p>
            {(searchQuery || statusFilter !== "all") ? (
              <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); }} className="mt-3.5 px-4 py-2 border rounded-[9px] text-[0.76rem] font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors" style={{ backgroundColor: tk.metaBg, borderColor: tk.cardBorder, color: tk.textPrimary }}>
                <i className="ri-close-line" /> Clear filters
              </button>
            ) : (
              <button onClick={() => setShowAddModal(true)} className="mt-3.5 px-4 py-2 border-none rounded-[9px] text-[0.76rem] font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors" style={{ backgroundColor: tk.textPrimary, color: "#FFFFFF" }}>
                <i className="ri-user-add-line" /> Add First Student
              </button>
            )}
          </div>
        ) : isMobile ? (
          <MobileCardList students={filteredStudents} submittingId={submittingId} onSubmit={handleSubmit} onUnsubmit={handleUnsubmit} onOpenModal={openModal} />
        ) : (
          <div className="bg-white border rounded-[18px] overflow-hidden shadow-sm" style={{ borderColor: tk.cardBorder }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ tableLayout: "fixed", minWidth: 760 }}>
                <colgroup>
                  <col style={{ width: "20%" }} /><col style={{ width: "14%" }} /><col style={{ width: "10%" }} />
                  <col style={{ width: "13%" }} /><col style={{ width: "11%" }} /><col style={{ width: "13%" }} />
                  <col style={{ width: "19%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b" style={{ backgroundColor: tk.metaBg, borderColor: tk.cardBorder }}>
                    {[
                      { label: "Student", icon: "ri-user-line" },
                      { label: "Enrollment", icon: "ri-hashtag" },
                      { label: "Class", icon: "ri-hotel-line" },
                      { label: "Branch", icon: "ri-git-branch-line" },
                      { label: "Semester", icon: "ri-calendar-event-line" },
                      { label: "Status", icon: "ri-checkbox-circle-line" },
                      { label: "Action", icon: null, align: "right" },
                    ].map(({ label, icon, align }) => (
                      <th key={label} className={`px-5 py-3 text-[0.6rem] font-bold tracking-[0.09em] uppercase whitespace-nowrap ${align === "right" ? "text-right" : "text-left"}`} style={{ color: tk.textMuted }}>
                        {icon && <i className={`${icon} text-[0.82rem] mr-1 align-[-1px]`} />}{label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((item, idx) => (
                    <StudentRow key={item._id} item={item} idx={idx} onSubmit={handleSubmit} onUnsubmit={handleUnsubmit} isSubmitting={submittingId === item._id} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t px-5 py-2.5 flex justify-between items-center gap-1.5" style={{ borderColor: tk.cardBorder }}>
              {statusFilter !== "all" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: statusFilter === "submitted" ? tk.successSoft : tk.metaBg, color: statusFilter === "submitted" ? tk.success : tk.textPrimary, borderColor: statusFilter === "submitted" ? "rgba(48,164,108,0.2)" : tk.cardBorder }}>
                    {statusFilter === "submitted" ? "Submitted" : "Pending"} filter active
                  </span>
                  <button onClick={() => setStatusFilter("all")} className="text-[0.68rem] font-semibold hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none" style={{ color: tk.textMuted }}>Clear</button>
                </div>
              )}
              <div className={`flex items-center gap-1.5 ${statusFilter === "all" ? "ml-auto" : ""}`}>
                <i className="ri-list-check text-stone-400 text-[0.85rem]" />
                <span className="text-[0.7rem] font-semibold" style={{ color: tk.textMuted }}>
                  {searchQuery || statusFilter !== "all" ? `${filteredStudents.length} of ${students.length} records` : `${students.length} records total`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && selectedStudent && (
        <MobileDetailModal student={selectedStudent} submittingId={submittingId} onSubmit={handleSubmit} onUnsubmit={handleUnsubmit} onClose={closeModal} />
      )}
      {showAddModal && (
        <AddStudentModal onClose={() => setShowAddModal(false)} onAdd={handleAddStudent} assignmentId={assignmentId} />
      )}
      {showScannerModal && (
        <QRScannerModal
          onClose={() => { setShowScannerModal(false); setScannerError(""); setScannerSuccess(""); }}
          onScan={handleQRScan}
          isProcessing={qrProcessing}
          error={scannerError}
          successMessage={scannerSuccess}
        />
      )}
    </div>
  );
};

/* ════════════════════════════════
   MOBILE CARD LIST
════════════════════════════════ */
const MobileCardList = ({ students, submittingId, onSubmit, onUnsubmit, onOpenModal }) => (
  <div className="flex flex-col gap-2.5">
    <div className="flex items-center justify-between pb-2">
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em]" style={{ color: tk.textMuted }}>{students.length} students</span>
      <span className="text-[0.65rem] font-medium flex items-center gap-1" style={{ color: tk.textMuted }}>
        <i className="ri-information-line text-[0.8rem]" />Tap name for full details
      </span>
    </div>
    {students.map((item, idx) => (
      <MobileStudentCard key={item._id} item={item} idx={idx} submittingId={submittingId} onSubmit={onSubmit} onUnsubmit={onUnsubmit} onOpenModal={onOpenModal} />
    ))}
  </div>
);

/* ─── MOBILE STUDENT CARD ─── */
const MobileStudentCard = ({ item, idx, submittingId, onSubmit, onUnsubmit, onOpenModal }) => {
  const submitted = item.status === "submitted";
  const isLoading = submittingId === item._id;
  return (
    <div className="mobile-card bg-white rounded-2xl overflow-hidden shadow-sm" style={{ animationDelay: `${idx * 0.035}s`, border: `1px solid ${tk.cardBorder}` }}>
      <div className="flex items-center">
        <button onClick={() => onOpenModal(item)} className="flex-1 flex items-center gap-3 px-3.5 py-3.5 bg-transparent border-none cursor-pointer text-left min-w-0 active:bg-black/[0.02] transition-colors duration-150">
          <Avatar name={item.studentId?.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[0.88rem] font-bold truncate" style={{ color: tk.textPrimary }}>{item.studentId?.name || "N/A"}</p>
            <div className="flex items-center gap-1.5 mt-1"><StatusBadge status={item.status} /></div>
          </div>
          <i className="ri-arrow-right-s-line text-base text-stone-400 flex-shrink-0 ml-auto" />
        </button>
        <div className="w-px h-14 flex-shrink-0" style={{ backgroundColor: tk.cardBorder }} />
        <div className="px-3 flex-shrink-0">
          {!submitted ? (
            <button onClick={() => onSubmit(item._id)} disabled={isLoading} className="inline-flex items-center gap-1 px-3.5 py-2 border rounded-xl text-[0.72rem] font-bold cursor-pointer whitespace-nowrap active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed" style={{ backgroundColor: tk.accentSoft, borderColor: tk.accent, color: tk.textPrimary }}>
              {isLoading ? <><Spinner /> Saving…</> : <><i className="ri-check-line text-[0.9rem]" />Submit</>}
            </button>
          ) : (
            <button onClick={() => onUnsubmit(item._id)} disabled={isLoading} className="inline-flex items-center gap-1 px-3.5 py-2 border rounded-xl text-[0.72rem] font-bold cursor-pointer whitespace-nowrap active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed" style={{ backgroundColor: tk.successSoft, borderColor: "rgba(48,164,108,0.2)", color: tk.success }}>
              {isLoading ? <><Spinner /> Saving…</> : <><i className="ri-check-double-line text-[0.9rem]" />Done</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════
   MOBILE DETAIL MODAL
════════════════════════════════ */
const MobileDetailModal = ({ student, submittingId, onSubmit, onUnsubmit, onClose }) => {
  const submitted = student.status === "submitted";
  const isLoading = submittingId === student._id;
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[998]" style={{ animation: "fadeIn 0.2s ease" }} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[999] bg-white rounded-t-[22px] shadow-[0_-8px_40px_rgba(0,0,0,0.08)] max-h-[88vh] overflow-y-auto overflow-x-hidden"
        style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))", animation: "slideUp 0.3s cubic-bezier(0.34,1.3,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1"><div className="w-9 h-1 rounded-full bg-black/[0.12]" /></div>
        <div className="flex items-center justify-between px-5 py-3 pb-4 border-b" style={{ borderColor: tk.cardBorder }}>
          <div className="flex items-center gap-3">
            <Avatar name={student.studentId?.name} size="lg" />
            <div>
              <p className="m-0 text-base font-bold" style={{ color: tk.textPrimary }}>{student.studentId?.name || "N/A"}</p>
              <p className="mt-0.5 m-0 text-[0.68rem] font-medium" style={{ color: tk.textMuted }}>Student Details</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border-none flex items-center justify-center cursor-pointer text-lg hover:bg-black/10 transition-colors" style={{ backgroundColor: tk.metaBg, color: tk.textSecondary }}>
            <i className="ri-close-line" />
          </button>
        </div>
        <div className="px-5 pt-5 grid gap-2.5">
          <div className="border-2 rounded-2xl p-4 flex items-center justify-between" style={{ backgroundColor: submitted ? tk.successSoft : tk.metaBg, borderColor: submitted ? "rgba(48,164,108,0.2)" : tk.cardBorder }}>
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: submitted ? tk.success : tk.textPrimary }}>Submission Status</p>
              <p className="m-0 text-base font-bold" style={{ color: submitted ? tk.success : tk.textPrimary }}>{submitted ? "Submitted ✓" : "Pending"}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: submitted ? "rgba(48,164,108,0.15)" : tk.accentSoft }}>
              <i className={`${submitted ? "ri-checkbox-circle-fill" : "ri-time-line"} text-2xl`} style={{ color: submitted ? tk.success : tk.accentBorder }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Enrollment", value: student.studentId?.enrollment || "N/A", icon: "ri-hashtag" },
              { label: "Class", value: student.studentId?.classs || "N/A", icon: "ri-hotel-line" },
              { label: "Branch", value: student.studentId?.branch || "N/A", icon: "ri-git-branch-line" },
              { label: "Semester", value: student.studentId?.semester ? `Semester ${student.studentId.semester}` : "N/A", icon: "ri-calendar-event-line" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="border rounded-xl p-3.5" style={{ backgroundColor: tk.metaBg, borderColor: tk.cardBorder }}>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.05em] m-0 mb-1.5 flex items-center gap-1" style={{ color: tk.textMuted }}>
                  <i className={`${icon} text-[0.75rem]`} style={{ color: tk.accentBorder }} />{label}
                </p>
                <p className="text-[0.84rem] font-semibold m-0 truncate" style={{ color: tk.textPrimary }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 pt-5">
          {!submitted ? (
            <button
              onClick={() => onSubmit(student._id)}
              disabled={isLoading}
              className={`w-full py-3.5 px-4 border-none rounded-2xl text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 tracking-[0.02em] ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90 transition-opacity"}`}
              style={{ backgroundColor: tk.textPrimary, color: "#FFFFFF" }}
            >
              {isLoading ? <><Spinner /> Saving…</> : <><i className="ri-check-double-line text-base" />Mark as Submitted</>}
            </button>
          ) : (
            <button
              onClick={() => onUnsubmit(student._id)}
              disabled={isLoading}
              className={`w-full py-3.5 px-4 bg-transparent border-2 rounded-2xl text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-red-50 transition-colors"}`}
              style={{ borderColor: tk.accentBorder, color: tk.accentBorder }}
            >
              {isLoading ? <><Spinner /> Saving…</> : <><i className="ri-close-circle-line text-base" />Unmark Submitted</>}
            </button>
          )}
          <button onClick={onClose} className="w-full mt-2.5 py-3 px-4 border rounded-2xl text-[0.82rem] font-semibold cursor-pointer hover:bg-black/[0.04] transition-colors" style={{ backgroundColor: tk.metaBg, borderColor: tk.cardBorder, color: tk.textPrimary }}>
            Close
          </button>
        </div>
      </div>
    </>
  );
};

/* ════════════════════════════════
   DESKTOP STUDENT ROW
════════════════════════════════ */
const StudentRow = ({ item, idx, onSubmit, onUnsubmit, isSubmitting }) => {
  const [hovered, setHovered] = useState(false);
  const submitted = item.status === "submitted";
  return (
    <tr
      className="student-row border-b transition-colors duration-150"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        borderColor: tk.cardBorder,
        backgroundColor: hovered ? "rgba(212,163,115,0.04)" : "transparent", 
        animationDelay: `${idx * 0.04}s` 
      }}
    >
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={item.studentId?.name} />
          <span className="text-[0.82rem] font-semibold truncate" style={{ color: tk.textPrimary }}>{item.studentId?.name || "N/A"}</span>
        </div>
      </td>
      <td className="px-5 py-3">
        <span className="font-mono text-[0.72rem] font-semibold border px-2 py-0.5 rounded-md tracking-[0.03em]" style={{ backgroundColor: tk.metaBg, borderColor: tk.cardBorder, color: tk.textPrimary }}>
          {item.studentId?.enrollment || "—"}
        </span>
      </td>
      <td className="px-5 py-3 text-[0.78rem]" style={{ color: tk.textSecondary }}>{item.studentId?.classs || "—"}</td>
      <td className="px-5 py-3 text-[0.78rem] font-medium" style={{ color: tk.textPrimary }}>{item.studentId?.branch || "—"}</td>
      <td className="px-5 py-3 text-[0.78rem]" style={{ color: tk.textSecondary }}>{item.studentId?.semester ? `Sem ${item.studentId.semester}` : "—"}</td>
      <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
      <td className="px-5 py-3 text-right overflow-visible">
        {!submitted ? (
          <button
            onClick={() => onSubmit(item._id)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 border-none rounded-[9px] text-[0.72rem] font-bold cursor-pointer whitespace-nowrap tracking-[0.02em] hover:-translate-y-px active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            style={{ backgroundColor: tk.accent, color: tk.textPrimary }}
          >
            {isSubmitting ? <><Spinner />Saving…</> : <><i className="ri-check-line text-[0.85rem]" />Mark Submitted</>}
          </button>
        ) : (
          <button
            onClick={() => onUnsubmit(item._id)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 border rounded-[9px] text-[0.72rem] font-bold cursor-pointer whitespace-nowrap tracking-[0.02em] hover:-translate-y-px active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            style={{ backgroundColor: tk.metaBg, borderColor: tk.cardBorder, color: tk.textPrimary }}
          >
            {isSubmitting ? <><Spinner />Saving…</> : <><i className="ri-close-line text-[0.85rem]" />Unmark</>}
          </button>
        )}
      </td>
    </tr>
  );
};

export default StudentList;