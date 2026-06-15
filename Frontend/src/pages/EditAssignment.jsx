import React, { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "remixicon/fonts/remixicon.css";

const EditAssignment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const assignment = location.state?.assignment;

  const [formData, setFormData] = useState({
    title: "",
    semester: "",
    classs: "",
    subject: "",
    branch: "",
    submissionDate: "",
    description: "",
  });

  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState({
    branches: true,
    sections: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [sectionOpen, setSectionOpen] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title || "",
        semester: assignment.semester || "",
        classs: assignment.classs || "",
        subject: assignment.subject || "",
        branch: assignment.branch || "",
        submissionDate: assignment.submissionDate
          ? assignment.submissionDate.split("T")[0]
          : "",
        description: assignment.description || "",
      });
    }
  }, [assignment]);

  useEffect(() => {
    const handler = (e) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target))
        setSectionOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingOptions((prev) => ({ ...prev, branches: true }));
      try {
        const { data } = await API.get("/api/branches");
        setBranches(data.branches ?? []);
      } catch (error) {
        console.log(error);
        setMessage({
          type: "error",
          text: "Could not load branch list. Please refresh the page.",
        });
      } finally {
        setLoadingOptions((prev) => ({ ...prev, branches: false }));
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    if (!formData.branch) {
      setSections([]);
      return;
    }

    const fetchSections = async () => {
      setLoadingOptions((prev) => ({ ...prev, sections: true }));
      try {
        const { data } = await API.get("/api/sections", {
          params: { branch: formData.branch },
        });
        setSections(data.sections ?? []);
      } catch (error) {
        console.log(error);
        setSections([]);
        setMessage({
          type: "error",
          text: "Could not load sections for the selected branch.",
        });
      } finally {
        setLoadingOptions((prev) => ({ ...prev, sections: false }));
      }
    };

    fetchSections();
  }, [formData.branch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "branch") {
      setFormData((prev) => ({ ...prev, branch: value, classs: "" }));
      setErrors((prev) => ({ ...prev, branch: undefined, classs: undefined }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!formData.title.trim()) next.title = "Title is required";
    if (!formData.subject.trim()) next.subject = "Subject is required";
    if (!formData.branch) next.branch = "Select a branch";
    if (!formData.classs) next.classs = "Select a section";
    if (!formData.semester) next.semester = "Select a semester";
    if (!formData.submissionDate) next.submissionDate = "Pick a deadline";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validate()) {
      setMessage({
        type: "error",
        text: "Please fix the highlighted fields before continuing.",
      });
      return;
    }

    setLoading(true);
    const payload = { ...formData, semester: Number(formData.semester) };

    try {
      const token = localStorage.getItem("authToken");
      const { data } = await API.put(`/api/assignment/${id}`, payload, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (data.success) {
        setMessage({ type: "success", text: "Assignment updated successfully." });
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
      console.log(error);
      const errorMsg =
        error.response?.data?.message ||
        "Update failed. Please review the form and try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const baseField =
    "w-full px-3.5 py-2.5 border bg-[#FAEDCD]/40 text-sm text-[#4A443A] rounded-lg outline-none placeholder:text-[#AFA89E] focus:bg-white focus:ring-2 transition-all duration-150 shadow-sm";

  const fieldClass = (hasError) =>
    `${baseField} ${
      hasError
        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
        : "border-[#D4A373]/25 focus:border-[#CCD5AE] focus:ring-[#CCD5AE]/40"
    }`;

  const selectClass = (hasError) =>
    `${fieldClass(
      hasError
    )} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%234A443A%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-8 disabled:cursor-not-allowed disabled:opacity-60`;

  const labelClass =
    "text-[11px] font-semibold text-[#918A82] uppercase tracking-wider mb-1.5 block";

  const errorText = "text-[11px] text-rose-500 font-medium mt-1";

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#FEFAE0] p-3 sm:p-6 antialiased font-sans">
      {/* Outer Card */}
      <div className="w-full max-w-2xl bg-white border-[#D4A373] border-t-4 sm:border-t-[6px] shadow-xl rounded-2xl flex flex-col overflow-hidden max-h-[96dvh]">

        {/* Header Section */}
        <header className="px-4 sm:px-6 py-4 border-b border-[#D4A373]/15 flex items-start sm:items-center justify-between gap-3 bg-white shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.15em] text-[#918A82] uppercase mb-0.5">
              Academic Administration Portal
            </p>
            <h1 className="text-base sm:text-lg font-bold text-[#4A443A] tracking-tight truncate">
              Edit Assignment Record
            </h1>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="shrink-0 text-xs font-medium text-[#6E675F] hover:text-[#4A443A] border border-[#D4A373]/25 hover:border-[#D4A373] bg-white px-2.5 sm:px-3 py-1.5 rounded-lg shadow-sm transition-all duration-150 flex items-center gap-1 cursor-pointer"
          >
            <i className="ri-arrow-left-line text-sm"></i>
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
        </header>

        {/* Dynamic Status Notification Banner */}
        {message.text && (
          <div
            role="alert"
            className={`mx-4 sm:mx-6 mt-4 px-4 py-3 text-xs font-medium rounded-lg border flex items-start gap-2.5 shrink-0 animate-fadeIn ${
              message.type === "success"
                ? "bg-emerald-50/60 text-emerald-800 border-emerald-200"
                : "bg-rose-50/60 text-rose-800 border-rose-200"
            }`}
          >
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 ${
                message.type === "success"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {message.type === "success" ? (
                <i className="ri-check-line"></i>
              ) : (
                <i className="ri-error-warning-line"></i>
              )}
            </span>
            <span className="flex-1 pt-0.5">{message.text}</span>
            <button
              type="button"
              onClick={() => setMessage({ type: "", text: "" })}
              className="text-current opacity-50 hover:opacity-100 transition-opacity shrink-0"
              aria-label="Dismiss"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        )}

        {/* Form Elements Container */}
        <form
          onSubmit={handleSubmit}
          className="px-4 sm:px-6 py-5 flex flex-col justify-between flex-1 min-h-0 overflow-hidden"
        >
          <div className="space-y-5 overflow-y-auto pr-1 -mr-1">
            {/* Core Assignment Details */}
            <div>
              <label className={labelClass}>
                Assignment Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Implementation of Secure Authentication Protocols"
                className={fieldClass(errors.title)}
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className={errorText}>{errors.title}</p>}
            </div>

            {/* Comprehensive Structure Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Web Security"
                  className={fieldClass(errors.subject)}
                  aria-invalid={!!errors.subject}
                />
                {errors.subject && <p className={errorText}>{errors.subject}</p>}
              </div>

              {/* Semester Selection */}
              <div>
                <label className={labelClass}>
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={selectClass(errors.semester)}
                  aria-invalid={!!errors.semester}
                >
                  <option value="" disabled hidden>
                    Select Semester
                  </option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      Semester {n}
                    </option>
                  ))}
                </select>
                {errors.semester && <p className={errorText}>{errors.semester}</p>}
              </div>

              {/* Branch Select */}
              <div>
                <label className={labelClass}>
                  Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={loadingOptions.branches}
                  className={selectClass(errors.branch)}
                  aria-invalid={!!errors.branch}
                >
                  <option value="" disabled hidden>
                    {loadingOptions.branches
                      ? "Loading branches..."
                      : "Select Branch"}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                  {/* Keep the assignment's current branch selectable even if it's
                      no longer in the live branch list */}
                  {formData.branch && !branches.includes(formData.branch) && (
                    <option value={formData.branch}>{formData.branch}</option>
                  )}
                </select>
                {errors.branch && <p className={errorText}>{errors.branch}</p>}
              </div>

              {/* Section Custom Dropdown */}
              <div className="relative" ref={sectionRef}>
                <label className={labelClass}>
                  Class / Section <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !formData.branch ||
                      loadingOptions.sections ||
                      sections.length === 0
                    )
                      return;
                    setSectionOpen((o) => !o);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={sectionOpen}
                  className={`${selectClass(
                    errors.classs
                  )} flex items-center justify-between w-full h-[42px] py-0 ${
                    !formData.branch || sections.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span className={`truncate ${formData.classs ? "" : "text-[#AFA89E]"}`}>
                    {!formData.branch
                      ? "Select branch first"
                      : loadingOptions.sections
                        ? "Loading sections..."
                        : sections.length === 0
                          ? "No sections found"
                          : formData.classs || "Select Section"}
                  </span>
                </button>

                {sectionOpen && (
                  <ul
                    role="listbox"
                    className="absolute z-10 mt-1 w-full bg-white border border-[#D4A373]/25 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1"
                  >
                    {sections.map((section) => (
                      <li
                        key={section}
                        role="option"
                        aria-selected={formData.classs === section}
                        onClick={() => {
                          handleChange({
                            target: { name: "classs", value: section },
                          });
                          setSectionOpen(false);
                        }}
                        className={`px-4 py-2 hover:bg-[#E9EDC9] cursor-pointer text-sm text-[#4A443A] ${
                          formData.classs === section ? "bg-[#E9EDC9]/60 font-semibold" : ""
                        }`}
                      >
                        {section}
                      </li>
                    ))}
                  </ul>
                )}

                <input
                  type="text"
                  name="classs"
                  value={formData.classs}
                  readOnly
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                />
                {errors.classs && <p className={errorText}>{errors.classs}</p>}
              </div>

              {/* Submission Deadline */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Submission Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="submissionDate"
                  value={formData.submissionDate}
                  onChange={handleChange}
                  className={`${fieldClass(errors.submissionDate)} cursor-pointer`}
                  aria-invalid={!!errors.submissionDate}
                />
                {errors.submissionDate && (
                  <p className={errorText}>{errors.submissionDate}</p>
                )}
              </div>
            </div>

            {/* Optional Description */}
            <div>
              <div className="flex items-baseline justify-between">
                <label className={labelClass}>
                  Instructions & Description
                </label>
                <span className="text-[11px] text-[#AFA89E] font-medium mb-1.5">
                  optional
                </span>
              </div>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide grading rubrics, detailed instructions, reference materials, or submission guidelines..."
                className={`${fieldClass(false)} resize-none`}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#D4A373]/15 pt-4 mt-4 bg-white shrink-0">
            <p className="text-[11px] text-[#918A82] font-medium text-center sm:text-left">
              Fields marked <span className="text-rose-500">*</span> are
              required.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleBack}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-[#6E675F] hover:text-[#4A443A] border border-[#D4A373]/25 hover:bg-[#FAEDCD] rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#CCD5AE] hover:bg-[#b6bf96] disabled:bg-[#918A82] text-[#4A443A] text-xs font-bold tracking-wide rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 min-w-[150px] justify-center cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-save-line"></i>
                    Update Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Global Footer */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#FAEDCD]/50 border-t border-[#D4A373]/15 flex items-center justify-between text-[10px] text-[#918A82] font-medium shrink-0">
          <span>Academic Management System</span>
          <span>
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EditAssignment;