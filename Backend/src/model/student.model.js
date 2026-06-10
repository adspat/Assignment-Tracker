import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    enrollment: {
      type: String,
      required: true,
      unique: true, 
      trim: true,
    },

    classs: {
      type: String,
      required: true,
      trim: true,
    },

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5, 6, 7, 8],
    },

    status: {
      type: String,
      enum: ["active", "graduated"],
      default: "active",
    },

    graduatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for filtering students by class and semester
studentSchema.index({ classs: 1, semester: 1 });
studentSchema.index({ status: 1, semester: 1 });

const StudentModel = mongoose.model("student", studentSchema);

export default StudentModel;