import React from "react";
import Login from "./pages/Login";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FacultyRoute } from "./utils/FacultyRoute";
import { PublicRoute } from "./utils/PublicRoute";
import ResetPassword from "./pages/ResetPassword";
import SendResetOtp from "./pages/SendResetOtp";
import Dashboard from "./pages/Dashboard";
import AddAssignment from "./pages/AddAssignment";
import EditAssignment from "./pages/EditAssignment";
import StudentList from "./pages/StudentList";
import Admin from "./pages/Admin";
import { AdminRoute } from "./utils/AdminRoute";
const App = () => {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        {/* public route but restricted when logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />}></Route>
        </Route>

        <Route path="/forgot-password" element={<SendResetOtp />}></Route>
        <Route path="/reset-password" element={<ResetPassword />}></Route>
        
        {/* faculty-only routes — admins are redirected to /admin */}
        <Route element={<FacultyRoute />}>
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route path="/dashboard/:assignmentId" element={<StudentList />}></Route>
          <Route path="/addAssignment" element={<AddAssignment />}></Route>
          <Route path="/edit-assignment/:id" element={<EditAssignment />}></Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />}></Route>
        </Route>

      </Routes>
    </div>
  );
};

export default App;
