
import express from "express";
import {
  getSubmissionsByAssignment,
  markAsSubmitted,
  unmarkAsSubmitted,
  addSubmissionByAssignment,
} from "../controllers/submission.controller.js";
import userAuth from '../middlewares/userAuth.js'
const submissionRouter = express.Router();


// Add submission for assignment
submissionRouter.post("/add/:assignmentId",userAuth, addSubmissionByAssignment);

// Get all students for an assignment
submissionRouter.get("/:assignmentId",userAuth, getSubmissionsByAssignment);

// Mark submitted
submissionRouter.put("/submit/:submissionId",userAuth, markAsSubmitted);

// Unmark submitted
submissionRouter.put("/unsubmit/:submissionId",userAuth, unmarkAsSubmitted);

export default submissionRouter;