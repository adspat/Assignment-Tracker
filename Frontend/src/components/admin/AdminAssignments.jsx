import React, { useCallback, useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import { tk, inputStyle, labelStyle } from "../../constants/adminTheme";
import {
  ActionButton,
  EmptyState,
  Modal,
  Pagination,
  SearchInput,
  TableWrap,
  tableStyle,
  tdStyle,
  thStyle,
} from "./AdminShared";

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editModal, setEditModal] = useState(null);
  const [submissionsModal, setSubmissionsModal] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();

      const { data } = await API.get("/admin/assignments", { params });
      if (data.success) {
        setAssignments(data.assignments);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAssignments(), 300);
    return () => clearTimeout(timer);
  }, [fetchAssignments]);

  const openEditModal = (assignment) => {
    setEditModal(assignment);
    setForm({
      title: assignment.title,
      description: assignment.description || "",
      classs: assignment.classs,
      branch: assignment.branch,
      subject: assignment.subject,
      semester: String(assignment.semester),
      session: assignment.session,
      submissionDate: assignment.submissionDate?.slice(0, 10) || "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editModal) return;

    setSaving(true);
    try {
      const { data } = await API.put(`/admin/assignments/${editModal._id}`, {
        ...form,
        semester: Number(form.semester),
      });
      if (data.success) {
        toast.success("Assignment updated");
        setEditModal(null);
        fetchAssignments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Delete assignment "${assignment.title}"? All related submissions will be removed.`)) {
      return;
    }

    try {
      const { data } = await API.delete(`/admin/assignments/${assignment._id}`);
      if (data.success) {
        toast.success("Assignment deleted");
        fetchAssignments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete assignment");
    }
  };

  const viewSubmissions = async (assignment) => {
    setSubmissionsModal(assignment);
    setSubmissionsLoading(true);
    try {
      const { data } = await API.get(`/admin/assignments/${assignment._id}/submissions`);
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: tk.textPrimary }}>
          Assignment Management
        </h2>
        <p style={{ margin: "6px 0 0", color: tk.textSecondary, fontSize: "0.88rem" }}>
          View and manage all assignments across faculty accounts.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search title, subject, class, branch..." />
      </div>

      <TableWrap>
        {loading ? (
          <EmptyState message="Loading assignments..." />
        ) : assignments.length === 0 ? (
          <EmptyState message="No assignments found" />
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Class / Branch</th>
                <th style={thStyle}>Semester</th>
                <th style={thStyle}>Created By</th>
                <th style={thStyle}>Due Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment._id}>
                  <td style={tdStyle}>{assignment.title}</td>
                  <td style={tdStyle}>{assignment.subject}</td>
                  <td style={tdStyle}>{assignment.classs} / {assignment.branch}</td>
                  <td style={tdStyle}>Sem {assignment.semester}</td>
                  <td style={tdStyle}>{assignment.createdBy?.username || "—"}</td>
                  <td style={tdStyle}>{new Date(assignment.submissionDate).toLocaleDateString()}</td>
                  <td style={{ ...tdStyle, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <ActionButton variant="ghost" onClick={() => viewSubmissions(assignment)}>Submissions</ActionButton>
                    <ActionButton variant="ghost" onClick={() => openEditModal(assignment)}>Edit</ActionButton>
                    <ActionButton variant="danger" onClick={() => handleDelete(assignment)}>Delete</ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {editModal && (
        <Modal title={`Edit Assignment — ${editModal.title}`} onClose={() => setEditModal(null)} width={600}>
          <form onSubmit={handleSave} style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input style={inputStyle} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Class</label>
                <input style={inputStyle} required value={form.classs} onChange={(e) => setForm({ ...form, classs: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Branch</label>
                <input style={inputStyle} required value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <input style={inputStyle} required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Semester</label>
                <select style={inputStyle} required value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Session</label>
                <input style={inputStyle} value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Submission Date</label>
                <input type="date" style={inputStyle} required value={form.submissionDate} onChange={(e) => setForm({ ...form, submissionDate: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <ActionButton variant="ghost" onClick={() => setEditModal(null)}>Cancel</ActionButton>
              <ActionButton type="submit" disabled={saving}>{saving ? "Saving..." : "Update Assignment"}</ActionButton>
            </div>
          </form>
        </Modal>
      )}

      {submissionsModal && (
        <Modal title={`Submissions — ${submissionsModal.title}`} onClose={() => setSubmissionsModal(null)} width={720}>
          {submissionsLoading ? (
            <EmptyState message="Loading submissions..." />
          ) : submissions.length === 0 ? (
            <EmptyState message="No submissions for this assignment" />
          ) : (
            <TableWrap>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Student</th>
                    <th style={thStyle}>Enrollment</th>
                    <th style={thStyle}>Class</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub._id}>
                      <td style={tdStyle}>{sub.studentId?.name || "—"}</td>
                      <td style={tdStyle}>{sub.studentId?.enrollment || "—"}</td>
                      <td style={tdStyle}>{sub.studentId?.classs} / Sem {sub.studentId?.semester}</td>
                      <td style={tdStyle}>
                        <span style={{ color: sub.status === "submitted" ? tk.success : tk.warning, fontWeight: 700, textTransform: "capitalize" }}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Modal>
      )}
    </div>
  );
};

export default AdminAssignments;
