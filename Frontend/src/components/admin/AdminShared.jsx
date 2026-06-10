import React from "react";
import { tk, inputStyle } from "../../constants/adminTheme";

export const Modal = ({ title, children, onClose, width = 520 }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,15,20,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16,
    }}
    onClick={onClose}
  >
    <div
      style={{
        background: tk.card,
        borderRadius: 16,
        width: "100%",
        maxWidth: width,
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 22px",
          borderBottom: `1px solid ${tk.cardBorder}`,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.15rem",
            color: tk.textPrimary,
          }}
        >
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          style={{
            border: "none",
            background: "#f9f8f5",
            borderRadius: 8,
            width: 32,
            height: 32,
            cursor: "pointer",
            color: tk.textSecondary,
          }}
        >
          <i className="ri-close-line" style={{ fontSize: "1.1rem" }} />
        </button>
      </div>
      <div style={{ padding: "20px 22px 24px" }}>{children}</div>
    </div>
  </div>
);

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 }}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        style={paginationBtnStyle(page <= 1)}
      >
        Prev
      </button>
      <span style={{ fontSize: "0.78rem", color: tk.textSecondary, fontWeight: 600 }}>
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        style={paginationBtnStyle(page >= totalPages)}
      >
        Next
      </button>
    </div>
  );
};

function paginationBtnStyle(disabled) {
  return {
    border: `1px solid ${tk.cardBorder}`,
    background: disabled ? "#f5f5f5" : "#fff",
    color: disabled ? tk.textMuted : tk.textPrimary,
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

export const SearchInput = ({ value, onChange, placeholder }) => (
  <input
    type="search"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{ ...inputStyle, maxWidth: 280 }}
  />
);

export const ActionButton = ({ children, onClick, variant = "primary", disabled = false, type = "button" }) => {
  const styles = {
    primary: { background: tk.accent, color: "#fff", border: "none" },
    danger: { background: tk.dangerSoft, color: tk.danger, border: `1px solid ${tk.danger}33` },
    ghost: { background: "#fff", color: tk.textSecondary, border: `1px solid ${tk.cardBorder}` },
    success: { background: tk.successSoft, color: tk.success, border: `1px solid ${tk.success}33` },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        borderRadius: 8,
        padding: "7px 12px",
        fontSize: "0.72rem",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
};

export const EmptyState = ({ message }) => (
  <div
    style={{
      textAlign: "center",
      padding: "48px 20px",
      color: tk.textMuted,
      fontSize: "0.88rem",
    }}
  >
    <i className="ri-inbox-line" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }} />
    {message}
  </div>
);

export const TableWrap = ({ children }) => (
  <div
    style={{
      background: tk.card,
      borderRadius: 14,
      border: `1px solid ${tk.cardBorder}`,
      overflow: "auto",
    }}
  >
    {children}
  </div>
);

export const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.8rem",
};

export const thStyle = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: "0.68rem",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: tk.textMuted,
  borderBottom: `1px solid ${tk.cardBorder}`,
  background: "#faf9f7",
  whiteSpace: "nowrap",
};

export const tdStyle = {
  padding: "12px 14px",
  borderBottom: `1px solid ${tk.cardBorder}`,
  color: tk.textPrimary,
  verticalAlign: "middle",
};
