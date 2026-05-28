import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    classs: {
      type: String,
      required: true,
      trim: true,
    },
    session: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    submissionDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const AssignmentModel = mongoose.model("Assignment", assignmentSchema);

export default AssignmentModel;
