import express from 'express';
import { addStudent } from '../controllers/student.controller.js';
import adminAuth from '../middlewares/adminAuth.js';

const studentRouter = express.Router();

studentRouter.post('/add', adminAuth, addStudent);

export default studentRouter;
