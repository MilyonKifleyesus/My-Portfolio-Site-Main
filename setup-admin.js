import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./config.env" });

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://millikifleyesus:UDJRZCy8oZEnl20h@web.pdksjp4.mongodb.net/portfolio";

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", adminSchema);

// Setup admin account
const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log("❌ Admin account already exists");
      console.log("Username:", existingAdmin.username);
      console.log("Created:", existingAdmin.createdAt);
      process.exit(0);
    }

    // Create admin account
    const adminUsername = "admin"; // Change this to your preferred username
    const adminPassword = "admin123"; // Change this to your preferred password

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const newAdmin = new Admin({
      username: adminUsername,
      password: hashedPassword,
    });

    await newAdmin.save();

    console.log("✅ Admin account created successfully!");
    console.log("Username:", adminUsername);
    console.log("Password:", adminPassword);
    console.log("\n⚠️  IMPORTANT: Change these credentials after first login!");
    console.log("\n🔐 You can now login at: http://localhost:5173/admin");
  } catch (error) {
    console.error("❌ Error setting up admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run setup
setupAdmin();
