import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/* ─── Google Fonts injection ─── */
if (!document.getElementById("edu-fonts")) {
  const link = document.createElement("link");
  link.id = "edu-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

/* ─── Global style injection ─── */
if (!document.getElementById("student-list-styles")) {
  const s = document.createElement("style");
  s.id = "student-list-styles";
  s.textContent = `
    html, body { overflow-x: hidden; }
    *, *::before, *::after { box-sizing: border-box; }
    @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
    @keyframes rowIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .student-row { animation: rowIn 0.35s ease both; }
    .mobile-card { animation: rowIn 0.3s ease both; }
    .submit-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .submit-btn:active { transform: scale(0.97); }
    .submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none !important; filter:none !important; }
    .back-btn:hover { background: rgba(15,15,20,0.07) !important; }
    .mobile-card-row:active { background: rgba(124,106,247,0.05) !important; }
    .search-input:focus { outline: none; border-color: rgba(124,106,247,0.5) !important; box-shadow: 0 0 0 3px rgba(124,106,247,0.10) !important; }
    .search-clear-btn:hover { background: rgba(15,15,20,0.10) !important; }
  `;
  document.head.appendChild(s);
}

/* ─── Breakpoint hook ─── */
const useIsMobile = () => {
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth <= 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
};

/* ─── Palette ─── */
const tk = {
  accent: "#7c6af7",
  accentHover: "#9480f9",
  accentSoft: "rgba(124,106,247,0.10)",
  accentBorder: "rgba(124,106,247,0.25)",
  canvas: "#f5f4f0",
  card: "#ffffff",
  cardBorder: "rgba(15,15,20,0.07)",
  textPrimary: "#12110f",
  textSecondary: "#6b6762",
  textMuted: "#aaa8a3",
  success: "#30a46c",
  successSoft: "rgba(48,164,108,0.09)",
  successBorder: "rgba(48,164,108,0.20)",
  warning: "#c07c1a",
  warningSoft: "rgba(192,124,26,0.09)",
  warningBorder: "rgba(192,124,26,0.20)",
  danger: "#e5484d",
  dangerSoft: "rgba(229,72,77,0.08)",
  dangerBorder: "rgba(229,72,77,0.20)",
  metaBg: "#f9f8f5",
  metaBorder: "rgba(15,15,20,0.06)",
  rowHover: "rgba(124,106,247,0.03)",
  divider: "rgba(15,15,20,0.06)",
};

/* ─── Avatar ─── */
const Avatar = ({ name, size = 34 }) => {
  const initials = (name || "?")
    .split(" ").slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "").join("");
  const hue = [...(name || "")].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue},40%,88%)`,
      border: `1.5px solid hsl(${hue},30%,78%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size < 36 ? "0.7rem" : "0.85rem",
      fontWeight: 700, color: `hsl(${hue},40%,30%)`,
      flexShrink: 0, letterSpacing: "0.03em",
    }}>
      {initials}
    </div>
  );
};

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => {
  const submitted = status === "submitted";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em",
      padding: "4px 10px", borderRadius: 999,
      background: submitted ? tk.successSoft : tk.warningSoft,
      color: submitted ? tk.success : tk.warning,
      border: `1px solid ${submitted ? tk.successBorder : tk.warningBorder}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: submitted ? tk.success : tk.warning, flexShrink: 0 }} />
      {submitted ? "Submitted" : "Pending"}
    </span>
  );
};

/* ─── Spinner ─── */
const Spinner = () => (
  <span style={{
    width: 11, height: 11,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff", borderRadius: "50%",
    animation: "shimmer 0.7s linear infinite",
    display: "inline-block",
  }} />
);

/* ─── Skeleton row (desktop) ─── */
const SkeletonRow = () => (
  <tr>
    {[44, 28, 16, 16, 14, 18, 14].map((w, i) => (
      <td key={i} style={{ padding: "14px 20px" }}>
        <div style={{ height: 12, width: `${w}%`, borderRadius: 6, background: "rgba(15,15,20,0.06)", animation: "shimmer 1.4s ease-in-out infinite" }} />
      </td>
    ))}
  </tr>
);

/* ─── Skeleton card (mobile) ─── */
const SkeletonCard = () => (
  <div style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(15,15,20,0.06)", flexShrink: 0, animation: "shimmer 1.4s ease-in-out infinite" }} />
    <div style={{ flex: 1 }}>
      <div style={{ height: 12, width: "55%", borderRadius: 6, background: "rgba(15,15,20,0.06)", marginBottom: 8, animation: "shimmer 1.4s ease-in-out infinite" }} />
      <div style={{ height: 10, width: "30%", borderRadius: 6, background: "rgba(15,15,20,0.06)", animation: "shimmer 1.4s ease-in-out infinite" }} />
    </div>
    <div style={{ width: 80, height: 32, borderRadius: 9, background: "rgba(15,15,20,0.06)", animation: "shimmer 1.4s ease-in-out infinite" }} />
  </div>
);

/* ─── Search Bar ─── */
const SearchBar = ({ value, onChange, isMobile, resultCount, totalCount }) => {
  const inputRef = useRef(null);
  const hasQuery = value.length > 0;

  return (
    <div style={{ marginBottom: isMobile ? 14 : 18 }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {/* Search icon */}
        <i
          className="ri-search-line"
          style={{
            position: "absolute", left: 14,
            fontSize: "1rem", color: hasQuery ? tk.accent : tk.textMuted,
            pointerEvents: "none", transition: "color 0.2s", zIndex: 1,
          }}
        />

        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="Search by name, enrollment, branch…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: isMobile ? "10px 40px 10px 40px" : "11px 44px 11px 40px",
            background: tk.card,
            border: `1.5px solid ${hasQuery ? tk.accentBorder : tk.cardBorder}`,
            borderRadius: 12,
            fontSize: "0.82rem",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            color: tk.textPrimary,
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: hasQuery ? `0 0 0 3px rgba(124,106,247,0.08)` : "0 1px 4px rgba(0,0,0,0.04)",
          }}
        />

        {/* Clear button */}
        {hasQuery && (
          <button
            className="search-clear-btn"
            onClick={() => { onChange(""); inputRef.current?.focus(); }}
            style={{
              position: "absolute", right: 10,
              width: 24, height: 24, borderRadius: "50%",
              background: "rgba(15,15,20,0.07)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: tk.textMuted, fontSize: "0.85rem",
              transition: "background 0.15s",
            }}
          >
            <i className="ri-close-line" />
          </button>
        )}
      </div>

      {/* Result count hint */}
      {hasQuery && (
        <p style={{
          margin: "7px 0 0 2px",
          fontSize: "0.68rem", fontWeight: 600,
          color: resultCount === 0 ? tk.danger : tk.accent,
          animation: "fadeIn 0.15s ease",
        }}>
          {resultCount === 0
            ? "No students match your search"
            : `${resultCount} of ${totalCount} student${resultCount !== 1 ? "s" : ""} match`}
        </p>
      )}
    </div>
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
  const [searchQuery, setSearchQuery] = useState("");   // ← NEW

  const location = useLocation();
  const navigate = useNavigate();
  const { semester, classs, branch } = location.state || {};
  const { assignmentId } = useParams();
  const isMobile = useIsMobile();

  const tableRef = useRef(null);
  const headerRef = useRef(null);

  /* ─── Filter logic ─── */
  const filteredStudents = searchQuery.trim()
    ? students.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
          item.studentId?.name?.toLowerCase().includes(q) ||
          item.studentId?.enrollment?.toLowerCase().includes(q) ||
          item.studentId?.branch?.toLowerCase().includes(q) ||
          item.studentId?.classs?.toLowerCase().includes(q) ||
          item.studentId?.semester?.toString().includes(q) ||
          item.status?.toLowerCase().includes(q)
        );
      })
    : students;

  /* ── Download CSV ── */
  const handleDownload = () => {
    if (!students.length) return;
    const headers = ["Name", "Enrollment", "Class", "Branch", "Semester", "Status"];
    const rows = students.map((item) => [
      item.studentId?.name || "",
      item.studentId?.enrollment || "",
      item.studentId?.classs || "",
      item.studentId?.branch || "",
      item.studentId?.semester || "",
      item.status || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `assignment_${assignmentId}_students.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* ── Fetch ── */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/submission/${assignmentId}`,
          { withCredentials: true }
        );
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

  /* ── Submit / Unsubmit ── */
  const handleSubmit = async (submissionId) => {
    setSubmittingId(submissionId);
    try {
      const { data } = await axios.put(
        `http://localhost:3000/api/submission/submit/${submissionId}`,
        {}, { withCredentials: true }
      );
      if (data.success) {
        setStudents((prev) =>
          prev.map((item) => item._id === submissionId ? { ...item, status: "submitted" } : item)
        );
        setSelectedStudent((prev) => prev && prev._id === submissionId ? { ...prev, status: "submitted" } : prev);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleUnsubmit = async (submissionId) => {
    setSubmittingId(submissionId);
    try {
      const { data } = await axios.put(
        `http://localhost:3000/api/submission/unsubmit/${submissionId}`,
        {}, { withCredentials: true }
      );
      if (data.success) {
        setStudents((prev) =>
          prev.map((item) => item._id === submissionId ? { ...item, status: "pending" } : item)
        );
        setSelectedStudent((prev) => prev && prev._id === submissionId ? { ...prev, status: "pending" } : prev);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmittingId(null);
    }
  };

  /* ── Stats (based on full list, not filtered) ── */
  const totalSubmitted = students.filter((s) => s.status === "submitted").length;
  const totalStudents = students.length;
  const pct = totalStudents ? Math.round((totalSubmitted / totalStudents) * 100) : 0;

  const openModal = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedStudent(null), 200);
  };

  /* ════════════ RENDER ════════════ */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: tk.canvas,
        fontFamily: "'DM Sans', sans-serif",
        color: tk.textPrimary,
        padding: isMobile ? "20px 14px 32px" : "44px 48px",
        overflowX: "hidden",
      }}
    >
      <div style={{ maxWidth: isMobile ? "100%" : 1100, margin: "0 auto", width: "100%" }}>

        {/* ── Back button ── */}
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: "0.75rem", fontWeight: 600, color: tk.textMuted,
            background: "transparent", border: `1px solid ${tk.cardBorder}`,
            borderRadius: 9, padding: "6px 14px", cursor: "pointer",
            marginBottom: isMobile ? 20 : 28, transition: "background 0.15s",
          }}
        >
          <i className="ri-arrow-left-s-line" style={{ fontSize: "1rem" }} />
          Back to Dashboard
        </button>

        {/* ── Page header ── */}
        <header
          ref={headerRef}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: isMobile ? 14 : 20,
            marginBottom: isMobile ? 18 : 28,
            paddingBottom: isMobile ? 18 : 24,
            borderBottom: `1px solid ${tk.divider}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: tk.accent, marginBottom: 6 }}>
              Assignment Submissions
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "1.55rem" : "2rem",
              fontWeight: 900, color: tk.textPrimary,
              letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0,
            }}>
              Student<span style={{ color: tk.accent }}> Records</span>
            </h1>
            {branch && (
              <p style={{ marginTop: 8, fontSize: "0.76rem", color: tk.textMuted, fontWeight: 400, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <i className="ri-git-branch-line" style={{ fontSize: "0.85rem" }} />{branch}
                <span style={{ color: tk.metaBorder }}>·</span>
                <i className="ri-hotel-line" style={{ fontSize: "0.85rem" }} />Class {classs}
                <span style={{ color: tk.metaBorder }}>·</span>
                <i className="ri-calendar-event-line" style={{ fontSize: "0.85rem" }} />Semester {semester}
              </p>
            )}
          </div>

          {/* Stat pills */}
          {!loading && totalStudents > 0 && (
            <div style={{ display: "flex", gap: isMobile ? 8 : 10, flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
              {[
                { label: "Total", val: totalStudents, color: tk.textPrimary, bg: tk.metaBg, border: tk.cardBorder },
                { label: "Submitted", val: totalSubmitted, color: tk.success, bg: tk.successSoft, border: tk.successBorder },
                { label: "Pending", val: totalStudents - totalSubmitted, color: tk.warning, bg: tk.warningSoft, border: tk.warningBorder },
              ].map(({ label, val, color, bg, border }) => (
                <div key={label} style={{
                  padding: isMobile ? "8px 14px" : "10px 18px",
                  background: bg, border: `1px solid ${border}`, borderRadius: 12,
                  textAlign: "center", flex: isMobile ? "1" : "0 0 auto",
                }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tk.textMuted, margin: "0 0 3px" }}>{label}</p>
                  <p style={{ fontSize: isMobile ? "1rem" : "1.2rem", fontWeight: 700, color, margin: 0, fontFamily: "'Playfair Display', serif" }}>{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Download button */}
          {!loading && students.length > 0 && (
            <button
              onClick={handleDownload}
              style={{
                padding: "10px 16px", background: tk.accent, color: "#fff",
                border: "none", borderRadius: 10, fontSize: "0.75rem", fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                width: isMobile ? "100%" : "auto", justifyContent: "center",
              }}
            >
              <i className="ri-download-2-line" />
              Download CSV
            </button>
          )}
        </header>

        {/* ── Progress bar ── */}
        {!loading && totalStudents > 0 && (
          <div style={{
            background: tk.card, border: `1px solid ${tk.cardBorder}`,
            borderRadius: 16, padding: isMobile ? "14px 16px" : "18px 22px",
            marginBottom: isMobile ? 16 : 20,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: tk.textMuted, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Completion
                </span>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: pct === 100 ? tk.success : tk.textPrimary }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: tk.metaBg, borderRadius: 99, overflow: "hidden", border: `1px solid ${tk.metaBorder}` }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: pct === 100 ? tk.success : `linear-gradient(90deg, ${tk.accent}, ${tk.accentHover})`,
                  borderRadius: 99, transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
              </div>
            </div>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: tk.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}>
              {totalSubmitted}/{totalStudents}
            </div>
          </div>
        )}

        {/* ════════════ SEARCH BAR ════════════ */}
        {!loading && students.length > 0 && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            isMobile={isMobile}
            resultCount={filteredStudents.length}
            totalCount={totalStudents}
          />
        )}

        {/* ════════════ CONTENT AREA ════════════ */}
        {loading ? (
          isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3,4,5].map((n) => <SkeletonCard key={n} />)}
            </div>
          ) : (
            <div style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 18, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${tk.divider}`, background: tk.metaBg }}>
                    {["Student","Enrollment","Class","Branch","Semester","Status","Action"].map((h) => (
                      <th key={h} style={{ padding: "12px 20px", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: tk.textMuted, textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{[1,2,3,4,5].map((n) => <SkeletonRow key={n} />)}</tbody>
              </table>
            </div>
          )
        ) : filteredStudents.length === 0 ? (
          /* Empty / no-results state */
          <div style={{ background: tk.card, border: `1.5px dashed rgba(15,15,20,0.10)`, borderRadius: 20, textAlign: "center", padding: "72px 32px" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: tk.accentSoft, border: `1px solid ${tk.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: tk.accent }}>
              <i className={searchQuery ? "ri-search-line" : "ri-user-search-line"} style={{ fontSize: "1.4rem" }} />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", fontWeight: 700, color: tk.textPrimary, marginBottom: 6 }}>
              {searchQuery ? "No results found" : "No student records"}
            </h3>
            <p style={{ fontSize: "0.78rem", color: tk.textMuted }}>
              {searchQuery
                ? `No students match "${searchQuery}". Try a different search.`
                : "No submissions have been recorded for this assignment yet."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  marginTop: 14, padding: "8px 18px",
                  background: tk.accentSoft, color: tk.accent,
                  border: `1px solid ${tk.accentBorder}`, borderRadius: 9,
                  fontSize: "0.76rem", fontWeight: 700, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                <i className="ri-close-line" /> Clear search
              </button>
            )}
          </div>
        ) : isMobile ? (
          /* ══ MOBILE CARD LIST ══ */
          <MobileCardList
            students={filteredStudents}
            submittingId={submittingId}
            onSubmit={handleSubmit}
            onUnsubmit={handleUnsubmit}
            onOpenModal={openModal}
          />
        ) : (
          /* ══ DESKTOP TABLE ══ */
          <div ref={tableRef} style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 760 }}>
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "19%" }} />
                </colgroup>
                <thead>
                  <tr style={{ background: tk.metaBg, borderBottom: `1px solid ${tk.divider}` }}>
                    {[
                      { label: "Student", icon: "ri-user-line" },
                      { label: "Enrollment", icon: "ri-hashtag" },
                      { label: "Class", icon: "ri-hotel-line" },
                      { label: "Branch", icon: "ri-git-branch-line" },
                      { label: "Semester", icon: "ri-calendar-event-line" },
                      { label: "Status", icon: "ri-checkbox-circle-line" },
                      { label: "Action", icon: null, align: "right" },
                    ].map(({ label, icon, align }) => (
                      <th key={label} style={{ padding: "12px 20px", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: tk.textMuted, textAlign: align || "left", whiteSpace: "nowrap" }}>
                        {icon && <i className={icon} style={{ fontSize: "0.82rem", marginRight: 5, verticalAlign: "-1px" }} />}
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((item, idx) => (
                    <StudentRow
                      key={item._id}
                      item={item}
                      idx={idx}
                      onSubmit={handleSubmit}
                      onUnsubmit={handleUnsubmit}
                      isSubmitting={submittingId === item._id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ borderTop: `1px solid ${tk.divider}`, padding: "10px 20px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
              <i className="ri-list-check" style={{ color: tk.textMuted, fontSize: "0.85rem" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: tk.textMuted }}>
                {searchQuery
                  ? `${filteredStudents.length} of ${students.length} records`
                  : `${students.length} records total`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ════════════ MOBILE DETAIL MODAL ════════════ */}
      {showModal && selectedStudent && (
        <MobileDetailModal
          student={selectedStudent}
          submittingId={submittingId}
          onSubmit={handleSubmit}
          onUnsubmit={handleUnsubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

/* ════════════════════════════════
   MOBILE CARD LIST
════════════════════════════════ */
const MobileCardList = ({ students, submittingId, onSubmit, onUnsubmit, onOpenModal }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8 }}>
        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: tk.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {students.length} students
        </span>
        <span style={{ fontSize: "0.65rem", color: tk.textMuted, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
          <i className="ri-information-line" style={{ fontSize: "0.8rem" }} />
          Tap name for full details
        </span>
      </div>

      {students.map((item, idx) => (
        <MobileStudentCard
          key={item._id}
          item={item}
          idx={idx}
          submittingId={submittingId}
          onSubmit={onSubmit}
          onUnsubmit={onUnsubmit}
          onOpenModal={onOpenModal}
        />
      ))}
    </div>
  );
};

/* ════════════════════════════════
   MOBILE STUDENT CARD
════════════════════════════════ */
const MobileStudentCard = ({ item, idx, submittingId, onSubmit, onUnsubmit, onOpenModal }) => {
  const submitted = item.status === "submitted";
  const isLoading = submittingId === item._id;

  return (
    <div
      className="mobile-card"
      style={{
        background: tk.card,
        border: `1.5px solid ${tk.cardBorder}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        animationDelay: `${idx * 0.035}s`,
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <button
          className="mobile-card-row"
          onClick={() => onOpenModal(item)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 14px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            minWidth: 0,
            transition: "background 0.15s",
            borderRadius: 0,
          }}
        >
          <Avatar name={item.studentId?.name} size={42} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              margin: 0,
              fontSize: "0.88rem",
              fontWeight: 700,
              color: tk.textPrimary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {item.studentId?.name || "N/A"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <StatusBadge status={item.status} />
            </div>
          </div>
          <i className="ri-arrow-right-s-line" style={{ fontSize: "1rem", color: tk.textMuted, flexShrink: 0, marginLeft: "auto" }} />
        </button>

        <div style={{ width: 1, height: 52, background: tk.divider, flexShrink: 0 }} />

        <div style={{ padding: "0 12px", flexShrink: 0 }}>
          {!submitted ? (
            <button
              className="submit-btn"
              onClick={() => onSubmit(item._id)}
              disabled={isLoading}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "8px 14px",
                background: tk.accentSoft,
                color: tk.accent,
                border: `1.5px solid ${tk.accentBorder}`,
                borderRadius: 10,
                fontSize: "0.72rem", fontWeight: 700, cursor: "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
            >
              {isLoading ? <><Spinner /> Saving…</> : <><i className="ri-check-line" style={{ fontSize: "0.9rem" }} />Submit</>}
            </button>
          ) : (
            <button
              className="submit-btn"
              onClick={() => onUnsubmit(item._id)}
              disabled={isLoading}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "8px 14px",
                background: tk.successSoft,
                color: tk.success,
                border: `1.5px solid ${tk.successBorder}`,
                borderRadius: 10,
                fontSize: "0.72rem", fontWeight: 700, cursor: "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
            >
              {isLoading ? <><Spinner /> Saving…</> : <><i className="ri-check-double-line" style={{ fontSize: "0.9rem" }} />Done</>}
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
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(10,10,16,0.55)",
          backdropFilter: "blur(4px)",
          zIndex: 998,
          animation: "fadeIn 0.2s ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 999,
          background: tk.card,
          borderRadius: "22px 22px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          padding: "0 0 calc(20px + env(safe-area-inset-bottom))",
          animation: "slideUp 0.3s cubic-bezier(0.34,1.3,0.64,1)",
          maxHeight: "88vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "rgba(15,15,20,0.12)" }} />
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 20px 16px",
          borderBottom: `1px solid ${tk.divider}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={student.studentId?.name} size={46} />
            <div>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: tk.textPrimary }}>
                {student.studentId?.name || "N/A"}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: tk.textMuted, fontWeight: 500 }}>
                Student Details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(15,15,20,0.06)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: tk.textSecondary, fontSize: "1.1rem",
            }}
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <div style={{ padding: "18px 20px 0", display: "grid", gap: 10 }}>
          <div style={{
            background: submitted ? tk.successSoft : tk.warningSoft,
            border: `1.5px solid ${submitted ? tk.successBorder : tk.warningBorder}`,
            borderRadius: 14, padding: "14px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: submitted ? tk.success : tk.warning, margin: "0 0 4px" }}>
                Submission Status
              </p>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: submitted ? tk.success : tk.warning }}>
                {submitted ? "Submitted ✓" : "Pending"}
              </p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: submitted ? "rgba(48,164,108,0.15)" : "rgba(192,124,26,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={submitted ? "ri-checkbox-circle-fill" : "ri-time-line"} style={{ fontSize: "1.3rem", color: submitted ? tk.success : tk.warning }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Enrollment", value: student.studentId?.enrollment || "N/A", icon: "ri-hashtag" },
              { label: "Class", value: student.studentId?.classs || "N/A", icon: "ri-hotel-line" },
              { label: "Branch", value: student.studentId?.branch || "N/A", icon: "ri-git-branch-line" },
              { label: "Semester", value: student.studentId?.semester ? `Semester ${student.studentId.semester}` : "N/A", icon: "ri-calendar-event-line" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                background: tk.metaBg, border: `1px solid ${tk.metaBorder}`,
                borderRadius: 12, padding: "12px 14px",
              }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", color: tk.textMuted, letterSpacing: "0.05em", margin: "0 0 5px", display: "flex", alignItems: "center", gap: 5 }}>
                  <i className={icon} style={{ fontSize: "0.75rem", color: tk.accent }} />
                  {label}
                </p>
                <p style={{ fontSize: "0.84rem", fontWeight: 600, color: tk.textPrimary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "18px 20px 0" }}>
          {!submitted ? (
            <button
              onClick={() => onSubmit(student._id)}
              disabled={isLoading}
              style={{
                width: "100%", padding: "14px 16px",
                background: tk.accent, color: "#fff",
                border: "none", borderRadius: 14,
                fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s", opacity: isLoading ? 0.7 : 1,
                letterSpacing: "0.02em",
              }}
            >
              {isLoading ? <><Spinner /> Saving…</> : <><i className="ri-check-double-line" style={{ fontSize: "1rem" }} />Mark as Submitted</>}
            </button>
          ) : (
            <button
              onClick={() => onUnsubmit(student._id)}
              disabled={isLoading}
              style={{
                width: "100%", padding: "14px 16px",
                background: "transparent", color: tk.danger,
                border: `1.5px solid ${tk.dangerBorder}`, borderRadius: 14,
                fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s", opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? <><Spinner /> Saving…</> : <><i className="ri-close-circle-line" style={{ fontSize: "1rem" }} />Unmark Submitted</>}
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              width: "100%", marginTop: 10, padding: "12px 16px",
              background: "rgba(15,15,20,0.04)", color: tk.textMuted,
              border: `1px solid ${tk.cardBorder}`, borderRadius: 14,
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
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

  const cellStyle = {
    padding: "13px 20px", fontSize: "0.78rem", color: tk.textSecondary,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", verticalAlign: "middle",
  };

  return (
    <tr
      className="student-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: `1px solid ${tk.divider}`,
        background: hovered ? tk.rowHover : "transparent",
        transition: "background 0.15s",
        animationDelay: `${idx * 0.04}s`,
      }}
    >
      <td style={{ ...cellStyle, padding: "11px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={item.studentId?.name} />
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: tk.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.studentId?.name || "N/A"}
          </span>
        </div>
      </td>
      <td style={cellStyle}>
        <span style={{ fontFamily: "'DM Sans', monospace", fontSize: "0.72rem", fontWeight: 600, color: tk.textMuted, background: tk.metaBg, border: `1px solid ${tk.metaBorder}`, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.03em" }}>
          {item.studentId?.enrollment || "—"}
        </span>
      </td>
      <td style={cellStyle}>{item.studentId?.classs || "—"}</td>
      <td style={{ ...cellStyle, fontWeight: 500, color: tk.textPrimary }}>{item.studentId?.branch || "—"}</td>
      <td style={cellStyle}>{item.studentId?.semester ? `Sem ${item.studentId.semester}` : "—"}</td>
      <td style={cellStyle}><StatusBadge status={item.status} /></td>
      <td style={{ ...cellStyle, textAlign: "right", overflow: "visible" }}>
        {!submitted ? (
          <button
            className="submit-btn"
            onClick={() => onSubmit(item._id)}
            disabled={isSubmitting}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 16px", background: tk.accent, color: "#fff",
              border: "none", borderRadius: 9, fontSize: "0.72rem", fontWeight: 700,
              cursor: "pointer", transition: "background 0.2s, transform 0.15s",
              letterSpacing: "0.02em", whiteSpace: "nowrap",
            }}
          >
            {isSubmitting ? <><Spinner />Saving…</> : <><i className="ri-check-line" style={{ fontSize: "0.85rem" }} />Mark Submitted</>}
          </button>
        ) : (
          <button
            className="submit-btn"
            onClick={() => onUnsubmit(item._id)}
            disabled={isSubmitting}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 16px", background: tk.danger, color: "#fff",
              border: "none", borderRadius: 9, fontSize: "0.72rem", fontWeight: 700,
              cursor: "pointer", transition: "background 0.2s, transform 0.15s",
              letterSpacing: "0.02em", whiteSpace: "nowrap",
            }}
          >
            {isSubmitting ? <><Spinner />Saving…</> : <><i className="ri-close-line" style={{ fontSize: "0.85rem" }} />Unmark</>}
          </button>
        )}
      </td>
    </tr>
  );
};

export default StudentList;