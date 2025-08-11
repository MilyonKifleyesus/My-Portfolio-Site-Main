import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://millikifleyesus:UDJRZCy8oZEnl20h@web.pdksjp4.mongodb.net/portfolio";

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Connect to MongoDB
let Admin;
try {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
  Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
} catch (error) {
  console.error("MongoDB connection error:", error);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Ensure MongoDB connection
    if (!Admin) {
      await mongoose.connect(MONGODB_URI);
      Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
    }

    // Find admin user
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: admin.username, id: admin._id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true,
      token, 
      message: 'Login successful' 
    });

  } catch (error) {
    console.error('Admin login error:', error);
    
    // Handle MongoDB connection errors gracefully
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        message: 'Service temporarily unavailable. Please try again later.' 
      });
    }

    res.status(500).json({ 
      message: 'Login failed. Please try again.' 
    });
  }
}
