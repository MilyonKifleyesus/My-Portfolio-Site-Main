import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Test environment variables
const MONGODB_URI =
  "mongodb+srv://millikifleyesus:UDJRZCy8oZEnl20h@web.pdksjp4.mongodb.net/portfolio";
const JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production";

// Test the MongoDB connection
async function testMongoDBConnection() {
  try {
    console.log("🔌 Testing MongoDB connection...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully!");

    // Test Contact schema
    const contactSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true },
      message: { type: String, required: true },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    });

    const Contact = mongoose.model("Contact", contactSchema);
    console.log("✅ Contact schema created successfully!");

    // Test Admin schema
    const adminSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    });

    const Admin = mongoose.model("Admin", adminSchema);
    console.log("✅ Admin schema created successfully!");

    // Test JWT functionality
    const testPayload = { username: "test", id: "123" };
    const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: "24h" });
    console.log("✅ JWT token generated successfully!");

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ JWT token verified successfully!");
    console.log("   Decoded payload:", decoded);

    // Test bcrypt
    const testPassword = "test123";
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    console.log("✅ Password hashed successfully!");

    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log("✅ Password verification works:", isMatch);

    console.log(
      "\n🎉 All tests passed! Your serverless functions should work correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

// Run the test
testMongoDBConnection();
