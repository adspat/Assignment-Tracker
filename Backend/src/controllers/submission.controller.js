import submissionModel from "../model/submission.model.js";
import StudentModel from "../model/student.model.js";

export const addSubmissionByAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const { enrollment } = req.body;
  ``;
  if (!assignmentId || !enrollment) {
    return res.status(400).json({
      success: false,
      message: "Enrollment and AssignmentId required",
    });
  }
  try {
    const student = await StudentModel.findOne({ enrollment });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Student not found",
      });
    }

    const submission = await submissionModel.create({
      studentId: student._id,
      assignmentId,
      status: "submitted",
    });

    res.status(201).json({
      success: true,
      message: "Submission created",
      submission,
    });
  } catch (error) {  
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Student already exist!",
      });
    }
    res.status(500).json({
      sucess: false,
      message: "Error while creating submission",
    });
  }
};

export const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await submissionModel
      .find({ assignmentId })
      .populate("studentId");

    res.json({
      success: true,
      data: submissions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const markAsSubmitted = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await submissionModel.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (submission.status === "submitted") {
      return res.status(200).json({
        success: true,
        message: "Already submitted",
        data: submission,
      });
    }

    submission.status = "submitted";
    submission.submittedAt = new Date();

    await submission.save();

    res.json({
      success: true,
      message: "Marked as submitted",
      data: submission,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unmarkAsSubmitted = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await submissionModel.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (submission.status === "pending") {
      return res.status(200).json({
        success: true,
        message: "Already pending",
        data: submission,
      });
    }

    submission.status = "pending";
    submission.submittedAt = null;

    await submission.save();

    res.json({
      success: true,
      message: "Unmarked from submitted",
      data: submission,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
