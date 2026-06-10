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
import SemesterPromotion from "./SemesterPromotion";

const EMPTY_FORM = {
  name: "",
  enrollment: "",
  classs: "",
  branch: "",
  semester: "1",
  status: "active",
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (semesterFilter) params.semester = semesterFilter;
      if (statusFilter) params.status = statusFilter;

      const { data } = await API.get("/admin/students", { params });
      if (data.success) {
        setStudents(data.students);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [page, search, semesterFilter, statusFilter, refreshKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const openCreateModal = () => {
    setEditingStudent(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      enrollment: student.enrollment,
      classs: student.classs,
      branch: student.branch,
      semester: String(student.semester),
      status: student.status || "active",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        semester: Number(form.semester),
      };

      if (editingStudent) {
        payload.status = form.status;
        const { data } = await API.put(`/admin/students/${editingStudent._id}`, payload);
        if (data.success) {
          toast.success("Student updated successfully");
          setModalOpen(false);
          fetchStudents();
        }
      } else {
        const { data } = await API.post("/admin/students", payload);
        if (data.success) {
          toast.success("Student created successfully");
          setModalOpen(false);
          fetchStudents();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete student ${student.name} (${student.enrollment})? This also removes their submissions.`)) {
      return;
    }

    try {
      const { data } = await API.delete(`/admin/students/${student._id}`);
      if (data.success) {
        toast.success("Student deleted");
        fetchStudents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: tk.textPrimary }}>
            Student Management
          </h2>
          <p style={{ margin: "6px 0 0", color: tk.textSecondary, fontSize: "0.88rem" }}>
            Create, update, and delete student records directly in the database.
          </p>
        </div>
        <ActionButton onClick={openCreateModal}>+ Add Student</ActionButton>
      </div>

      <SemesterPromotion onPromoted={() => setRefreshKey((k) => k + 1)} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name or enrollment..." />
        <select
          value={semesterFilter}
          onChange={(e) => { setSemesterFilter(e.target.value); setPage(1); }}
          style={{ ...inputStyle, maxWidth: 160 }}
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ ...inputStyle, maxWidth: 160 }}
        >
          <option value="active">Active</option>
          <option value="graduated">Graduated</option>
          <option value="all">All Status</option>
        </select>
      </div>

      <TableWrap>
        {loading ? (
          <EmptyState message="Loading students..." />
        ) : students.length === 0 ? (
          <EmptyState message="No students found" />
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Enrollment</th>
                <th style={thStyle}>Class</th>
                <th style={thStyle}>Branch</th>
                <th style={thStyle}>Semester</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td style={tdStyle}>{student.name}</td>
                  <td style={tdStyle}>{student.enrollment}</td>
                  <td style={tdStyle}>{student.classs}</td>
                  <td style={tdStyle}>{student.branch}</td>
                  <td style={tdStyle}>Sem {student.semester}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: student.status === "graduated" ? tk.warning : tk.success,
                        textTransform: "capitalize",
                      }}
                    >
                      {student.status || "active"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, display: "flex", gap: 8 }}>
                    <ActionButton variant="ghost" onClick={() => openEditModal(student)}>Edit</ActionButton>
                    <ActionButton variant="danger" onClick={() => handleDelete(student)}>Delete</ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {modalOpen && (
        <Modal title={editingStudent ? "Edit Student" : "Add Student"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave} style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Enrollment Number</label>
              <input style={inputStyle} required value={form.enrollment} onChange={(e) => setForm({ ...form, enrollment: e.target.value })} />
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
                <label style={labelStyle}>Semester</label>
                <select style={inputStyle} required value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
              {editingStudent && (
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="graduated">Graduated</option>
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <ActionButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</ActionButton>
              <ActionButton type="submit" disabled={saving}>{saving ? "Saving..." : editingStudent ? "Update Student" : "Create Student"}</ActionButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminStudents;
