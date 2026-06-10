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

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;

      const { data } = await API.get("/admin/users", { params });
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const updateUser = async (userId, payload, successMessage) => {
    try {
      const { data } = await API.put(`/admin/users/${userId}`, payload);
      if (data.success) {
        toast.success(successMessage);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleRoleChange = (user, role) => {
    updateUser(user._id, { role }, `Role updated to ${role}`);
  };

  const handleVerifyToggle = (user) => {
    updateUser(user._id, { isAccountVerified: !user.isAccountVerified }, "Verification status updated");
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.username}? Their assignments will also be removed.`)) {
      return;
    }

    try {
      const { data } = await API.delete(`/admin/users/${user._id}`);
      if (data.success) {
        toast.success("User deleted");
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModal) return;

    setSaving(true);
    try {
      const { data } = await API.put(`/admin/users/${resetModal._id}/reset-password`, { newPassword });
      if (data.success) {
        toast.success("Password reset successfully");
        setResetModal(null);
        setNewPassword("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: tk.textPrimary }}>
          User Management
        </h2>
        <p style={{ margin: "6px 0 0", color: tk.textSecondary, fontSize: "0.88rem" }}>
          Manage faculty and admin accounts, roles, and verification status.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search username or email..." />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          style={{ ...inputStyle, maxWidth: 160 }}
        >
          <option value="">All Roles</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <TableWrap>
        {loading ? (
          <EmptyState message="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Verified</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td style={tdStyle}>{user.username}</td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      style={{ ...inputStyle, padding: "6px 10px", fontSize: "0.75rem", maxWidth: 120 }}
                    >
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <ActionButton variant={user.isAccountVerified ? "success" : "ghost"} onClick={() => handleVerifyToggle(user)}>
                      {user.isAccountVerified ? "Verified" : "Unverified"}
                    </ActionButton>
                  </td>
                  <td style={{ ...tdStyle, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <ActionButton variant="ghost" onClick={() => { setResetModal(user); setNewPassword(""); }}>
                      Reset Password
                    </ActionButton>
                    <ActionButton variant="danger" onClick={() => handleDelete(user)}>Delete</ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {resetModal && (
        <Modal title={`Reset Password — ${resetModal.username}`} onClose={() => setResetModal(null)}>
          <form onSubmit={handleResetPassword} style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                style={inputStyle}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <ActionButton variant="ghost" onClick={() => setResetModal(null)}>Cancel</ActionButton>
              <ActionButton type="submit" disabled={saving}>{saving ? "Saving..." : "Reset Password"}</ActionButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsers;
