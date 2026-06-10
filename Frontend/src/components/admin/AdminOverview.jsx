import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { tk } from "../../constants/adminTheme";

const StatCard = ({ label, value, icon, color = tk.accent, bg = tk.accentSoft }) => (
  <div
    style={{
      background: tk.card,
      border: `1px solid ${tk.cardBorder}`,
      borderRadius: 14,
      padding: "20px 22px",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    }}
  >
    <div>
      <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, color: tk.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: "1.8rem", fontWeight: 800, color: tk.textPrimary, lineHeight: 1 }}>
        {value ?? "—"}
      </p>
    </div>
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <i className={icon} style={{ fontSize: "1.2rem" }} />
    </div>
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/admin/stats");
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p style={{ color: tk.textMuted }}>Loading dashboard stats...</p>;
  }

  const cards = [
    { label: "Active Students", value: stats?.activeStudents, icon: "ri-graduation-cap-line", color: tk.accent, bg: tk.accentSoft },
    { label: "Graduated", value: stats?.graduatedStudents, icon: "ri-award-line", color: tk.warning, bg: tk.warningSoft },
    { label: "Total Students", value: stats?.totalStudents, icon: "ri-group-line", color: tk.textSecondary, bg: "#f3f2ef" },
    // { label: "Faculty Users", value: stats?.totalFaculty, icon: "ri-user-star-line", color: tk.success, bg: tk.successSoft },
    // { label: "Admin Users", value: stats?.totalAdmins, icon: "ri-shield-user-line", color: tk.warning, bg: tk.warningSoft },
    { label: "Assignments", value: stats?.totalAssignments, icon: "ri-book-2-line", color: "#3b82f6", bg: "rgba(59,130,246,0.10)" },
    { label: "Submissions", value: stats?.totalSubmissions, icon: "ri-file-list-3-line", color: "#8b5cf6", bg: "rgba(139,92,246,0.10)" },
    // { label: "Submitted", value: stats?.submittedCount, icon: "ri-checkbox-circle-line", color: tk.success, bg: tk.successSoft },
    // { label: "Pending", value: stats?.pendingCount, icon: "ri-time-line", color: tk.danger, bg: tk.dangerSoft },
    { label: "Total Users", value: stats?.totalUsers, icon: "ri-group-line", color: tk.textSecondary, bg: "#f3f2ef" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: tk.textPrimary }}>
          System Overview
        </h2>
        <p style={{ margin: "6px 0 0", color: tk.textSecondary, fontSize: "0.88rem" }}>
          Real-time snapshot of students, faculty, assignments, and submissions.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
