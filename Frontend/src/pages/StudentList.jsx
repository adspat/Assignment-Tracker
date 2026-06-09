import API from "../api/axios";
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
    .student-row { animation: rowIn 0.35s ease both; }
    .mobile-card { animation: rowIn 0.3s ease both; }
    .shimmer-pulse { animation: shimmer 1.4s ease-in-out infinite; }
    .spin { animation: spin 0.7s linear infinite; }
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
        background: `hsl(${hue},40%,88%)`,
        borderColor: `hsl(${hue},30%,78%)`,
        color: `hsl(${hue},40%,30%)`,
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
      className={`inline-flex items-center gap-1 text-[0.65rem] font-bold tracking-wide px-2.5 py-1 rounded-full border whitespace-nowrap ${
        submitted
          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
          : "bg-amber-50 text-amber-600 border-amber-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          submitted ? "bg-emerald-500" : "bg-amber-500"
        }`}
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
          className="shimmer-pulse h-3 rounded-md bg-black/[0.06]"
          style={{ width: `${w}%` }}
        />
      </td>
    ))}
  </tr>
);

/* ─── Skeleton card (mobile) ─── */
const SkeletonCard = () => (
  <div className="bg-white border border-black/[0.07] rounded-2xl p-4 flex items-center gap-3">
    <div className="shimmer-pulse w-11 h-11 rounded-full bg-black/[0.06] flex-shrink-0" />
    <div className="flex-1">
      <div className="shimmer-pulse h-3 w-[55%] rounded-md bg-black/[0.06] mb-2" />
      <div className="shimmer-pulse h-2.5 w-[30%] rounded-md bg-black/[0.06]" />
    </div>
    <div className="shimmer-pulse w-20 h-8 rounded-xl bg-black/[0.06]" />
  </div>
);

/* ─── Search Bar ─── */
const SearchBar = ({ value, onChange, isMobile, resultCount, totalCount }) => {
  const inputRef = useRef(null);
  const hasQuery = value.length > 0;

  return (
    <div className={`${isMobile ? "mb-3.5" : "mb-5"}`}>
      <div className="relative flex items-center">
        <i
          className={`ri-search-line absolute left-3.5 text-base pointer-events-none z-10 transition-colors duration-200 ${
            hasQuery ? "text-violet-500" : "text-stone-400"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by name, enrollment, branch…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${isMobile ? "py-2.5" : "py-3"} pl-10 pr-10 bg-white rounded-xl text-[0.82rem] font-medium text-stone-900 transition-all duration-200 font-[DM_Sans] focus:outline-none ${
            hasQuery
              ? "border-2 border-violet-300 shadow-[0_0_0_3px_rgba(124,106,247,0.08)]"
              : "border border-black/[0.07] shadow-sm"
          }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
        {hasQuery && (
          <button
            onClick={() => { onChange(""); inputRef.current?.focus(); }}
            className="absolute right-2.5 w-6 h-6 rounded-full bg-black/[0.07] border-none flex items-center justify-center cursor-pointer text-stone-400 text-sm hover:bg-black/[0.12] transition-colors duration-150"
          >
            <i className="ri-close-line" />
          </button>
        )}
      </div>
      {hasQuery && (
        <p
          className={`mt-1.5 ml-0.5 text-[0.68rem] font-semibold ${
            resultCount === 0 ? "text-red-500" : "text-violet-500"
          }`}
          style={{ animation: "fadeIn 0.15s ease" }}
        >
          {resultCount === 0
            ? "No students match your search"
            : `${resultCount} of ${totalCount} student${resultCount !== 1 ? "s" : ""} match`}
        </p>
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

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleAdd = async () => {
    const trimmed = enrollment.trim();
    if (!trimmed) {
      setError("Please enter an enrollment number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onAdd(trimmed);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Student not found or already added."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[998]"
        style={{ animation: "fadeIn 0.2s ease" }}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-[999] bg-white rounded-[22px] shadow-2xl w-[min(420px,calc(100vw-32px))]"
        style={{
          animation: "slideUpCenter 0.3s cubic-bezier(0.34,1.3,0.64,1) forwards",
          padding: "28px 28px 24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-500 text-lg flex-shrink-0">
              <i className="ri-user-add-line" />
            </div>
            <div>
              <h2
                className="m-0 text-[1.1rem] font-black text-stone-900 tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Add Student
              </h2>
              <p className="mt-0.5 text-[0.68rem] text-stone-400 font-medium">
                Link student by enrollment number
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.06] border-none flex items-center justify-center cursor-pointer text-stone-500 text-base hover:bg-black/10 transition-colors flex-shrink-0"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        {/* Input */}
        <div className="mb-2">
          <label className="block text-[0.62rem] font-bold uppercase tracking-[0.08em] text-stone-400 mb-2">
            Enrollment Number
          </label>
          <div className="relative">
            <i
              className={`ri-hashtag absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.9rem] pointer-events-none transition-colors duration-200 ${
                enrollment ? "text-violet-500" : "text-stone-400"
              }`}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. 0101CS211001"
              value={enrollment}
              onChange={(e) => {
                setEnrollment(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              className={`w-full py-3 pl-9 pr-4 bg-stone-50 rounded-xl text-sm font-semibold text-stone-900 transition-all duration-200 focus:outline-none placeholder:text-stone-300 placeholder:font-normal ${
                error
                  ? "border-2 border-red-300 shadow-[0_0_0_3px_rgba(229,72,77,0.08)]"
                  : enrollment
                  ? "border-2 border-violet-300 shadow-[0_0_0_3px_rgba(124,106,247,0.08)]"
                  : "border border-black/[0.07]"
              }`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          {/* Error */}
          {error && (
            <p
              className="mt-2 text-[0.7rem] font-semibold text-red-500 flex items-center gap-1.5"
              style={{ animation: "fadeIn 0.15s ease" }}
            >
              <i className="ri-error-warning-line text-sm" />
              {error}
            </p>
          )}
        </div>

        {/* Info hint */}
        <p className="text-[0.68rem] text-stone-400 mb-5 flex items-center gap-1.5">
          <i className="ri-information-line text-xs text-violet-400" />
          The student will be added to this assignment's submission list.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-black/[0.04] text-stone-500 border border-black/[0.07] rounded-xl text-[0.82rem] font-semibold cursor-pointer hover:bg-black/[0.07] transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={loading}
            className={`flex-1 py-3 px-4 bg-violet-500 text-white border-none rounded-xl text-[0.82rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all duration-150 ${
              loading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-violet-600 hover:-translate-y-px active:scale-[0.97]"
            }`}
          >
            {loading ? (
              <>
                <Spinner /> Adding…
              </>
            ) : (
              <>
                <i className="ri-user-add-line text-base" />
                Add Student
              </>
            )}
          </button>
        </div>
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
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { semester, classs, branch } = location.state || {};
  const { assignmentId } = useParams();
  const isMobile = useIsMobile();

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
        const { data } = await API.get(`/api/submission/${assignmentId}`);
        if (data.success) {
          const sorted = [...data.data].sort((a, b) =>
            (a.studentId?.name?.toLowerCase() || "").localeCompare(
              b.studentId?.name?.toLowerCase() || ""
            )
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
      // Re-fetch or optimistically add the new student
      const res = await API.get(`/api/submission/${assignmentId}`);
      if (res.data.success) {
        const sorted = [...res.data.data].sort((a, b) =>
          (a.studentId?.name?.toLowerCase() || "").localeCompare(
            b.studentId?.name?.toLowerCase() || ""
          )
        );
        setStudents(sorted);
      }
    } else {
      throw new Error(data.message || "Failed to add student");
    }
  };

  /* ── Submit / Unsubmit ── */
  const handleSubmit = async (submissionId) => {
    setSubmittingId(submissionId);
    try {
      const { data } = await API.put(`/api/submission/submit/${submissionId}`, {});
      if (data.success) {
        setStudents((prev) =>
          prev.map((item) =>
            item._id === submissionId ? { ...item, status: "submitted" } : item
          )
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

  const handleUnsubmit = async (submissionId) => {
    setSubmittingId(submissionId);
    try {
      const { data } = await API.put(`/api/submission/unsubmit/${submissionId}`, {});
      if (data.success) {
        setStudents((prev) =>
          prev.map((item) =>
            item._id === submissionId ? { ...item, status: "pending" } : item
          )
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

  /* ── Stats ── */
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
      className="min-h-screen bg-[#f5f4f0] overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", color: "#12110f", padding: isMobile ? "20px 14px 32px" : "44px 48px" }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: isMobile ? "100%" : 1100 }}>

        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-stone-400 bg-transparent border border-black/[0.07] rounded-[9px] px-3.5 py-1.5 cursor-pointer mb-7 hover:bg-black/[0.07] transition-colors duration-150"
        >
          <i className="ri-arrow-left-s-line text-base" />
          Back to Dashboard
        </button>

        {/* ── Page header ── */}
        <header
          className={`flex justify-between items-start flex-wrap ${isMobile ? "gap-3.5 mb-4.5 pb-4.5" : "gap-5 mb-7 pb-6"} border-b border-black/[0.06]`}
        >
          <div className="min-w-0">
            <p className="text-[0.62rem] font-bold tracking-[0.12em] uppercase text-violet-500 mb-1.5">
              Assignment Submissions
            </p>
            <h1
              className={`${isMobile ? "text-[1.55rem]" : "text-[2rem]"} font-black text-stone-900 tracking-tight leading-tight m-0`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Student<span className="text-violet-500"> Records</span>
            </h1>
            {branch && (
              <p className="mt-2 text-[0.76rem] text-stone-400 font-normal flex items-center gap-1.5 flex-wrap">
                <i className="ri-git-branch-line text-[0.85rem]" />{branch}
                <span className="text-black/10">·</span>
                <i className="ri-hotel-line text-[0.85rem]" />Class {classs}
                <span className="text-black/10">·</span>
                <i className="ri-calendar-event-line text-[0.85rem]" />Semester {semester}
              </p>
            )}
          </div>

          {/* Stat pills */}
          {!loading && totalStudents > 0 && (
            <div className={`flex ${isMobile ? "gap-2 w-full" : "gap-2.5"} flex-wrap`}>
              {[
                { label: "Total", val: totalStudents, colorClass: "text-stone-900", bgClass: "bg-[#f9f8f5]", borderClass: "border-black/[0.07]" },
                { label: "Submitted", val: totalSubmitted, colorClass: "text-emerald-600", bgClass: "bg-emerald-50", borderClass: "border-emerald-200" },
                { label: "Pending", val: totalStudents - totalSubmitted, colorClass: "text-amber-600", bgClass: "bg-amber-50", borderClass: "border-amber-200" },
              ].map(({ label, val, colorClass, bgClass, borderClass }) => (
                <div
                  key={label}
                  className={`${isMobile ? "px-3.5 py-2 flex-1" : "px-4 py-2.5"} ${bgClass} border ${borderClass} rounded-xl text-center`}
                >
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-stone-400 m-0 mb-0.5">{label}</p>
                  <p
                    className={`${isMobile ? "text-base" : "text-xl"} font-bold ${colorClass} m-0`}
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {val}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          {!loading && (
            <div className={`flex gap-2 ${isMobile ? "w-full" : ""}`}>
              {/* Add Student Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 bg-violet-500 text-white border-none rounded-xl text-[0.75rem] font-bold cursor-pointer hover:bg-violet-600 hover:-translate-y-px active:scale-[0.97] transition-all duration-150 ${isMobile ? "flex-1" : ""}`}
              >
                <i className="ri-user-add-line text-base" />
                Add Student
              </button>

              {/* Download CSV */}
              {students.length > 0 && (
                <button
                  onClick={handleDownload}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-900 text-white border-none rounded-xl text-[0.75rem] font-bold cursor-pointer hover:bg-stone-800 hover:-translate-y-px active:scale-[0.97] transition-all duration-150 ${isMobile ? "flex-1" : ""}`}
                >
                  <i className="ri-download-2-line" />
                  CSV
                </button>
              )}
            </div>
          )}
        </header>

        {/* ── Progress bar ── */}
        {!loading && totalStudents > 0 && (
          <div
            className={`bg-white border border-black/[0.07] rounded-2xl ${isMobile ? "p-3.5 mb-4" : "p-5 mb-5"} flex items-center gap-4`}
          >
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[0.7rem] font-semibold text-stone-400 tracking-[0.05em] uppercase">
                  Completion
                </span>
                <span className={`text-[0.9rem] font-bold ${pct === 100 ? "text-emerald-600" : "text-stone-900"}`}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden border border-black/[0.06]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    pct === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-violet-500 to-violet-400"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="text-[0.72rem] font-semibold text-stone-400 whitespace-nowrap flex-shrink-0">
              {totalSubmitted}/{totalStudents}
            </div>
          </div>
        )}

        {/* ── Search Bar ── */}
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
            <div className="flex flex-col gap-2.5">
              {[1, 2, 3, 4, 5].map((n) => <SkeletonCard key={n} />)}
            </div>
          ) : (
            <div className="bg-white border border-black/[0.07] rounded-[18px] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#f9f8f5]">
                    {["Student", "Enrollment", "Class", "Branch", "Semester", "Status", "Action"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[0.6rem] font-bold tracking-[0.1em] uppercase text-stone-400 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{[1, 2, 3, 4, 5].map((n) => <SkeletonRow key={n} />)}</tbody>
              </table>
            </div>
          )
        ) : filteredStudents.length === 0 ? (
          /* Empty state */
          <div className="bg-white border-2 border-dashed border-black/[0.10] rounded-[20px] text-center py-20 px-8">
            <div className="w-14 h-14 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center mx-auto mb-4 text-violet-500">
              <i className={`${searchQuery ? "ri-search-line" : "ri-user-search-line"} text-2xl`} />
            </div>
            <h3
              className="text-[1.05rem] font-bold text-stone-900 mb-1.5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {searchQuery ? "No results found" : "No student records"}
            </h3>
            <p className="text-[0.78rem] text-stone-400">
              {searchQuery
                ? `No students match "${searchQuery}". Try a different search.`
                : "No submissions have been recorded for this assignment yet."}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3.5 px-4 py-2 bg-violet-50 text-violet-500 border border-violet-200 rounded-[9px] text-[0.76rem] font-bold cursor-pointer inline-flex items-center gap-1.5 hover:bg-violet-100 transition-colors"
              >
                <i className="ri-close-line" /> Clear search
              </button>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3.5 px-4 py-2 bg-violet-500 text-white border-none rounded-[9px] text-[0.76rem] font-bold cursor-pointer inline-flex items-center gap-1.5 hover:bg-violet-600 transition-colors"
              >
                <i className="ri-user-add-line" /> Add First Student
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
          <div className="bg-white border border-black/[0.07] rounded-[18px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ tableLayout: "fixed", minWidth: 760 }}>
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
                  <tr className="bg-[#f9f8f5] border-b border-black/[0.06]">
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
                        className={`px-5 py-3 text-[0.6rem] font-bold tracking-[0.09em] uppercase text-stone-400 whitespace-nowrap ${align === "right" ? "text-right" : "text-left"}`}
                      >
                        {icon && <i className={`${icon} text-[0.82rem] mr-1 align-[-1px]`} />}
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
            <div className="border-t border-black/[0.06] px-5 py-2.5 flex justify-end items-center gap-1.5">
              <i className="ri-list-check text-stone-400 text-[0.85rem]" />
              <span className="text-[0.7rem] font-semibold text-stone-400">
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

      {/* ════════════ ADD STUDENT MODAL ════════════ */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStudent}
          assignmentId={assignmentId}
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
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between pb-2">
        <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-[0.08em]">
          {students.length} students
        </span>
        <span className="text-[0.65rem] text-stone-400 font-medium flex items-center gap-1">
          <i className="ri-information-line text-[0.8rem]" />
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
      className="mobile-card bg-white border border-black/[0.07] rounded-2xl overflow-hidden shadow-sm"
      style={{ animationDelay: `${idx * 0.035}s` }}
    >
      <div className="flex items-center">
        <button
          onClick={() => onOpenModal(item)}
          className="flex-1 flex items-center gap-3 px-3.5 py-3.5 bg-transparent border-none cursor-pointer text-left min-w-0 active:bg-violet-50/50 transition-colors duration-150"
        >
          <Avatar name={item.studentId?.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[0.88rem] font-bold text-stone-900 truncate">
              {item.studentId?.name || "N/A"}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusBadge status={item.status} />
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-base text-stone-400 flex-shrink-0 ml-auto" />
        </button>

        <div className="w-px h-14 bg-black/[0.06] flex-shrink-0" />

        <div className="px-3 flex-shrink-0">
          {!submitted ? (
            <button
              onClick={() => onSubmit(item._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-violet-50 text-violet-500 border border-violet-200 rounded-xl text-[0.72rem] font-bold cursor-pointer whitespace-nowrap hover:bg-violet-100 active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? <><Spinner /> Saving…</> : <><i className="ri-check-line text-[0.9rem]" />Submit</>}
            </button>
          ) : (
            <button
              onClick={() => onUnsubmit(item._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-[0.72rem] font-bold cursor-pointer whitespace-nowrap hover:bg-emerald-100 active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
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
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/55 backdrop-blur-[4px] z-[998]"
        style={{ animation: "fadeIn 0.2s ease" }}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-[999] bg-white rounded-t-[22px] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] max-h-[88vh] overflow-y-auto overflow-x-hidden"
        style={{
          paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
          animation: "slideUp 0.3s cubic-bezier(0.34,1.3,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-black/[0.12]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            <Avatar name={student.studentId?.name} size="lg" />
            <div>
              <p className="m-0 text-base font-bold text-stone-900">
                {student.studentId?.name || "N/A"}
              </p>
              <p className="mt-0.5 m-0 text-[0.68rem] text-stone-400 font-medium">Student Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/[0.06] border-none flex items-center justify-center cursor-pointer text-stone-500 text-lg hover:bg-black/10 transition-colors"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-5 grid gap-2.5">
          <div
            className={`border-2 rounded-2xl p-4 flex items-center justify-between ${
              submitted ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
            }`}
          >
            <div>
              <p className={`text-[0.62rem] font-bold uppercase tracking-[0.08em] mb-1 ${submitted ? "text-emerald-600" : "text-amber-600"}`}>
                Submission Status
              </p>
              <p className={`m-0 text-base font-bold ${submitted ? "text-emerald-600" : "text-amber-600"}`}>
                {submitted ? "Submitted ✓" : "Pending"}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${submitted ? "bg-emerald-200/50" : "bg-amber-200/50"}`}>
              <i
                className={`${submitted ? "ri-checkbox-circle-fill" : "ri-time-line"} text-2xl ${submitted ? "text-emerald-500" : "text-amber-500"}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Enrollment", value: student.studentId?.enrollment || "N/A", icon: "ri-hashtag" },
              { label: "Class", value: student.studentId?.classs || "N/A", icon: "ri-hotel-line" },
              { label: "Branch", value: student.studentId?.branch || "N/A", icon: "ri-git-branch-line" },
              {
                label: "Semester",
                value: student.studentId?.semester ? `Semester ${student.studentId.semester}` : "N/A",
                icon: "ri-calendar-event-line",
              },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-[#f9f8f5] border border-black/[0.06] rounded-xl p-3.5">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.05em] text-stone-400 m-0 mb-1.5 flex items-center gap-1">
                  <i className={`${icon} text-[0.75rem] text-violet-500`} />
                  {label}
                </p>
                <p className="text-[0.84rem] font-semibold text-stone-900 m-0 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pt-5">
          {!submitted ? (
            <button
              onClick={() => onSubmit(student._id)}
              disabled={isLoading}
              className={`w-full py-3.5 px-4 bg-violet-500 text-white border-none rounded-2xl text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 tracking-[0.02em] ${
                isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-violet-600 transition-colors"
              }`}
            >
              {isLoading ? <><Spinner /> Saving…</> : <><i className="ri-check-double-line text-base" />Mark as Submitted</>}
            </button>
          ) : (
            <button
              onClick={() => onUnsubmit(student._id)}
              disabled={isLoading}
              className={`w-full py-3.5 px-4 bg-transparent text-red-500 border-2 border-red-200 rounded-2xl text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 ${
                isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-red-50 transition-colors"
              }`}
            >
              {isLoading ? <><Spinner /> Saving…</> : <><i className="ri-close-circle-line text-base" />Unmark Submitted</>}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full mt-2.5 py-3 px-4 bg-black/[0.04] text-stone-400 border border-black/[0.07] rounded-2xl text-[0.82rem] font-semibold cursor-pointer hover:bg-black/[0.07] transition-colors"
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

  return (
    <tr
      className="student-row border-b border-black/[0.06] transition-colors duration-150"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(124,106,247,0.03)" : "transparent",
        animationDelay: `${idx * 0.04}s`,
      }}
    >
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={item.studentId?.name} />
          <span className="text-[0.82rem] font-semibold text-stone-900 truncate">
            {item.studentId?.name || "N/A"}
          </span>
        </div>
      </td>
      <td className="px-5 py-3">
        <span className="font-mono text-[0.72rem] font-semibold text-stone-400 bg-[#f9f8f5] border border-black/[0.06] px-2 py-0.5 rounded-md tracking-[0.03em]">
          {item.studentId?.enrollment || "—"}
        </span>
      </td>
      <td className="px-5 py-3 text-[0.78rem] text-stone-500">{item.studentId?.classs || "—"}</td>
      <td className="px-5 py-3 text-[0.78rem] font-medium text-stone-900">{item.studentId?.branch || "—"}</td>
      <td className="px-5 py-3 text-[0.78rem] text-stone-500">
        {item.studentId?.semester ? `Sem ${item.studentId.semester}` : "—"}
      </td>
      <td className="px-5 py-3">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-5 py-3 text-right overflow-visible">
        {!submitted ? (
          <button
            onClick={() => onSubmit(item._id)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-violet-500 text-white border-none rounded-[9px] text-[0.72rem] font-bold cursor-pointer whitespace-nowrap tracking-[0.02em] hover:bg-violet-600 hover:-translate-y-px active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? <><Spinner />Saving…</> : <><i className="ri-check-line text-[0.85rem]" />Mark Submitted</>}
          </button>
        ) : (
          <button
            onClick={() => onUnsubmit(item._id)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-500 text-white border-none rounded-[9px] text-[0.72rem] font-bold cursor-pointer whitespace-nowrap tracking-[0.02em] hover:bg-red-600 hover:-translate-y-px active:scale-[0.97] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? <><Spinner />Saving…</> : <><i className="ri-close-line text-[0.85rem]" />Unmark</>}
          </button>
        )}
      </td>
    </tr>
  );
};

export default StudentList;