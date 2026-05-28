// models/submission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "submitted"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);


submissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);