import mongoose from "mongoose";

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
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Ensure MongoDB connection
    if (!Contact) {
      await mongoose.connect(MONGODB_URI);
      Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
    }

    // Create and save contact message
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(201).json({ 
      success: true,
      message: 'Message sent successfully!' 
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    
    // Handle MongoDB connection errors gracefully
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        message: 'Service temporarily unavailable. Please try again later.' 
      });
    }

    res.status(500).json({ 
      message: 'Failed to send message. Please try again.' 
    });
  }
}
