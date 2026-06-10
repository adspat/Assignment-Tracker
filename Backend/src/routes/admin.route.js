import express from 'express';
import adminAuth from '../middlewares/adminAuth.js';
import {
    getDashboardStats,
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getAllUsers,
    updateUser,
    deleteUser,
    resetUserPassword,
    getAllAssignments,
    updateAssignmentAdmin,
    deleteAssignmentAdmin,
    getSubmissionsByAssignmentAdmin,
    getSemesterPromotionPreview,
    promoteSemesters,
} from '../controllers/admin.controller.js';

const adminRouter = express.Router();

adminRouter.use(adminAuth);

adminRouter.get('/stats', getDashboardStats);

adminRouter.get('/students/semester-promotion/preview', getSemesterPromotionPreview);
adminRouter.post('/students/semester-promotion', promoteSemesters);

adminRouter.get('/students', getAllStudents);
adminRouter.get('/students/:id', getStudentById);
adminRouter.post('/students', createStudent);
adminRouter.put('/students/:id', updateStudent);
adminRouter.delete('/students/:id', deleteStudent);

adminRouter.get('/users', getAllUsers);
adminRouter.put('/users/:id', updateUser);
adminRouter.delete('/users/:id', deleteUser);
adminRouter.put('/users/:id/reset-password', resetUserPassword);

adminRouter.get('/assignments', getAllAssignments);
adminRouter.put('/assignments/:id', updateAssignmentAdmin);
adminRouter.delete('/assignments/:id', deleteAssignmentAdmin);
adminRouter.get('/assignments/:assignmentId/submissions', getSubmissionsByAssignmentAdmin);

export default adminRouter;
