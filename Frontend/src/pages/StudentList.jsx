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

/* ─── Shared palette (matches Dashboard) ─── */
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
  metaBg: "#f9f8f5",
  metaBorder: "rgba(15,15,20,0.06)",
  rowHover: "rgba(124,106,247,0.03)",
  divider: "rgba(15,15,20,0.06)",
};

/* ─── Avatar initials ─── */
const Avatar = ({ name }) => {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  const hue =
    [...(name || "")].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: `hsl(${hue},40%,88%)`,
        border: `1.5px solid hsl(${hue},30%,78%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.7rem",
        fontWeight: 700,
        color: `hsl(${hue},40%,30%)`,
        flexShrink: 0,
        letterSpacing: "0.03em",
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.04em",
        padding: "4px 10px",
        borderRadius: 999,
        background: submitted ? tk.successSoft : tk.warningSoft,
        color: submitted ? tk.success : tk.warning,
        border: `1px solid ${submitted ? tk.successBorder : tk.warningBorder}`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: submitted ? tk.success : tk.warning,
          flexShrink: 0,
        }}
      />
      {submitted ? "Submitted" : "Pending"}
    </span>
  );
};

/* ─── Skeleton row ─── */
const SkeletonRow = () => (
  <tr>
    {[44, 28, 16, 16, 14, 18, 14].map((w, i) => (
      <td key={i} style={{ padding: "14px 20px" }}>
        <div
          style={{
            height: 12,
            width: `${w}%`,
            borderRadius: 6,
            background: "rgba(15,15,20,0.06)",
            animation: "shimmer 1.4s ease-in-out infinite",
          }}
        />
      </td>
    ))}
  </tr>
);

/* ════════════════════════════════
   MAIN COMPONENT
════════════════════════════════ */
const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { semester, classs, branch } = location.state || {};
  const { assignmentId } = useParams();

  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const tableRef = useRef(null);

  // Function to handle download file
  const handleDownload = () => {
    if (!students.length) return;

    const headers = [
      "Name",
      "Enrollment",
      "Class",
      "Branch",
      "Semester",
      "Status",
    ];

    const rows = students.map((item) => [
      item.studentId?.name || "",
      item.studentId?.enrollment || "",
      item.studentId?.classs || "",
      item.studentId?.branch || "",
      item.studentId?.semester || "",
      item.status || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    // Excel-friendly BOM
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `assignment_${assignmentId}_students.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── Fetch ── (unchanged logic) */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/submission/${assignmentId}`,
          { withCredentials: true },
        );
        if (data.success) {
          const sortedData = [...data.data].sort((a, b) => {
            const nameA = a.studentId?.name?.toLowerCase() || "";
            const nameB = b.studentId?.name?.toLowerCase() || "";
            return nameA.localeCompare(nameB);
          });
          setStudents(sortedData);
        } else {
          console.log("Error in fetching the students data");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [assignmentId]);

  /* ── Submit handler ── (unchanged logic) */
  const handleSubmit = async (submissionId) => {
    setSubmittingId(submissionId);
    try {
      const { data } = await axios.put(
        `http://localhost:3000/api/submission/submit/${submissionId}`,
        {},
        { withCredentials: true },
      );
      if (data.success) {
        setStudents((prev) =>
          prev.map((item) =>
            item._id === submissionId ? { ...item, status: "submitted" } : item,
          ),
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmittingId(null);
    }
  };

  /* ── Unsubmit handler ── */
  const handleUnsubmit = async (submissionId) => {
    setSubmittingId(submissionId);
    try {
      const { data } = await axios.put(
        `http://localhost:3000/api/submission/unsubmit/${submissionId}`,
        {},
        { withCredentials: true },
      );
      if (data.success) {
        setStudents((prev) =>
          prev.map((item) =>
            item._id === submissionId ? { ...item, status: "pending" } : item,
          ),
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmittingId(null);
    }
  };

  /* ── Derived stats ── (unchanged logic) */
  const totalSubmitted = students.filter(
    (s) => s.status === "submitted",
  ).length;
  const totalStudents = students.length;
  const pct = totalStudents
    ? Math.round((totalSubmitted / totalStudents) * 100)
    : 0;

  /* ════════════ RENDER ════════════ */
  return (
    <div
      ref={pageRef}
      style={{
        minHeight: "100vh",
        background: tk.canvas,
        fontFamily: "'DM Sans', sans-serif",
        color: tk.textPrimary,
        padding: "44px 48px",
      }}
    >
      <style>{`
        @keyframes shimmer {
          0%,100% { opacity:.5 } 50% { opacity:1 }
        }
        @keyframes rowIn {
          from { opacity:0; transform: translateY(10px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .student-row {
          animation: rowIn 0.35s ease both;
        }
        .submit-btn:hover { background: ${tk.accentHover} !important; transform: translateY(-1px); }
        .submit-btn:active { transform: scale(0.97); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
        .back-btn:hover { background: rgba(15,15,20,0.07) !important; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* ── Back button ── */}
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: "0.75rem",
            fontWeight: 600,
            color: tk.textMuted,
            background: "transparent",
            border: `1px solid ${tk.cardBorder}`,
            borderRadius: 9,
            padding: "6px 14px",
            cursor: "pointer",
            marginBottom: 28,
            transition: "background 0.15s",
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
            gap: 20,
            marginBottom: 28,
            paddingBottom: 24,
            borderBottom: `1px solid ${tk.divider}`,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: tk.accent,
                marginBottom: 6,
              }}
            >
              Assignment Submissions
            </p>
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
              Student
              <span style={{ color: tk.accent }}> Records</span>
            </h1>
            {branch && (
              <p
                style={{
                  marginTop: 8,
                  fontSize: "0.78rem",
                  color: tk.textMuted,
                  fontWeight: 400,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <i
                  className="ri-git-branch-line"
                  style={{ fontSize: "0.85rem" }}
                />
                {branch}
                <span style={{ color: tk.metaBorder, userSelect: "none" }}>
                  ·
                </span>
                <i className="ri-hotel-line" style={{ fontSize: "0.85rem" }} />
                Class {classs}
                <span style={{ color: tk.metaBorder, userSelect: "none" }}>
                  ·
                </span>
                <i
                  className="ri-calendar-event-line"
                  style={{ fontSize: "0.85rem" }}
                />
                Semester {semester}
              </p>
            )}
          </div>

          {/* Stat pills */}
          {!loading && totalStudents > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                {
                  label: "Total",
                  val: totalStudents,
                  color: tk.textPrimary,
                  bg: tk.metaBg,
                },
                {
                  label: "Submitted",
                  val: totalSubmitted,
                  color: tk.success,
                  bg: tk.successSoft,
                  border: tk.successBorder,
                },
                {
                  label: "Pending",
                  val: totalStudents - totalSubmitted,
                  color: tk.warning,
                  bg: tk.warningSoft,
                  border: tk.warningBorder,
                },
              ].map(({ label, val, color, bg, border }) => (
                <div
                  key={label}
                  style={{
                    padding: "10px 18px",
                    background: bg,
                    border: `1px solid ${border || tk.cardBorder}`,
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: tk.textMuted,
                      margin: "0 0 3px",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color,
                      margin: 0,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {val}
                  </p>
                </div>
              ))}
            </div>
          )}
          {!loading && students.length > 0 && (
            <button
              onClick={handleDownload}
              style={{
                padding: "10px 16px",
                background: tk.accent,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: "fit-content",
              }}
            >
              <i className="ri-download-2-line" />
              Download Excel Sheet
            </button>
          )}
        </header>

        {/* ── Progress bar ── */}
        {!loading && totalStudents > 0 && (
          <div
            style={{
              background: tk.card,
              border: `1px solid ${tk.cardBorder}`,
              borderRadius: 16,
              padding: "18px 22px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: tk.textMuted,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Completion Progress
                </span>
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: pct === 100 ? tk.success : tk.textPrimary,
                  }}
                >
                  {pct}%
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: tk.metaBg,
                  borderRadius: 99,
                  overflow: "hidden",
                  border: `1px solid ${tk.metaBorder}`,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background:
                      pct === 100
                        ? tk.success
                        : `linear-gradient(90deg, ${tk.accent}, ${tk.accentHover})`,
                    borderRadius: 99,
                    transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: tk.textMuted,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {totalSubmitted} of {totalStudents} submitted
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          /* Skeleton */
          <div
            style={{
              background: tk.card,
              border: `1px solid ${tk.cardBorder}`,
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${tk.divider}`,
                    background: tk.metaBg,
                  }}
                >
                  {[
                    "Student",
                    "Enrollment",
                    "Class",
                    "Branch",
                    "Semester",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 20px",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: tk.textMuted,
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SkeletonRow key={n} />
                ))}
              </tbody>
            </table>
          </div>
        ) : students.length === 0 ? (
          /* Empty state */
          <div
            style={{
              background: tk.card,
              border: `1.5px dashed rgba(15,15,20,0.10)`,
              borderRadius: 20,
              textAlign: "center",
              padding: "72px 32px",
            }}
          >
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
                margin: "0 auto 16px",
                color: tk.accent,
              }}
            >
              <i
                className="ri-user-search-line"
                style={{ fontSize: "1.4rem" }}
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
              No student records
            </h3>
            <p style={{ fontSize: "0.78rem", color: tk.textMuted }}>
              No submissions have been recorded for this assignment yet.
            </p>
          </div>
        ) : (
          /* Table */
          <div
            ref={tableRef}
            style={{
              background: tk.card,
              border: `1px solid ${tk.cardBorder}`,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                  minWidth: 760,
                }}
              >
                {/* Colgroup for column widths */}
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
                  <tr
                    style={{
                      background: tk.metaBg,
                      borderBottom: `1px solid ${tk.divider}`,
                    }}
                  >
                    {[
                      { label: "Student", icon: "ri-user-line" },
                      { label: "Enrollment", icon: "ri-hashtag" },
                      { label: "Class", icon: "ri-hotel-line" },
                      { label: "Branch", icon: "ri-git-branch-line" },
                      { label: "Semester", icon: "ri-calendar-event-line" },
                      { label: "Status", icon: "ri-checkbox-circle-line" },
                      { label: "Action", icon: null, align: "right" },
                    ].map(({ label, icon, align }) => (
                      <th
                        key={label}
                        style={{
                          padding: "12px 20px",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          letterSpacing: "0.09em",
                          textTransform: "uppercase",
                          color: tk.textMuted,
                          textAlign: align || "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {icon && (
                          <i
                            className={icon}
                            style={{
                              fontSize: "0.82rem",
                              marginRight: 5,
                              verticalAlign: "-1px",
                            }}
                          />
                        )}
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {students.map((item, idx) => (
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

            {/* Table footer */}
            <div
              style={{
                borderTop: `1px solid ${tk.divider}`,
                padding: "10px 20px",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i
                className="ri-list-check"
                style={{ color: tk.textMuted, fontSize: "0.85rem" }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: tk.textMuted,
                }}
              >
                {students.length} records total
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════
   STUDENT ROW
════════════════════════════════ */
const StudentRow = ({ item, idx, onSubmit, onUnsubmit, isSubmitting }) => {
  const [hovered, setHovered] = useState(false);
  const submitted = item.status === "submitted";

  const cellStyle = {
    padding: "13px 20px",
    fontSize: "0.78rem",
    color: tk.textSecondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
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
      {/* Name + avatar */}
      <td style={{ ...cellStyle, padding: "11px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={item.studentId?.name} />
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: tk.textPrimary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.studentId?.name || "N/A"}
          </span>
        </div>
      </td>

      {/* Enrollment */}
      <td style={cellStyle}>
        <span
          style={{
            fontFamily: "'DM Sans', monospace",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: tk.textMuted,
            background: tk.metaBg,
            border: `1px solid ${tk.metaBorder}`,
            padding: "3px 8px",
            borderRadius: 6,
            letterSpacing: "0.03em",
          }}
        >
          {item.studentId?.enrollment || "—"}
        </span>
      </td>

      {/* Class */}
      <td style={cellStyle}>{item.studentId?.classs || "—"}</td>

      {/* Branch */}
      <td style={{ ...cellStyle, fontWeight: 500, color: tk.textPrimary }}>
        {item.studentId?.branch || "—"}
      </td>

      {/* Semester */}
      <td style={cellStyle}>
        {item.studentId?.semester ? `Sem ${item.studentId.semester}` : "—"}
      </td>

      {/* Status */}
      <td style={cellStyle}>
        <StatusBadge status={item.status} />
      </td>

      {/* Action */}
      <td style={{ ...cellStyle, textAlign: "right", overflow: "visible" }}>
        {!submitted ? (
          <button
            className="submit-btn"
            onClick={() => onSubmit(item._id)}
            disabled={isSubmitting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              background: tk.accent,
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.2s, transform 0.15s",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {isSubmitting ? (
              <>
                <span
                  style={{
                    width: 11,
                    height: 11,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "shimmer 0.7s linear infinite",
                    display: "inline-block",
                  }}
                />
                Saving…
              </>
            ) : (
              <>
                <i className="ri-check-line" style={{ fontSize: "0.85rem" }} />
                Mark Submitted
              </>
            )}
          </button>
        ) : (
          <button
            className="submit-btn"
            onClick={() => onUnsubmit(item._id)}
            disabled={isSubmitting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              background: tk.danger,
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.2s, transform 0.15s",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {isSubmitting ? (
              <>
                <span
                  style={{
                    width: 11,
                    height: 11,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "shimmer 0.7s linear infinite",
                    display: "inline-block",
                  }}
                />
                Saving…
              </>
            ) : (
              <>
                <i className="ri-close-line" style={{ fontSize: "0.85rem" }} />
                Unmark
              </>
            )}
          </button>
        )}
      </td>
    </tr>
  );
};

export default StudentList;
