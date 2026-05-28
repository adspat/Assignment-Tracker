
import express from "express";
import {
  getSubmissionsByAssignment,
  markAsSubmitted,
  unmarkAsSubmitted,
} from "../controllers/submission.controller.js";

const submissionRouter = express.Router();

// Get all students for an assignment
submissionRouter.get("/:assignmentId", getSubmissionsByAssignment);

// Mark submitted
submissionRouter.put("/submit/:submissionId", markAsSubmitted);

// Unmark submitted
submissionRouter.put("/unsubmit/:submissionId", unmarkAsSubmitted);

export default submissionRouter;