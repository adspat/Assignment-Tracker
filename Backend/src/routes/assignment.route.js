import express from 'express'
import * as assignmentController from '../controllers/assignment.controller.js'
import userAuth from '../middlewares/userAuth.js';
const assignmentRouter = express.Router();

assignmentRouter.post('/assignment',userAuth,assignmentController.createAssignment)
assignmentRouter.get('/assignment',userAuth,assignmentController.assignmentFacultyWise);
assignmentRouter.put('/assignment/:id',userAuth,assignmentController.updateAssignment);
assignmentRouter.delete('/assignment/:id',userAuth,assignmentController.deleteAssignment);
export default assignmentRouter ;