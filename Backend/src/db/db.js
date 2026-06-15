import mongoose from "mongoose";
import config from "../config/config.js";
import { migrateStudents, seedAdmin } from "../utils/seedAdmin.js";

async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("connected to db");
        await migrateStudents();
        await seedAdmin();
    } catch (error) {
        console.error("Database connection or seeding failed: ", error);
        throw error;
    }
}

export default connectDB;