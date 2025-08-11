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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Authenticate token for all methods
    const user = authenticateToken(req);

    // Ensure MongoDB connection
    if (!Contact) {
      await mongoose.connect(MONGODB_URI);
      Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
    }

    // GET - Fetch all messages
    if (req.method === 'GET') {
      const messages = await Contact.find().sort({ createdAt: -1 });
      res.json({ success: true, messages });
      return;
    }

    // PATCH - Mark message as read
    if (req.method === 'PATCH') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'Message ID required' });
      }

      const message = await Contact.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      );

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      res.json({ success: true, message: 'Message marked as read' });
      return;
    }

    // DELETE - Delete message
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'Message ID required' });
      }

      const message = await Contact.findByIdAndDelete(id);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      res.json({ success: true, message: 'Message deleted successfully' });
      return;
    }

    // Method not allowed
    res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Admin messages error:', error);
    
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
      message: 'Operation failed. Please try again.' 
    });
  }
}
