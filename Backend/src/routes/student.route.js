import express from 'express';
import { addStudent, getBranches, getSections } from '../controllers/student.controller.js';
import adminAuth from '../middlewares/adminAuth.js';
import userAuth from '../middlewares/userAuth.js';

const studentRouter = express.Router();

studentRouter.get('/branches', userAuth, getBranches);
studentRouter.get('/sections', userAuth, getSections);
studentRouter.post('/add', adminAuth, addStudent);

export default studentRouter;
