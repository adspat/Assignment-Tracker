import React, { useEffect, useState, useMemo, useRef,useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
/* ─── Google Fonts injection ─── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap";
document.head.appendChild(fontLink);

/* ─── Palette tokens ─── */
const tk = {
  sidebar: "#0f0f14",
  sidebarBorder: "#1e1e2a",
  accent: "#7c6af7",
  accentHover: "#9480f9",
  accentSoft: "rgba(124,106,247,0.12)",
  accentBorder: "rgba(124,106,247,0.25)",
  canvas: "#f5f4f0",
  card: "#ffffff",
  cardBorder: "rgba(15,15,20,0.07)",
  cardHoverBorder: "rgba(124,106,247,0.35)",
  textPrimary: "#12110f",
  textSecondary: "#6b6762",
  textMuted: "#aaa8a3",
  danger: "#e5484d",
  dangerSoft: "rgba(229,72,77,0.08)",
  success: "#30a46c",
  successSoft: "rgba(48,164,108,0.10)",
  tagBg: "rgba(124,106,247,0.08)",
  metaBg: "#f9f8f5",
  metaBorder: "rgba(15,15,20,0.06)",
};

/* ─── Shared select style ─── */
const inputBase = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.72rem",
  fontWeight: 600,
  color: tk.textPrimary,
  background: "#fff",
  border: `1.5px solid ${tk.cardBorder}`,
  borderRadius: "10px",
  padding: "8px 36px 8px 12px",
  outline: "none",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  transition: "border-color 0.2s",
  width: "100%",
};

/* ─── Utility: badge pill ─── */
const Pill = ({ icon, label, color = tk.accent, bg = tk.accentSoft }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: "0.68rem",
      fontWeight: 700,
      color,
      background: bg,
      border: `1px solid ${color}22`,
      borderRadius: 999,
      padding: "3px 10px 3px 8px",
      letterSpacing: "0.01em",
      lineHeight: 1,
    }}
  >
    <i className={icon} style={{ fontSize: "0.78rem" }} />
    {label}
  </span>
);

/* ─── Meta row item ─── */
const MetaItem = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
    <i
      className={icon}
      style={{ color: tk.textMuted, fontSize: "0.85rem", flexShrink: 0 }}
    />
    <span
      style={{
        fontSize: "0.68rem",
        fontWeight: 500,
        color: tk.textMuted,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 700,
        color: tk.textPrimary,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value || "—"}
    </span>
  </div>
);

/* ─── Filter Select ─── */
const FilterSelect = ({ label, value, onChange, children }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 148,
      }}
    >
      <label
        style={{
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: tk.textMuted,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputBase,
            borderColor: focused ? tk.accent : tk.cardBorder,
            boxShadow: focused
              ? `0 0 0 3px ${tk.accentSoft}`
              : inputBase.boxShadow,
          }}
        >
          {children}
        </select>
        <i
          className="ri-arrow-down-s-line"
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: tk.textMuted,
            pointerEvents: "none",
            fontSize: "1rem",
          }}
        />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════ */
const Dashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSession, setSelectedSession] = useState("ALL");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  

  const navigate = useNavigate();

  const containerRef = useRef(null);
  const modalOverlayRef = useRef(null);
  const modalBoxRef = useRef(null);
  const headerRef = useRef(null);
  const sidebarRef = useRef(null);

  /* ── Fetch ── */
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get("http://localhost:3000/api/assignment", {
        withCredentials: true,
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (Array.isArray(data)) setAssignments(data);
      else if (data && Array.isArray(data.assignments))
        setAssignments(data.assignments);
      else if (data && Array.isArray(data.data)) setAssignments(data.data);
      else setAssignments([]);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  /* ── Page entrance ── */
  useEffect(() => {
    if (!loading) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
      );
      gsap.fromTo(
        headerRef.current,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.1 },
      );
    }
  }, [loading]);

  /* ── Card stagger ── */
  useEffect(() => {
    if (!loading && assignments.length > 0) {
      gsap.fromTo(
        ".dash-card",
        { y: 28, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.45,
          stagger: 0.07,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    }
  }, [loading, selectedSession, selectedSemester, selectedClass, assignments]);

  /* ── Close menu outside ── */
  useEffect(() => {
    const h = () => setOpenMenuId(null);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  /* ── Modal animation ── */
  useEffect(() => {
    if (showModal) {
      gsap.fromTo(
        modalOverlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.22 },
      );
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.93, y: 20, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.32, ease: "power3.out" },
      );
    }
  }, [showModal]);

  /* ── Derived filter options ── */
  const { sessions, semesters, classes } = useMemo(() => {
    const sessSet = new Set(),
      semSet = new Set(),
      classSet = new Set();
    assignments.forEach((a) => {
      if (a.session) sessSet.add(a.session);
      if (a.semester != null) semSet.add(a.semester);
      if (a.classs) classSet.add(a.classs);
    });
    return {
      sessions: Array.from(sessSet).sort(),
      semesters: Array.from(semSet).sort((a, b) => a - b),
      classes: Array.from(classSet).sort(),
    };
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchSession =
        selectedSession === "ALL" || a.session === selectedSession;
      const matchSemester =
        selectedSemester === "ALL" ||
        Number(a.semester) === Number(selectedSemester);
      const matchClass = selectedClass === "ALL" || a.classs === selectedClass;
      return matchSession && matchSemester && matchClass;
    });
  }, [assignments, selectedSession, selectedSemester, selectedClass]);

  /* ── Handlers (unchanged logic) ── */
  const { setIsLoggedIN,user, getUserData } = useContext(AppContent);
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { data } = await axios.post(
        "http://localhost:3000/auth/logout",
        {},
        { withCredentials: true },
      );
      if (data.success) {
        toast.success("Logout Success");
        setIsLoggedIN(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setIsLoggingOut(false);
      
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment? This action cannot be undone.",
    );
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(
        `http://localhost:3000/api/assignment/${assignmentId}`,
        {
          withCredentials: true,
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        },
      );
      setAssignments(assignments.filter((a) => a._id !== assignmentId));
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Failed to delete assignment");
    }
  };

  const handleEditAssignment = (assignment) => {
    setOpenMenuId(null);
    navigate(`/edit-assignment/${assignment._id}`, { state: { assignment } });
  };

  const handleCardClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowModal(true);
  };

  const handleShowAllStudents = () => {
    if (selectedAssignment) {
      navigate(`/dashboard/${selectedAssignment._id}`, {
        state: {
          semester: selectedAssignment.semester,
          classs: selectedAssignment.classs,
          branch: selectedAssignment.branch,
        },
      });
      setShowModal(false);
    }
  };

  const handleAddStudentManually = () => {
    if (selectedAssignment) {
      alert(`Add student manually for assignment: ${selectedAssignment.title}`);
      setShowModal(false);
    }
  };

  const closeModal = () => {
    gsap.to(modalBoxRef.current, {
      scale: 0.94,
      opacity: 0,
      y: 12,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        gsap.to(modalOverlayRef.current, {
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            setShowModal(false);
            setSelectedAssignment(null);
          },
        });
      },
    });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: tk.canvas,
          fontFamily: "'DM Sans', sans-serif",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: `3px solid rgba(124,106,247,0.2)`,
            borderTopColor: tk.accent,
            animation: "spin 0.75s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p
          style={{
            color: tk.textMuted,
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          Loading assignments…
        </p>
      </div>
    );
  }

  /* ════════════════════════════════ RENDER ════════════════════════════════ */
  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        background: tk.canvas,
        color: tk.textPrimary,
      }}
    >
      {/* ══ SIDEBAR ══ */}
      <aside
        ref={sidebarRef}
        style={{
          width: 260,
          background: tk.sidebar,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "28px 20px",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 10,
          borderRight: `1px solid ${tk.sidebarBorder}`,
        }}
      >
        {/* Logo */}
        <div>
          {/* Nav */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 12,
                background: tk.accentSoft,
                border: `1px solid ${tk.accentBorder}`,
                color: tk.accent,
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <i className="ri-dashboard-3-line" style={{ fontSize: "1rem" }} />
              Dashboard
            </div>
          </nav>

          {/* Stats strip */}
          <div
            style={{
              marginTop: 28,
              padding: "14px 16px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)",
                marginBottom: 12,
              }}
            >
              Overview
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  icon: "ri-file-list-3-line",
                  label: "Total Assignments",
                  val: assignments.length,
                },
                {
                  icon: "ri-filter-3-line",
                  label: "Filtered View",
                  val: filteredAssignments.length,
                },
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <i
                      className={icon}
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "0.85rem",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.4)",
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#fff",
                      background: "rgba(255,255,255,0.07)",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Add + Profile */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => navigate("/addAssignment")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "11px 0",
              background: tk.accent,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.2s, transform 0.15s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = tk.accentHover;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = tk.accent;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <i className="ri-add-circle-line" style={{ fontSize: "1rem" }} />
            New Assignment
          </button>

          <div
            onClick={() => navigate("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              cursor : 'pointer',
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              gap: 8,
            }}
          >
            <div
              
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                minWidth: 0,
              }}
            >
             
              
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.name}
                </p>
                <p
                  style={{
                    fontSize: "0.62rem",
                    color: "rgba(255,255,255,0.35)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Faculty
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              title="Sign Out"
              style={{
                padding: "7px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 9,
                color: "rgba(255,255,255,0.35)",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(229,72,77,0.15)";
                e.currentTarget.style.color = tk.danger;
                e.currentTarget.style.borderColor = "rgba(229,72,77,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <i
                className="ri-logout-box-r-line"
                style={{ fontSize: "1rem" }}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main
        style={{
          flex: 1,
          marginLeft: 260,
          padding: "40px 48px",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <header
          ref={headerRef}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 24,
            paddingBottom: 28,
            marginBottom: 28,
            borderBottom: `1px solid rgba(15,15,20,0.08)`,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2rem",
                fontWeight: 900,
                color: tk.textPrimary,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Assignments
              <span style={{ color: tk.accent }}> Overview</span>
            </h1>
            <p
              style={{
                marginTop: 6,
                fontSize: "0.78rem",
                color: tk.textMuted,
                fontWeight: 400,
              }}
            >
              Manage and track evaluation courses across sessions
            </p>
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: 14,
            }}
          >
            <FilterSelect
              label="Academic Session"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              <option value="ALL">All Sessions</option>
              {sessions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Semester Term"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="ALL">All Semesters</option>
              {semesters.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Assigned Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="ALL">All Classes</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </FilterSelect>
          </div>
        </header>

        {/* Count strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: tk.textMuted,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <i className="ri-list-check" style={{ color: tk.textMuted }} />
            Showing{" "}
            <strong style={{ color: tk.textPrimary }}>
              {filteredAssignments.length}
            </strong>
            &nbsp;of&nbsp;
            <strong style={{ color: tk.textPrimary }}>
              {assignments.length}
            </strong>
            &nbsp;assignments
          </span>
          {(selectedSession !== "ALL" ||
            selectedSemester !== "ALL" ||
            selectedClass !== "ALL") && (
            <button
              onClick={() => {
                setSelectedSession("ALL");
                setSelectedSemester("ALL");
                setSelectedClass("ALL");
              }}
              style={{
                marginLeft: 4,
                fontSize: "0.68rem",
                fontWeight: 700,
                color: tk.accent,
                background: tk.accentSoft,
                border: `1px solid ${tk.accentBorder}`,
                borderRadius: 6,
                padding: "3px 10px",
                cursor: "pointer",
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Empty state */}
        {filteredAssignments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "72px 32px",
              background: "#fff",
              border: `1.5px dashed rgba(15,15,20,0.1)`,
              borderRadius: 20,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: tk.tagBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                color: tk.accent,
                border: `1px solid ${tk.accentBorder}`,
              }}
            >
              <i
                className="ri-search-eye-line"
                style={{ fontSize: "1.35rem" }}
              />
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: tk.textPrimary,
                marginBottom: 6,
              }}
            >
              No assignments found
            </h3>
            <p style={{ fontSize: "0.78rem", color: tk.textMuted }}>
              Try adjusting or clearing the active filters above.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {filteredAssignments.map((a) => (
              <AssignmentCard
                key={a._id}
                assignment={a}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onCardClick={handleCardClick}
                onEdit={handleEditAssignment}
                onDelete={handleDeleteAssignment}
              />
            ))}
          </div>
        )}
      </main>

      {/* ══ LOGOUT CONFIRMATION MODAL ══ */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,10,16,0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)",
              maxWidth: 360,
              width: "100%",
              padding: "32px 28px",
              position: "relative",
            }}
          >
            {/* Close X */}
            <button
              onClick={() => setShowLogoutConfirm(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(15,15,20,0.05)",
                border: "none",
                color: tk.textMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              <i className="ri-close-line" />
            </button>

            {/* Icon header with danger color */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(229,72,77,0.10)",
                  border: `1.5px solid ${tk.danger}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: tk.danger,
                }}
              >
                <i className="ri-logout-box-r-line" style={{ fontSize: "1.6rem" }} />
              </div>

              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: tk.textPrimary,
                  margin: "0 0 8px",
                }}
              >
                Sign Out?
              </h2>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: tk.textSecondary,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Are you sure you want to sign out? You'll need to log in again to continue.
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: tk.metaBg,
                  border: `1.5px solid ${tk.cardBorder}`,
                  borderRadius: 11,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: tk.textPrimary,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(15,15,20,0.03)";
                  e.currentTarget.style.borderColor = tk.cardBorder;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = tk.metaBg;
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                disabled={isLoggingOut}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: tk.danger,
                  border: `1.5px solid ${tk.danger}`,
                  borderRadius: 11,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#fff",
                  cursor: isLoggingOut ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: isLoggingOut ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoggingOut) {
                    e.currentTarget.style.background = "#d73a40";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = tk.danger;
                }}
              >
                {isLoggingOut ? "Logging out…" : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL ══ */}
      {showModal && selectedAssignment && (
        <div
          ref={modalOverlayRef}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,10,16,0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
        >
          <div
            ref={modalBoxRef}
            style={{
              background: "#fff",
              borderRadius: 22,
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)",
              maxWidth: 380,
              width: "100%",
              padding: "32px 28px",
              position: "relative",
            }}
          >
            {/* Close X */}
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(15,15,20,0.05)",
                border: "none",
                color: tk.textMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              <i className="ri-close-line" />
            </button>

            {/* Icon header */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: tk.accentSoft,
                  border: `1px solid ${tk.accentBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  color: tk.accent,
                }}
              >
                <i
                  className="ri-folder-open-line"
                  style={{ fontSize: "1.35rem" }}
                />
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: tk.textPrimary,
                  marginBottom: 4,
                  padding: "0 20px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedAssignment.title}
              </h2>
              <p
                style={{
                  fontSize: "0.73rem",
                  color: tk.textMuted,
                  fontWeight: 400,
                }}
              >
                Choose an action for this assignment
              </p>
            </div>

            {/* Subject pill */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 22,
              }}
            >
              <Pill
                icon="ri-bookmark-3-line"
                label={selectedAssignment.subject}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={handleShowAllStudents}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px 16px",
                  background: tk.accent,
                  color: "#fff",
                  border: "none",
                  borderRadius: 13,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s, transform 0.15s",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = tk.accentHover;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = tk.accent;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <i className="ri-group-line" style={{ fontSize: "1rem" }} />
                Show Enrolled Students
              </button>
              <button
                onClick={handleAddStudentManually}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px 16px",
                  background: tk.successSoft,
                  color: tk.success,
                  border: `1.5px solid rgba(48,164,108,0.2)`,
                  borderRadius: 13,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(48,164,108,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = tk.successSoft;
                }}
              >
                <i className="ri-user-add-line" style={{ fontSize: "1rem" }} />
                Manual Entry
              </button>
              <button
                onClick={closeModal}
                style={{
                  padding: "11px 16px",
                  background: "rgba(15,15,20,0.04)",
                  border: `1.5px solid rgba(15,15,20,0.07)`,
                  borderRadius: 13,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: tk.textMuted,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(15,15,20,0.08)";
                  e.currentTarget.style.color = tk.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(15,15,20,0.04)";
                  e.currentTarget.style.color = tk.textMuted;
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════
   ASSIGNMENT CARD
════════════════════════════════ */
const AssignmentCard = ({
  assignment: a,
  openMenuId,
  setOpenMenuId,
  onCardClick,
  onEdit,
  onDelete,
}) => {
  const [hovered, setHovered] = useState(false);

  const deadline = new Date(a.submissionDate);
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;

  return (
    <div
      className="dash-card"
      onClick={() => onCardClick(a)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: tk.card,
        border: `1.5px solid ${hovered ? tk.cardHoverBorder : tk.cardBorder}`,
        borderRadius: 18,
        padding: "22px 22px 18px",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        boxShadow: hovered
          ? "0 12px 36px rgba(124,106,247,0.1), 0 2px 8px rgba(0,0,0,0.05)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: hovered ? tk.accent : tk.textPrimary,
            lineHeight: 1.35,
            margin: 0,
            transition: "color 0.2s",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {a.title}
        </h3>

        {/* Kebab menu */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === a._id ? null : a._id);
            }}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: openMenuId === a._id ? tk.accentSoft : "transparent",
              border: `1px solid ${openMenuId === a._id ? tk.accentBorder : "transparent"}`,
              color: openMenuId === a._id ? tk.accent : tk.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
              fontSize: "1rem",
            }}
            title="Actions"
          >
            <i className="ri-more-2-fill" />
          </button>

          {openMenuId === a._id && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 36,
                width: 148,
                background: "#fff",
                border: `1px solid rgba(15,15,20,0.09)`,
                borderRadius: 13,
                boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                zIndex: 20,
                overflow: "hidden",
                padding: "5px",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(a);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "9px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 9,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: tk.textPrimary,
                  cursor: "pointer",
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = tk.accentSoft;
                  e.currentTarget.style.color = tk.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = tk.textPrimary;
                }}
              >
                <i
                  className="ri-edit-line"
                  style={{ fontSize: "0.9rem", color: tk.textMuted }}
                />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(a._id);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "9px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 9,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: tk.danger,
                  cursor: "pointer",
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = tk.dangerSoft;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <i
                  className="ri-delete-bin-line"
                  style={{ fontSize: "0.9rem" }}
                />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subject tag */}
      <div style={{ marginBottom: 10 }}>
        <Pill icon="ri-bookmark-3-line" label={a.subject} />
      </div>

      {/* Description */}
      {a.description && (
        <p
          style={{
            fontSize: "0.76rem",
            color: tk.textSecondary,
            lineHeight: 1.6,
            marginBottom: 14,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontWeight: 400,
          }}
        >
          {a.description}
        </p>
      )}

      {/* Meta grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 12px",
          background: tk.metaBg,
          border: `1px solid ${tk.metaBorder}`,
          borderRadius: 12,
          padding: "12px 14px",
          marginTop: "auto",
          marginBottom: 14,
        }}
      >
        <MetaItem icon="ri-hotel-line" label="Class:" value={a.classs} />
        <MetaItem
          icon="ri-calendar-event-line"
          label="Sem:"
          value={a.semester}
        />
        <MetaItem icon="ri-git-branch-line" label="Branch:" value={a.branch} />
        <MetaItem icon="ri-timer-2-line" label="Sess:" value={a.session} />
      </div>

      {/* Deadline */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTop: `1px solid rgba(15,15,20,0.06)`,
        }}
      >
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 500,
            color: tk.textMuted,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <i
            className="ri-calendar-close-line"
            style={{ fontSize: "0.85rem" }}
          />
          Due date
        </span>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 7,
            background: isOverdue
              ? tk.dangerSoft
              : isUrgent
                ? "rgba(234,179,8,0.10)"
                : tk.metaBg,
            color: isOverdue
              ? tk.danger
              : isUrgent
                ? "#a16207"
                : tk.textPrimary,
            border: `1px solid ${isOverdue ? "rgba(229,72,77,0.15)" : isUrgent ? "rgba(234,179,8,0.2)" : tk.metaBorder}`,
          }}
        >
          {isOverdue
            ? `Overdue by ${Math.abs(daysLeft)}d`
            : deadline.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
