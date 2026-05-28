import StudentModel from "../model/student.model.js";

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
