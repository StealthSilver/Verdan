import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/verdan";
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ||
  process.env.MASTER_ADMIN_EMAIL ||
  "admin@verdan.com";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || process.env.MASTER_ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Master Admin";

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Admin user details (prefer env vars)
    const adminEmail = ADMIN_EMAIL;
    const adminPassword = ADMIN_PASSWORD;
    const adminName = ADMIN_NAME;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email:", existingAdmin.email);
      console.log("Name:", existingAdmin.name);
      console.log("Role:", existingAdmin.role);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      designation: "System Administrator",
      gender: "other",
    });

    console.log("Admin user created successfully!");
    console.log("Email:", admin.email);
    console.log("Password:", adminPassword);
    console.log("Name:", admin.name);
    console.log("Role:", admin.role);
    console.log("ID:", (admin as any)._id.toString());

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error creating admin user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();
