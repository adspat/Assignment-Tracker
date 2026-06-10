import bcrypt from 'bcrypt';
import config from '../config/config.js';
import userModel from '../model/user.model.js';
import StudentModel from '../model/student.model.js';

export async function migrateStudents() {
    await StudentModel.updateMany(
        { status: { $exists: false } },
        { $set: { status: 'active' } }
    );
}

export async function seedAdmin() {
    if (!config.ADMIN_EMAIL || !config.ADMIN_PASSWORD) {
        return;
    }

    const existingAdmin = await userModel.findOne({ role: 'admin' });
    if (existingAdmin) {
        return;
    }

    const hashedPassword = await bcrypt.hash(config.ADMIN_PASSWORD, 10);

    await userModel.create({
        username: config.ADMIN_USERNAME,
        email: config.ADMIN_EMAIL.toLowerCase().trim(),
        password: hashedPassword,
        role: 'admin',
        isAccountVerified: true,
        isLoggedIn: false,
    });

    console.log(`Admin account seeded for ${config.ADMIN_EMAIL}`);
}
