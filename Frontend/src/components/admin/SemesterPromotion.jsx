import React, { useCallback, useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import { tk, inputStyle, labelStyle } from "../../constants/adminTheme";
import { ActionButton, Modal } from "./AdminShared";

const SemesterPromotion = ({ onPromoted }) => {
  const [currentSemester, setCurrentSemester] = useState("1");
  const [mode, setMode] = useState("single");
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const fetchPreview = useCallback(async () => {
    setLoadingPreview(true);
    try {
      const params = { mode };
      if (mode === "single") {
        params.currentSemester = currentSemester;
      }

      const { data } = await API.get("/admin/students/semester-promotion/preview", { params });
      if (data.success) {
        setPreview(data.preview);
      }
    } catch (error) {
      setPreview(null);
      toast.error(error.response?.data?.message || "Failed to load preview");
    } finally {
      setLoadingPreview(false);
    }
  }, [mode, currentSemester]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const handlePromote = async () => {
    setPromoting(true);
    try {
      const payload = { mode };
      if (mode === "single") {
        payload.currentSemester = Number(currentSemester);
      }

      const { data } = await API.post("/admin/students/semester-promotion", payload);
      if (data.success) {
        toast.success(data.message);
        setConfirmOpen(false);
        fetchPreview();
        onPromoted?.();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to promote semesters");
    } finally {
      setPromoting(false);
    }
  };

  const canPromote = preview && (
    mode === "all"
      ? (preview.totalPromoted > 0 || preview.totalGraduated > 0)
      : preview.activeCount > 0
  );

  const confirmSummary = () => {
    if (!preview) return "";

    if (mode === "all") {
      return `${preview.totalPromoted} student(s) will advance one semester. ${preview.totalGraduated} semester 8 student(s) will be marked as graduated and removed from active assignment lists.`;
    }

    if (Number(currentSemester) === 8) {
      return `${preview.activeCount} semester 8 student(s) will be marked as graduated. They will no longer appear in new assignments but their records are preserved.`;
    }

    return `${preview.activeCount} student(s) will move from semester ${currentSemester} to ${Number(currentSemester) + 1}.`;
  };

  return (
    <div
      style={{
        background: tk.card,
        border: `1px solid ${tk.accentBorder}`,
        borderRadius: 14,
        padding: "20px 22px",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", color: tk.textPrimary }}>
            Semester Promotion
          </h3>
          <p style={{ margin: "6px 0 0", color: tk.textSecondary, fontSize: "0.84rem", maxWidth: 560 }}>
            Promote students to the next semester at the end of each term. Semester 8 students are automatically marked as <strong>graduated</strong> instead of advancing further.
          </p>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 999,
            background: tk.warningSoft,
            color: tk.warning,
            fontSize: "0.72rem",
            fontWeight: 700,
          }}
        >
          <i className="ri-arrow-up-circle-line" />
          End-of-semester action
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <div style={{ minWidth: 180 }}>
          <label style={labelStyle}>Promotion Mode</label>
          <select
            style={inputStyle}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="single">By current semester</option>
            <option value="all">Promote all active students</option>
          </select>
        </div>

        {mode === "single" && (
          <div style={{ minWidth: 180 }}>
            <label style={labelStyle}>Current Semester</label>
            <select
              style={inputStyle}
              value={currentSemester}
              onChange={(e) => setCurrentSemester(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}{s === 8 ? " (Graduate)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div
        style={{
          background: tk.accentSoft,
          border: `1px solid ${tk.accentBorder}`,
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 16,
        }}
      >
        <p style={{ margin: "0 0 8px", fontSize: "0.72rem", fontWeight: 700, color: tk.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Preview
        </p>

        {loadingPreview ? (
          <p style={{ margin: 0, color: tk.textSecondary, fontSize: "0.84rem" }}>Calculating impact...</p>
        ) : !preview ? (
          <p style={{ margin: 0, color: tk.textMuted, fontSize: "0.84rem" }}>No preview available</p>
        ) : mode === "all" ? (
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: 0, color: tk.textPrimary, fontSize: "0.84rem" }}>
              <strong>{preview.totalPromoted}</strong> student(s) will advance by one semester (Sem 1→2, 2→3, … 7→8).
            </p>
            <p style={{ margin: 0, color: tk.textPrimary, fontSize: "0.84rem" }}>
              <strong>{preview.totalGraduated}</strong> semester 8 student(s) will be <strong>graduated</strong>.
            </p>
            {preview.breakdown?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {preview.breakdown.map((row) => (
                  <span
                    key={row.fromSemester}
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "#fff",
                      color: tk.textSecondary,
                    }}
                  >
                    Sem {row.fromSemester} → {row.toSemester}: {row.count}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : Number(currentSemester) === 8 ? (
          <p style={{ margin: 0, color: tk.textPrimary, fontSize: "0.84rem" }}>
            <strong>{preview.activeCount}</strong> active student(s) in semester 8 will be marked as <strong>graduated</strong>.
          </p>
        ) : (
          <p style={{ margin: 0, color: tk.textPrimary, fontSize: "0.84rem" }}>
            <strong>{preview.activeCount}</strong> active student(s) will move from semester <strong>{currentSemester}</strong> to <strong>{Number(currentSemester) + 1}</strong>.
          </p>
        )}
      </div>

      <ActionButton
        onClick={() => setConfirmOpen(true)}
        disabled={!canPromote || loadingPreview}
      >
        {mode === "all"
          ? "Promote All Active Students"
          : Number(currentSemester) === 8
            ? "Graduate Semester 8 Students"
            : `Promote Semester ${currentSemester} Students`}
      </ActionButton>

      {confirmOpen && (
        <Modal
          title="Confirm Semester Promotion"
          onClose={() => !promoting && setConfirmOpen(false)}
          width={520}
        >
          <p style={{ margin: "0 0 16px", color: tk.textSecondary, fontSize: "0.88rem", lineHeight: 1.6 }}>
            {confirmSummary()}
          </p>
          <p style={{ margin: "0 0 20px", color: tk.danger, fontSize: "0.78rem", fontWeight: 600 }}>
            This action updates the database immediately and cannot be undone in bulk. Please verify the preview before continuing.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <ActionButton variant="ghost" onClick={() => setConfirmOpen(false)} disabled={promoting}>
              Cancel
            </ActionButton>
            <ActionButton onClick={handlePromote} disabled={promoting}>
              {promoting ? "Processing..." : "Confirm Promotion"}
            </ActionButton>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SemesterPromotion;
