import React, { useEffect, useState, useMemo, useRef, useContext } from "react";
import API from "../api/axios";
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

/* ─── Global overflow fix (injected once) ─── */
const overflowStyle = document.createElement("style");
overflowStyle.textContent = `
  html, body { overflow-x: hidden; max-width: 100%; }
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(overflowStyle);

/* ─── Responsive breakpoints ─── */
const useBreakpoint = () => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
};

/* ─── Palette tokens updated to the new theme ─── */
const tk = {
  sidebar: "#09050f",
  sidebarBorder: "#f76605",
  accent: "#34473c",
  accentHover: "#28382f",
  accentSoft: "rgba(52,71,60,0.10)",
  accentBorder: "#34473c",
  canvas: "#ffffff",
  card: "#ffffff",
  cardBorder: "rgba(247,102,5,0.20)",
  cardHoverBorder: "#f76605",
  textPrimary: "#09050f",
  textSecondary: "#34473c",
  textMuted: "#6b7f74",
  danger: "#e5484d",
  dangerSoft: "rgba(229,72,77,0.08)",
  success: "#30a46c",
  successSoft: "rgba(48,164,108,0.10)",
  tagBg: "rgba(52,71,60,0.08)",
  metaBg: "rgba(247,102,5,0.06)",
  metaBorder: "rgba(247,102,5,0.12)",
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
  boxSizing: "border-box",
};

/* ─── Utility: badge pill ─── */
const Pill = ({ icon, label, color = tk.textPrimary, bg = tk.accentSoft }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: "0.68rem",
      fontWeight: 700,
      color,
      background: bg,
      border: `1px solid ${tk.accent}55`,
      borderRadius: 999,
      padding: "3px 10px 3px 8px",
      letterSpacing: "0.01em",
      lineHeight: 1,
      maxWidth: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}
  >
    <i
      className={icon}
      style={{ fontSize: "0.78rem", flexShrink: 0, color: tk.textSecondary }}
    />
    {label}
  </span>
);

/* ─── Meta row item ─── */
const MetaItem = ({ icon, label, value }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      minWidth: 0,
      overflow: "hidden",
    }}
  >
    <i
      className={icon}
      style={{ color: tk.textMuted, fontSize: "0.85rem", flexShrink: 0 }}
    />
    <span
      style={{
        fontSize: "0.68rem",
        fontWeight: 500,
        color: tk.textSecondary,
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
        minWidth: 0,
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
        flex: "1 1 130px",
        minWidth: 0,
        maxWidth: "100%",
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
      <div style={{ position: "relative", minWidth: 0 }}>
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputBase,
            borderColor: focused ? tk.accentHover : tk.cardBorder,
            boxShadow: focused
              ? `0 0 0 3px ${tk.accent}33`
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

/* ─── Phone-only bottom navigation ─── */
const MobileBottomNav = ({
  filteredCount,
  onMenu,
  onAdd,
  onFilters,
}) => {
  const navItems = [
    {
      label: "Menu",
      icon: "ri-menu-4-line",
      onClick: onMenu,
    },
    {
      label: "New",
      icon: "ri-add-circle-fill",
      onClick: onAdd,
      featured: true,
    },
    {
      label: "Filters",
      icon: "ri-equalizer-3-line",
      onClick: onFilters,
      badge: filteredCount,
    },
  ];

  return (
    <nav
      aria-label="Dashboard mobile navigation"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: "max(12px, env(safe-area-inset-bottom))",
        zIndex: 18,
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 6,
        padding: "8px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.92)",
        border: `1px solid ${tk.cardBorder}`,
        boxShadow:
          "0 18px 48px rgba(74,68,58,0.18), 0 2px 10px rgba(74,68,58,0.08)",
        backdropFilter: "blur(14px)",
      }}
    >
      {navItems.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          aria-label={item.label}
          style={{
            minWidth: 0,
            height: 54,
            border: item.featured
              ? `1px solid ${tk.sidebarBorder}`
              : "1px solid transparent",
            borderRadius: 14,
            background: item.featured ? tk.textPrimary : "transparent",
            color: item.featured ? "#fff" : tk.textSecondary,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            WebkitTapHighlightColor: "transparent",
            position: "relative",
          }}
        >
          <i
            className={item.icon}
            style={{
              fontSize: item.featured ? "1.35rem" : "1.15rem",
              lineHeight: 1,
              color: item.featured ? "#fff" : tk.textPrimary,
            }}
          />
          <span
            style={{
              fontSize: "0.6rem",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "0.01em",
              color: item.featured ? "#fff" : tk.textSecondary,
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </span>
          {item.badge != null && (
            <span
              style={{
                position: "absolute",
                top: 7,
                right: 12,
                minWidth: 17,
                height: 17,
                padding: "0 5px",
                borderRadius: 999,
                background: tk.accentSoft,
                border: `1px solid ${tk.accent}`,
                color: tk.textPrimary,
                fontSize: "0.55rem",
                fontWeight: 800,
                lineHeight: "15px",
              }}
            >
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

/* ════════════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════════════ */
const Dashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState("ALL");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const filtersRef = useRef(null);

  /* ── Fetch ── */
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const { data } = await API.get("/api/assignment", {
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

  /* ── Close sidebar on desktop resize ── */
  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop]);

  /* ── Page entrance animation ── */
  useEffect(() => {
    if (!loading) {
      if (isDesktop && sidebarRef.current) {
        gsap.fromTo(
          sidebarRef.current,
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
        );
      }
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: -16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.1 },
        );
      }
    }
  }, [loading, isDesktop]);

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

  /* ── Close menu on outside click ── */
  useEffect(() => {
    const h = () => setOpenMenuId(null);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  /* ── Mobile sidebar GSAP animation ── */
  useEffect(() => {
    if (!isDesktop && sidebarOpen && sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { x: 200 },
        { x: 0, duration: 0.3},
      );
      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25 },
        );
      }
    }
  }, [sidebarOpen, isDesktop]);

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

  /* ── Handlers ── */
  const { setIsLoggedIN, user } = useContext(AppContent);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { data } = await API.post("/auth/logout", {});
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
      await API.delete(`/api/assignment/${assignmentId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
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
    navigate(`/dashboard/${assignment._id}`, {
      state: {
        semester: assignment.semester,
        classs: assignment.classs,
        branch: assignment.branch,
      },
    });
  };

  const closeSidebar = () => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        x: -280,
        duration: 0.25,
        ease: "power2.in",
      });
    }
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => setSidebarOpen(false),
      });
    } else {
      setSidebarOpen(false);
    }
  };

  const scrollToFilters = () => {
    filtersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── Loading state ── */
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
            border: `3px solid rgba(204,213,174,0.3)`,
            borderTopColor: tk.sidebarBorder,
            animation: "spin 0.75s linear infinite",
          }}
        />
        <p
          style={{
            color: tk.textSecondary,
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

  /* ── Sidebar inner content ── */
  const SidebarContent = () => (
    <>
      <div>
        {isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              marginBottom: 22,
            }}
          >
            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close sidebar"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "#fff",
                border: "1px solid rgba(255,255,255,0.85)",
                color: tk.textPrimary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(74,68,58,0.08)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <i className="ri-close-line" style={{ fontSize: "1.15rem" }} />
            </button>
          </div>
        )}

        <div
          style={{
            marginTop: isMobile ? 0 : 28,
            padding: "14px 16px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          <p
            style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: tk.textPrimary,
              opacity: 0.6,
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <i
                    className={icon}
                    style={{
                      color: tk.textSecondary,
                      opacity: 0.7,
                      fontSize: "0.85rem",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: tk.textPrimary,
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
                    color: tk.textPrimary,
                    background: "#fff",
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

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={() => {
            navigate("/addAssignment");
            if (!isDesktop) closeSidebar();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "11px 0",
            background: tk.sidebarBorder,
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
            e.currentTarget.style.background = "#2C2822";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = tk.sidebarBorder;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <i className="ri-add-circle-line" style={{ fontSize: "1rem" }} />
          New Assignment
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            cursor: "pointer",
            borderRadius: 12,
            background: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.6)",
            gap: 8,
          }}
        >
          <div
            onClick={() => {
              if (!isDesktop) closeSidebar();
            }}
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
                  color: tk.textPrimary,
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
                  color: tk.textSecondary,
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
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.8)",
              borderRadius: 9,
              color: tk.textSecondary,
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
              e.currentTarget.style.background = "rgba(255,255,255,0.6)";
              e.currentTarget.style.color = tk.textSecondary;
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)";
            }}
          >
            <i className="ri-logout-box-r-line" style={{ fontSize: "1rem" }} />
          </button>
        </div>
      </div>
    </>
  );

  /* ════════════════ RENDER ════════════════ */
  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        background: tk.canvas,
        color: tk.textPrimary,
        overflowX: "hidden",
        width: "100%",
        position: "relative",
      }}
    >
      {/* ══ MOBILE OVERLAY (behind sidebar drawer) ══ */}
      {!isDesktop && sidebarOpen && (
        <div
          ref={overlayRef}
          onClick={closeSidebar}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(74,68,58,0.4)",
            backdropFilter: "blur(3px)",
            zIndex: 19,
          }}
        />
      )}

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
          zIndex: 20,
          borderRight: `1px solid ${tk.sidebarBorder}`,
          overflowY: "auto",
          overflowX: "hidden",
          transform: isDesktop
            ? "translateX(0)"
            : sidebarOpen
              ? "translateX(0)"
              : "translateX(-280px)",
          transition: isDesktop ? "none" : "transform 0.3s ease",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <main
        style={{
          marginLeft: isDesktop ? 260 : 0,
          padding: isDesktop ? "40px 48px" : 0,
          minHeight: "100vh",
          width: isDesktop ? "calc(100% - 260px)" : "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
          boxSizing: "border-box",
          paddingBottom: isMobile ? 104 : !isDesktop ? 80 : undefined,
        }}
      >
        {/* ── MOBILE / TABLET TOP NAV BAR ── */}
        {!isDesktop && (
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 15,
              background: tk.canvas,
              borderBottom: `1px solid rgba(212,163,115,0.25)`,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: isMobile ? "center" : "space-between",
              backdropFilter: "blur(8px)",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#fff",
                border: `1.5px solid ${tk.cardBorder}`,
                color: tk.textPrimary,
                display: isMobile ? "none" : "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.1rem",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                flexShrink: 0,
              }}
            >
              <i className="ri-menu-line" />
            </button>

            <h1
              className="font-playfair text-[1.2rem]"
              style={{
                fontWeight: 900,
                color: tk.textPrimary,
                margin: "0 8px",
                letterSpacing: "-0.02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Assignments{" "}
              <span style={{ color: tk.sidebarBorder }}>Overview</span>
            </h1>

            <button
              onClick={() => navigate("/addAssignment")}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: tk.textPrimary,
                border: "none",
                color: "#fff",
                display: isMobile ? "none" : "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.1rem",
                flexShrink: 0,
              }}
            >
              <i className="ri-add-line" />
            </button>
          </div>
        )}

        {/* ── PAGE BODY ── */}
        <div
          style={{
            padding: isMobile ? "16px" : isTablet ? "20px 24px" : "0",
            width: "100%",
            boxSizing: "border-box",
            overflowX: "hidden",
          }}
        >
          {/* Desktop header */}
          {isDesktop && (
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
                borderBottom: `1px solid rgba(212,163,115,0.25)`,
              }}
            >
              <div>
                <h1
                  className="font-playfair "
                  style={{
                    fontSize: "2rem",
                    fontWeight: 900,
                    color: tk.textPrimary,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  Assignments{" "}
                  <span style={{ color: tk.sidebarBorder }}>Overview</span>
                </h1>
                <p
                  style={{
                    marginTop: 6,
                    fontSize: "0.78rem",
                    color: tk.textSecondary,
                    fontWeight: 400,
                  }}
                >
                  Manage and track evaluation courses across sessions
                </p>
              </div>

              {/* Desktop filters — inline with header */}
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
          )}

          {/* Mobile/tablet filters — stacked card */}
          {!isDesktop && (
            <div
              ref={filtersRef}
              style={{
                background: "#fff",
                border: `1.5px solid ${tk.cardBorder}`,
                borderRadius: 16,
                padding: "14px",
                marginBottom: 14,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <p
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: tk.textMuted,
                  marginBottom: 10,
                }}
              >
                Filters
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  width: "100%",
                }}
              >
                <FilterSelect
                  label="Session"
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
                  label="Semester"
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
                  label="Class"
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
            </div>
          )}

          {/* Count strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: tk.textSecondary,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="ri-list-check" />
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
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: tk.textPrimary,
                  background: tk.accentSoft,
                  border: `1px solid ${tk.accent}`,
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
                padding: "60px 24px",
                background: "#fff",
                border: `1.5px dashed ${tk.sidebarBorder}aa`,
                borderRadius: 20,
                width: "100%",
                boxSizing: "border-box",
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
                  color: tk.textPrimary,
                  border: `1px solid ${tk.accent}`,
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
              <p style={{ fontSize: "0.78rem", color: tk.textSecondary }}>
                Try adjusting or clearing the active filters above.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : isTablet
                    ? "repeat(auto-fill, minmax(260px, 1fr))"
                    : "repeat(auto-fill, minmax(300px, 1fr))",
                gap: isMobile ? 12 : 20,
                width: "100%",
                minWidth: 0,
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
        </div>
      </main>

      {isMobile && (
        <MobileBottomNav
          filteredCount={filteredAssignments.length}
          onMenu={() => setSidebarOpen(true)}
          onAdd={() => navigate("/addAssignment")}
          onFilters={scrollToFilters}
        />
      )}

      {/* ══ LOGOUT CONFIRMATION MODAL ══ */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(74,68,58,0.5)",
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
                "0 32px 80px rgba(74,68,58,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
              maxWidth: 360,
              width: "100%",
              padding: "32px 28px",
              position: "relative",
              boxSizing: "border-box",
            }}
          >
            <button
              onClick={() => setShowLogoutConfirm(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: tk.canvas,
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
                <i
                  className="ri-logout-box-r-line"
                  style={{ fontSize: "1.6rem" }}
                />
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
                Are you sure you want to sign out? You'll need to log in again
                to continue.
              </p>
            </div>

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
                  fontFamily: "'DM Sans', sans-serif",
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
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: isLoggingOut ? 0.7 : 1,
                }}
              >
                {isLoggingOut ? "Logging out…" : "Sign Out"}
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
        padding: "20px 20px 16px",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        boxShadow: hovered
          ? "0 12px 36px rgba(212,163,115,0.15), 0 2px 8px rgba(0,0,0,0.05)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        WebkitTapHighlightColor: "transparent",
        minWidth: 0,
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
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
          minWidth: 0,
        }}
      >
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: hovered ? tk.sidebarBorder : tk.textPrimary,
            lineHeight: 1.35,
            margin: 0,
            transition: "color 0.2s",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minWidth: 0,
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
              width: 34,
              height: 34,
              borderRadius: 8,
              background: openMenuId === a._id ? tk.accentSoft : "transparent",
              border: `1px solid ${openMenuId === a._id ? tk.accent : "transparent"}`,
              color: openMenuId === a._id ? tk.textPrimary : tk.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
              fontSize: "1rem",
            }}
          >
            <i className="ri-more-2-fill" />
          </button>

          {openMenuId === a._id && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 38,
                width: 148,
                background: "#fff",
                border: `1px solid ${tk.cardBorder}`,
                borderRadius: 13,
                boxShadow: "0 12px 32px rgba(74,68,58,0.12)",
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
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 9,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: tk.textPrimary,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = tk.accentSoft;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <i
                  className="ri-edit-line"
                  style={{ fontSize: "0.9rem", color: tk.textSecondary }}
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
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 9,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: tk.danger,
                  cursor: "pointer",
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
      <div style={{ marginBottom: 10, minWidth: 0, overflow: "hidden" }}>
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
          minWidth: 0,
          overflow: "hidden",
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
          borderTop: `1px solid ${tk.metaBorder}`,
          gap: 8,
          minWidth: 0,
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
            flexShrink: 0,
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
            whiteSpace: "nowrap",
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