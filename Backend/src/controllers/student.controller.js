import StudentModel from "../model/student.model.js";

export async function getBranches(req, res) {
    try {
        const branches = await StudentModel.distinct("branch", { status: "active" });
        const sorted = branches
            .map((b) => b?.trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        return res.status(200).json({
            success: true,
            branches: sorted,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch branches",
            error: error.message,
        });
    }
}

export async function getSections(req, res) {
    const branch = req.query.branch?.toUpperCase().trim();

    if (!branch) {
        return res.status(400).json({
            success: false,
            message: "Branch query parameter is required",
        });
    }

    try {
        const sections = await StudentModel.distinct("classs", {
            status: "active",
            branch,
        });
        const sorted = sections
            .map((s) => s?.trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        return res.status(200).json({
            success: true,
            sections: sorted,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch sections",
            error: error.message,
        });
    }
}

export async function addStudent(req, res) {
    const { name, enrollment, classs, branch, semester } = req.body;

    if (!name || !enrollment || !classs || !branch || !semester) {
        return res.status(400).json({
            success: false,
            message: "All fields are required (name, enrollment, classs, branch, semester)",
        });
    }

 
    if (![1, 2, 3, 4, 5, 6, 7, 8].includes(Number(semester))) {
        return res.status(400).json({
            success: false,
            message: "Semester must be a number between 1 and 8",
        });
    }

    try {
    
        const existingStudent = await StudentModel.findOne({ enrollment });
        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "Enrollment number already exists",
            });
        }


        const newStudent = await StudentModel.create({
            name: name.trim(),
            enrollment: enrollment.trim(),
            classs: classs.toUpperCase().trim(),
            branch: branch.toUpperCase().trim(),
            semester: Number(semester),
        });

        return res.status(201).json({
            success: true,
            message: "Student added successfully",
            data: newStudent,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error adding student",
            error: error.message,
        });
    }
}
