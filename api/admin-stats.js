import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://millikifleyesus:UDJRZCy8oZEnl20h@web.pdksjp4.mongodb.net/portfolio";

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Connect to MongoDB
let Contact;
try {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
  Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
} catch (error) {
  console.error("MongoDB connection error:", error);
}

// JWT Authentication Middleware
const authenticateToken = (req) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Access token required");
  }

  try {
    const user = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
    );
    return user;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Authenticate token
    const user = authenticateToken(req);

    // Ensure MongoDB connection
    if (!Contact) {
      await mongoose.connect(MONGODB_URI);
      Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
    }

    // Calculate stats
    const totalMessages = await Contact.countDocuments();
    const unreadMessages = await Contact.countDocuments({ read: false });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMessages = await Contact.countDocuments({
      createdAt: { $gte: today }
    });

    res.json({
      success: true,
      totalMessages,
      unreadMessages,
      todayMessages
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    
    // Handle authentication errors
    if (error.message === 'Access token required' || error.message === 'Invalid or expired token') {
      return res.status(401).json({ message: error.message });
    }

    // Handle MongoDB connection errors gracefully
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        message: 'Service temporarily unavailable. Please try again later.' 
      });
    }

    res.status(500).json({ 
      message: 'Failed to fetch stats. Please try again.' 
    });
  }
}
