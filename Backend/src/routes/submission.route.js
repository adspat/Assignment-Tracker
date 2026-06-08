
import express from "express";
import {
  getSubmissionsByAssignment,
  markAsSubmitted,
  unmarkAsSubmitted,
  addSubmissionByAssignment,
} from "../controllers/submission.controller.js";

const submissionRouter = express.Router();


// Add submission for assignment
submissionRouter.post("/add/:assignmentId", addSubmissionByAssignment);

// Get all students for an assignment
submissionRouter.get("/:assignmentId", getSubmissionsByAssignment);

// Mark submitted
submissionRouter.put("/submit/:submissionId", markAsSubmitted);

// Unmark submitted
submissionRouter.put("/unsubmit/:submissionId", unmarkAsSubmitted);

export default submissionRouter;