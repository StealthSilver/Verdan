import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Site from "../models/site.model.js";
import Tree from "../models/tree.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@verdan.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI as string);
    console.log("Connected to MongoDB");

    // Clear all collections
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Site.deleteMany({});
    await Tree.deleteMany({});
    console.log("All collections cleared");

    // Create admin user
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      designation: "System Administrator",
      gender: "other",
    });

    console.log("✅ Admin user created:");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("   ID:", admin._id);

    console.log("\n✅ Database seeded successfully!");
    console.log("\nYou can now:");
    console.log("1. Login with admin@verdan.com / admin123");
    console.log("2. Create sites");
    console.log("3. Add team members");
    console.log("4. Add plants to sites");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
