import mongoose from "mongoose";
import config from "../config/config.js";
import { migrateStudents, seedAdmin } from "../utils/seedAdmin.js";

async function connectDB() {
    await mongoose.connect(config.MONGO_URI);
    console.log("connected to db");
    await migrateStudents();
    await seedAdmin();
}

export default connectDB;