import React, { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import "remixicon/fonts/remixicon.css";

const AddAssignment = () => {
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
  const navigate = useNavigate();
  const [sectionOpen, setSectionOpen] = useState(false);
  const sectionRef = useRef(null);

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
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const payload = { ...formData, semester: Number(formData.semester) };

    try {
      const { data } = await API.post("/api/assignment", payload);

      if (data.success || data._id) {
        setMessage({
          type: "success",
          text: "Assignment record created successfully.",
        });
        setFormData({
          title: "",
          semester: "",
          classs: "",
          subject: "",
          branch: "",
          submissionDate: "",
          description: "",
        });
        setSections([]);
      }
    } catch (error) {
      console.log(error);
      const errorMsg =
        error.response?.data?.message ||
        "Submission failed. Please review the form and try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const inputClass =
    "w-full px-3 py-2 border border-[#D4A373]/25 bg-[#FAEDCD]/40 text-sm text-[#4A443A] rounded-md outline-none placeholder:text-[#918A82] focus:border-[#CCD5AE] focus:bg-white focus:ring-1 focus:ring-[#CCD5AE] transition-all duration-150 shadow-sm";

  const selectClass = `${inputClass} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%234A443A%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-8`;

  const labelClass =
    "text-[11px] font-semibold text-[#918A82] uppercase tracking-wider mb-1 block";

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-[#FEFAE0] p-4 antialiased font-sans">
      {/* Outer Card */}
      <div className="w-full max-w-2xl bg-white border-[#D4A373] border-t-5 shadow-xl rounded-xl flex flex-col overflow-hidden max-h-[92vh]">

        {/* Header Section */}
        <header className="px-6 py-4 border-b border-[#D4A373]/15 flex items-center justify-between bg-white shrink-0">
          <div>
            <p className="text-[10px] font-bold tracking-[0.15em] text-[#918A82] uppercase mb-0.5">
              Academic Administration Portal
            </p>
            <h1 className="text-lg font-bold text-[#4A443A] tracking-tight">
              New Assignment Record
            </h1>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="text-xs font-medium text-[#6E675F] hover:text-[#4A443A] border border-[#D4A373]/25 hover:border-[#D4A373] bg-white px-3 py-1.5 rounded-lg shadow-sm transition-all duration-150 flex items-center gap-1 cursor-pointer"
          >
            <span>←</span> Back to Dashboard
          </button>
        </header>

        {/* Dynamic Status Notification Banner */}
        {message.text && (
          <div
            className={`mx-6 mt-4 px-4 py-3 text-xs font-medium rounded-lg border flex items-center gap-2.5 shrink-0 animate-fadeIn ${
              message.type === "success"
                ? "bg-emerald-50/60 text-emerald-800 border-emerald-200"
                : "bg-rose-50/60 text-rose-800 border-rose-200"
            }`}
          >
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                message.type === "success"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {message.type === "success" ? "✓" : "!"}
            </span>
            <span className="flex-1">{message.text}</span>
          </div>
        )}

        {/* Form Elements Container */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 flex flex-col justify-between flex-1 min-h-0 overflow-hidden"
        >
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Core Assignment Details */}
            <div>
              <label className={labelClass}>
                Assignment Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Implementation of Secure Authentication Protocols"
                className={inputClass}
              />
            </div>

            {/* Comprehensive Structure Metadata Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Web Security"
                  className={inputClass}
                />
              </div>

              {/* Branch Select — no extra icon, selectClass handles the arrow */}
              <div>
                <label className={labelClass}>
                  Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  name="branch"
                  required
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={loadingOptions.branches}
                  className={selectClass}
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
                </select>
              </div>

              {/* Section Custom Dropdown — height locked to match select */}
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
                  className={`${selectClass} flex items-center justify-between w-full h-[38px] py-0 ${
                    !formData.branch || sections.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span className={formData.classs ? "" : "text-[#918A82]"}>
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
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-[#D4A373]/25 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {sections.map((section) => (
                      <li
                        key={section}
                        onClick={() => {
                          handleChange({
                            target: { name: "classs", value: section },
                          });
                          setSectionOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-[#E9EDC9] cursor-pointer text-sm text-[#4A443A]"
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
                  required
                  readOnly
                  className="sr-only"
                  tabIndex={-1}
                />
              </div>

              {/* Semester Selection */}
              <div>
                <label className={labelClass}>
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleChange}
                  className={selectClass}
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
              </div>

              {/* Submission Deadline */}
              <div className="col-span-2">
                <label className={labelClass}>
                  Submission Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="submissionDate"
                  required
                  value={formData.submissionDate}
                  onChange={handleChange}
                  className={`${inputClass} cursor-pointer`}
                />
              </div>
            </div>

            {/* Optional Description */}
            <div>
              <label className={labelClass}>
                Instructions & Description{" "}
                <span className="normal-case font-medium text-[#918A82] lowercase">
                  (optional)
                </span>
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide grading rubrics, detailed instructions, reference materials, or submission guidelines..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between border-t border-[#D4A373]/15 pt-4 mt-4 bg-white shrink-0">
            <p className="text-[11px] text-[#918A82] font-medium">
              Fields marked <span className="text-rose-500">*</span> are
              required.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleBack}
                className="px-4 py-2 text-xs font-semibold text-[#6E675F] hover:text-[#4A443A] border border-[#D4A373]/25 hover:bg-[#FAEDCD] rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#CCD5AE] hover:bg-[#b6bf96] disabled:bg-[#918A82] text-[#4A443A] text-xs font-bold tracking-wide rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 min-w-[150px] justify-center cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Create Assignment"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Global Footer */}
        <div className="px-6 py-2.5 bg-[#FAEDCD]/50 border-t border-[#D4A373]/15 flex items-center justify-between text-[10px] text-[#918A82] font-medium shrink-0">
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

export default AddAssignment;
