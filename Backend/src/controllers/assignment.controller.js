import AssignmentModel from "../model/assignment.model.js";
import StudentModel from "../model/student.model.js";
import submissionModel from "../model/submission.model.js";
import { getCurrentSession } from "../utils/getCurrentSession.js";

export async function createAssignment(req, res) {
  const {
    title,
    description,
    classs,
    subject,
    branch,
    submissionDate,
    semester,
  } = req.body;
  const createdBy = req.userId;
  if (
    !createdBy ||
    !title ||
    !classs ||
    !subject ||
    !branch ||
    !submissionDate ||
    !semester
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }
  const cls = classs.toUpperCase();
  const br = branch.toUpperCase();

  try {


    const existingAssignment = await AssignmentModel.findOne({
      createdBy,
      title,
      semester,
      description,
      classs: cls,
      session: getCurrentSession(),
      subject,
      branch: br,
      submissionDate,
    });
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "Assignment already exist"
      })
    }

    const newAssignment = await AssignmentModel.create({
      createdBy,
      title,
      semester,
      description,
      classs: cls,
      session: getCurrentSession(),
      subject,
      branch: br,
      submissionDate,
    });


    const students = await StudentModel.find({
      classs: cls,
      branch: br,
      semester,
      status: 'active',
    });
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Students not found",
      });
    }

    const submissions = students.map((student) => ({
      studentId: student._id,
      assignmentId: newAssignment._id,
    }));

    try {
      await submissionModel.insertMany(submissions);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Failed to insert submision"
      })
    }

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: newAssignment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating assignment",
      error: error.message,
    });
  }
}

export async function assignmentFacultyWise(req, res) {
  const createdBy = req.userId;
  if (!createdBy) {
    return res.status(400).json({
      success: false,
      message: "Please login first",
    });
  }
  try {
    const assignments = await AssignmentModel.find({
      createdBy,
    });
    if (assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Assignments not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Assignments fetched successfully",
      assignments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in fetching the assignments",
    });
  }
}

export async function updateAssignment(req, res) {
  const { id } = req.params;
  const createdBy = req.userId;
  const {
    title,
    description,
    classs,
    subject,
    branch,
    submissionDate,
    semester,
  } = req.body;

  if (
    !title ||
    !classs ||
    !subject ||
    !branch ||
    !submissionDate ||
    !semester
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const assignment = await AssignmentModel.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (assignment.createdBy.toString() !== createdBy) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this assignment",
      });
    }

    const cls = classs.toUpperCase();
    const br = branch.toUpperCase();

    const updatedAssignment = await AssignmentModel.findByIdAndUpdate(
      id,
      {
        title,
        semester,
        description,
        classs: cls,
        subject,
        branch: br,
        submissionDate,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: updatedAssignment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating assignment",
      error: error.message,
    });
  }
}

export async function deleteAssignment(req, res) {
  const { id } = req.params;
  const createdBy = req.userId;

  try {
    const assignment = await AssignmentModel.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (assignment.createdBy.toString() !== createdBy) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this assignment",
      });
    }

    // Delete the assignment
    await AssignmentModel.findByIdAndDelete(id);

    // Also delete all submissions related to this assignment
    await submissionModel.deleteMany({ assignmentId: id });

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting assignment",
      error: error.message,
    });
  }
}
