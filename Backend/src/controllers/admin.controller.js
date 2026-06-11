import bcrypt from 'bcrypt';
import userModel from '../model/user.model.js';
import StudentModel from '../model/student.model.js';
import AssignmentModel from '../model/assignment.model.js';
import submissionModel from '../model/submission.model.js';

const VALID_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const VALID_ROLES = ['faculty', 'admin'];

function normalizeStudentPayload(body) {
    return {
        name: body.name?.trim(),
        enrollment: body.enrollment?.trim(),
        classs: body.classs?.toUpperCase().trim(),
        branch: body.branch?.toUpperCase().trim(),
        semester: Number(body.semester),
    };
}

function validateStudentPayload(payload) {
    const { name, enrollment, classs, branch, semester } = payload;

    if (!name || !enrollment || !classs || !branch || !semester) {
        return 'All fields are required (name, enrollment, classs, branch, semester)';
    }

    if (!VALID_SEMESTERS.includes(semester)) {
        return 'Semester must be a number between 1 and 8';
    }

    return null;
}

export async function getDashboardStats(req, res) {
    try {
        const [
            totalStudents,
            activeStudents,
            graduatedStudents,
            totalUsers,
            totalFaculty,
            totalAdmins,
            totalAssignments,
            totalSubmissions,
            submittedCount,
        ] = await Promise.all([
            StudentModel.countDocuments(),
            StudentModel.countDocuments({ status: 'active' }),
            StudentModel.countDocuments({ status: 'graduated' }),
            userModel.countDocuments(),
            userModel.countDocuments({ role: 'faculty' }),
            userModel.countDocuments({ role: 'admin' }),
            AssignmentModel.countDocuments(),
            submissionModel.countDocuments(),
            submissionModel.countDocuments({ status: 'submitted' }),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalStudents,
                activeStudents,
                graduatedStudents,
                totalUsers,
                totalFaculty,
                totalAdmins,
                totalAssignments,
                totalSubmissions,
                submittedCount,
                pendingCount: totalSubmissions - submittedCount,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
        });
    }
}

export async function getAllStudents(req, res) {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const search = req.query.search?.trim() || '';
        const semester = req.query.semester ? Number(req.query.semester) : null;
        const classs = req.query.classs?.toUpperCase().trim();
        const branch = req.query.branch?.toUpperCase().trim();
        const status = req.query.status?.trim();

        const filter = {};

        if (status === 'active' || status === 'graduated') {
            filter.status = status;
        } else if (status !== 'all') {
            filter.status = 'active';
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { enrollment: { $regex: search, $options: 'i' } },
            ];
        }

        if (semester && VALID_SEMESTERS.includes(semester)) {
            filter.semester = semester;
        }

        if (classs) {
            filter.classs = classs;
        }

        if (branch) {
            filter.branch = branch;
        }

        const [students, total] = await Promise.all([
            StudentModel.find(filter)
                .sort({ name: 1 })
                .collation({ locale: 'en', strength: 2 })
                .skip(skip)
                .limit(limit),
            StudentModel.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            students,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch students',
        });
    }
}

export async function getStudentById(req, res) {
    try {
        const student = await StudentModel.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        return res.status(200).json({
            success: true,
            student,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch student',
        });
    }
}

export async function createStudent(req, res) {
    const payload = normalizeStudentPayload(req.body);
    const validationError = validateStudentPayload(payload);

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError,
        });
    }

    try {
        const existingStudent = await StudentModel.findOne({ enrollment: payload.enrollment });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: 'Enrollment number already exists',
            });
        }

        const student = await StudentModel.create(payload);

        return res.status(201).json({
            success: true,
            message: 'Student created successfully',
            student,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create student',
        });
    }
}

export async function updateStudent(req, res) {
    const payload = normalizeStudentPayload(req.body);
    const validationError = validateStudentPayload(payload);

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError,
        });
    }

    try {
        const student = await StudentModel.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        const duplicateEnrollment = await StudentModel.findOne({
            enrollment: payload.enrollment,
            _id: { $ne: student._id },
        });

        if (duplicateEnrollment) {
            return res.status(409).json({
                success: false,
                message: 'Enrollment number already exists',
            });
        }

        const updateData = { ...payload };

        if (req.body.status === 'active' || req.body.status === 'graduated') {
            updateData.status = req.body.status;
            updateData.graduatedAt = req.body.status === 'graduated' ? new Date() : null;
        }

        const updatedStudent = await StudentModel.findByIdAndUpdate(
            student._id,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            student: updatedStudent,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update student',
        });
    }
}

export async function deleteStudent(req, res) {
    try {
        const student = await StudentModel.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        await submissionModel.deleteMany({ studentId: student._id });
        await StudentModel.findByIdAndDelete(student._id);

        return res.status(200).json({
            success: true,
            message: 'Student and related submissions deleted successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete student',
        });
    }
}

export async function getSemesterPromotionPreview(req, res) {
    const mode = req.query.mode === 'all' ? 'all' : 'single';
    const currentSemester = Number(req.query.currentSemester);

    if (mode === 'single' && !VALID_SEMESTERS.includes(currentSemester)) {
        return res.status(400).json({
            success: false,
            message: 'Current semester must be between 1 and 8',
        });
    }

    try {
        if (mode === 'all') {
            const [promotedCounts, graduateCount] = await Promise.all([
                StudentModel.aggregate([
                    { $match: { status: 'active', semester: { $gte: 1, $lte: 7 } } },
                    { $group: { _id: '$semester', count: { $sum: 1 } } },
                    { $sort: { _id: 1 } },
                ]),
                StudentModel.countDocuments({ status: 'active', semester: 8 }),
            ]);

            const breakdown = promotedCounts.map((row) => ({
                fromSemester: row._id,
                toSemester: row._id + 1,
                count: row.count,
            }));

            const totalPromoted = breakdown.reduce((sum, row) => sum + row.count, 0);

            return res.status(200).json({
                success: true,
                preview: {
                    mode: 'all',
                    totalPromoted,
                    totalGraduated: graduateCount,
                    breakdown,
                    graduateBreakdown: graduateCount > 0
                        ? [{ fromSemester: 8, count: graduateCount, action: 'graduated' }]
                        : [],
                },
            });
        }

        const activeCount = await StudentModel.countDocuments({
            status: 'active',
            semester: currentSemester,
        });

        const preview = {
            mode: 'single',
            currentSemester,
            activeCount,
        };

        if (currentSemester === 8) {
            preview.action = 'graduate';
            preview.totalGraduated = activeCount;
            preview.totalPromoted = 0;
            preview.message = `${activeCount} student(s) in semester 8 will be marked as graduated`;
        } else {
            preview.action = 'promote';
            preview.totalPromoted = activeCount;
            preview.totalGraduated = 0;
            preview.nextSemester = currentSemester + 1;
            preview.message = `${activeCount} student(s) will move from semester ${currentSemester} to ${currentSemester + 1}`;
        }

        return res.status(200).json({
            success: true,
            preview,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate promotion preview',
        });
    }
}

export async function promoteSemesters(req, res) {
    const mode = req.body.mode === 'all' ? 'all' : 'single';
    const currentSemester = Number(req.body.currentSemester);

    if (mode === 'single' && !VALID_SEMESTERS.includes(currentSemester)) {
        return res.status(400).json({
            success: false,
            message: 'Current semester must be between 1 and 8',
        });
    }

    try {
        if (mode === 'all') {
            const [promoteResult, graduateResult] = await Promise.all([
                StudentModel.updateMany(
                    { status: 'active', semester: { $gte: 1, $lte: 7 } },
                    { $inc: { semester: 1 } }
                ),
                StudentModel.updateMany(
                    { status: 'active', semester: 8 },
                    { $set: { status: 'graduated', graduatedAt: new Date() } }
                ),
            ]);

            return res.status(200).json({
                success: true,
                message: 'All active students promoted successfully',
                result: {
                    mode: 'all',
                    promoted: promoteResult.modifiedCount,
                    graduated: graduateResult.modifiedCount,
                },
            });
        }

        const filter = { status: 'active', semester: currentSemester };
        const affectedCount = await StudentModel.countDocuments(filter);

        if (affectedCount === 0) {
            return res.status(404).json({
                success: false,
                message: `No active students found in semester ${currentSemester}`,
            });
        }

        if (currentSemester === 8) {
            const result = await StudentModel.updateMany(filter, {
                $set: { status: 'graduated', graduatedAt: new Date() },
            });

            return res.status(200).json({
                success: true,
                message: `${result.modifiedCount} semester 8 student(s) marked as graduated`,
                result: {
                    mode: 'single',
                    currentSemester,
                    promoted: 0,
                    graduated: result.modifiedCount,
                },
            });
        }

        const result = await StudentModel.updateMany(filter, {
            $inc: { semester: 1 },
        });

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} student(s) promoted from semester ${currentSemester} to ${currentSemester + 1}`,
            result: {
                mode: 'single',
                currentSemester,
                nextSemester: currentSemester + 1,
                promoted: result.modifiedCount,
                graduated: 0,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to promote semesters',
        });
    }
}

export async function createUser(req, res) {
    const username = req.body.username?.trim();
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password;
    const role = req.body.role?.trim() || 'faculty';

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username, email, and password are required',
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters',
        });
    }

    if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Role must be faculty or admin',
        });
    }

    try {
        const existingUser = await userModel.findOne({
            $or: [{ username }, { email }],
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
            role,
            isAccountVerified: true,
            isLoggedIn: false,
        });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isAccountVerified: user.isAccountVerified,
                isLoggedIn: user.isLoggedIn,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create user',
        });
    }
}

export async function getAllUsers(req, res) {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const search = req.query.search?.trim() || '';
        const role = req.query.role?.trim();

        const filter = {};

        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        if (role && VALID_ROLES.includes(role)) {
            filter.role = role;
        }

        const [users, total] = await Promise.all([
            userModel
                .find(filter)
                .select('-password -verifyOtp -resetOtp')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            userModel.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
        });
    }
}

export async function updateUser(req, res) {
    const { username, email, role, isAccountVerified } = req.body;

    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user._id.toString() === req.userId && role && role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'You cannot demote your own admin account',
            });
        }

        if (role && !VALID_ROLES.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role',
            });
        }

        if (username) {
            const duplicateUsername = await userModel.findOne({
                username: username.trim(),
                _id: { $ne: user._id },
            });

            if (duplicateUsername) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists',
                });
            }

            user.username = username.trim();
        }

        if (email) {
            const duplicateEmail = await userModel.findOne({
                email: email.toLowerCase().trim(),
                _id: { $ne: user._id },
            });

            if (duplicateEmail) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists',
                });
            }

            user.email = email.toLowerCase().trim();
        }

        if (role) {
            user.role = role;
        }

        if (typeof isAccountVerified === 'boolean') {
            user.isAccountVerified = isAccountVerified;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isAccountVerified: user.isAccountVerified,
                isLoggedIn: user.isLoggedIn,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user',
        });
    }
}

export async function deleteUser(req, res) {
    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user._id.toString() === req.userId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account while logged in',
            });
        }

        await AssignmentModel.deleteMany({ createdBy: user._id });
        await userModel.findByIdAndDelete(user._id);

        return res.status(200).json({
            success: true,
            message: 'User and their assignments deleted successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete user',
        });
    }
}

export async function resetUserPassword(req, res) {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters',
        });
    }

    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reset password',
        });
    }
}

export async function getAllAssignments(req, res) {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const search = req.query.search?.trim() || '';

        const filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { classs: { $regex: search, $options: 'i' } },
                { branch: { $regex: search, $options: 'i' } },
            ];
        }

        const [assignments, total] = await Promise.all([
            AssignmentModel.find(filter)
                .populate('createdBy', 'username email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            AssignmentModel.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            assignments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch assignments',
        });
    }
}

export async function updateAssignmentAdmin(req, res) {
    const {
        title,
        description,
        classs,
        subject,
        branch,
        submissionDate,
        semester,
        session,
    } = req.body;

    if (!title || !classs || !subject || !branch || !submissionDate || !semester) {
        return res.status(400).json({
            success: false,
            message: 'All required fields must be provided',
        });
    }

    if (!VALID_SEMESTERS.includes(Number(semester))) {
        return res.status(400).json({
            success: false,
            message: 'Semester must be between 1 and 8',
        });
    }

    try {
        const assignment = await AssignmentModel.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        const updatedAssignment = await AssignmentModel.findByIdAndUpdate(
            assignment._id,
            {
                title: title.trim(),
                description: description?.trim() || '',
                classs: classs.toUpperCase().trim(),
                subject: subject.trim(),
                branch: branch.toUpperCase().trim(),
                submissionDate,
                semester: Number(semester),
                ...(session ? { session: session.trim() } : {}),
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'username email role');

        return res.status(200).json({
            success: true,
            message: 'Assignment updated successfully',
            assignment: updatedAssignment,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update assignment',
        });
    }
}

export async function deleteAssignmentAdmin(req, res) {
    try {
        const assignment = await AssignmentModel.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        await submissionModel.deleteMany({ assignmentId: assignment._id });
        await AssignmentModel.findByIdAndDelete(assignment._id);

        return res.status(200).json({
            success: true,
            message: 'Assignment and related submissions deleted successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete assignment',
        });
    }
}

export async function getSubmissionsByAssignmentAdmin(req, res) {
    try {
        const { assignmentId } = req.params;

        const assignment = await AssignmentModel.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        const submissions = await submissionModel
            .find({ assignmentId })
            .populate('studentId', 'name enrollment classs branch semester');

        submissions.sort((a, b) =>
            (a.studentId?.name || '').localeCompare(b.studentId?.name || '', 'en', { sensitivity: 'base' })
        );

        return res.status(200).json({
            success: true,
            submissions,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch submissions',
        });
    }
}
