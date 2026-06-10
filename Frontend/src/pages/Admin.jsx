import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";
import { AppContent } from "../context/AppContext";
import { tk } from "../constants/adminTheme";
import AdminOverview from "../components/admin/AdminOverview";
import AdminStudents from "../components/admin/AdminStudents";
import AdminUsers from "../components/admin/AdminUsers";
import AdminAssignments from "../components/admin/AdminAssignments";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap";
if (!document.querySelector('link[href*="Playfair+Display"]')) {
  document.head.appendChild(fontLink);
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "ri-dashboard-line" },
  { id: "students", label: "Students", icon: "ri-graduation-cap-line" },
  { id: "users", label: "Users", icon: "ri-group-line" },
  { id: "assignments", label: "Assignments", icon: "ri-book-2-line" },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, setIsLoggedIN, setUser } = useContext(AppContent);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = "Admin Panel — AssiTrack";
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      setIsLoggedIN(false);
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "students":
        return <AdminStudents />;
      case "users":
        return <AdminUsers />;
      case "assignments":
        return <AdminAssignments />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: tk.canvas,
        fontFamily: "'DM Sans', sans-serif",
        color: tk.textPrimary,
      }}
    >
      {/* Sidebar — fixed on all screen sizes */}
      <aside
        className={`admin-sidebar${sidebarOpen ? " admin-sidebar--open" : ""}`}
        style={{
          background: tk.sidebar,
          borderRight: `1px solid ${tk.sidebarBorder}`,
        }}
      >
        <div className="admin-sidebar__inner">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: tk.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
              }}
            >
              A
            </div>
            <div>
              <p style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: "0.95rem" }}>AssiTrack</p>
              <p style={{ margin: 0, color: tk.textMuted, fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Admin Panel
              </p>
            </div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    background: isActive ? tk.accentSoft : "transparent",
                    color: isActive ? tk.accent : "#c8c6d0",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.85rem",
                    transition: "background 0.15s",
                  }}
                >
                  <i className={item.icon} style={{ fontSize: "1.05rem" }} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${tk.sidebarBorder}` }}>
            <p style={{ margin: "0 0 4px", color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>
              {user?.name || "Admin"}
            </p>
            <p style={{ margin: "0 0 16px", color: tk.textMuted, fontSize: "0.72rem" }}>{user?.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${tk.sidebarBorder}`,
                background: "transparent",
                color: "#e8e6ef",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <i className="ri-logout-box-r-line" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(245,244,240,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${tk.cardBorder}`,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="admin-menu-btn"
              style={{
                border: `1px solid ${tk.cardBorder}`,
                background: tk.card,
                borderRadius: 10,
                width: 38,
                height: 38,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="ri-menu-line" style={{ fontSize: "1.1rem" }} />
            </button>
            <div>
              <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, color: tk.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Administration
              </p>
              <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "1.2rem" }}>
                {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
              </h1>
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              background: tk.accentSoft,
              color: tk.accent,
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            <i className="ri-shield-keyhole-line" />
            Super Admin
          </div>
        </header>

        <main style={{ padding: "24px", maxWidth: 1280, margin: "0 auto" }}>
          {renderContent()}
        </main>
      </div>

      {/* Responsive sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 90,
          }}
          className="admin-overlay"
        />
      )}

      <style>{`
        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 260px;
          height: 100vh;
          height: 100dvh;
          z-index: 100;
          overflow-y: auto;
          overflow-x: hidden;
          transform: translateX(-100%);
          transition: transform 0.25s ease;
        }

        .admin-sidebar--open {
          transform: translateX(0);
        }

        .admin-sidebar__inner {
          padding: 24px 20px;
          min-height: 100%;
          display: flex;
          flex-direction: column;
        }

        .admin-sidebar__inner nav {
          flex: 1;
        }

        .admin-main {
          flex: 1;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          margin-left: 0;
        }

        @media (min-width: 1024px) {
          .admin-sidebar {
            transform: translateX(0);
          }

          .admin-main {
            margin-left: 260px;
            width: calc(100% - 260px);
          }

          .admin-menu-btn {
            display: none !important;
          }

          .admin-overlay {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Admin;
