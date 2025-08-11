import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://millikifleyesus:UDJRZCy8oZEnl20h@web.pdksjp4.mongodb.net/portfolio";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schemas
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);
const Admin = mongoose.model("Admin", adminSchema);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-this-in-production",
    (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      req.user = user;
      next();
    }
  );
};

// API Routes
// 1. Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", message: "Portfolio backend is running" });
});

// 2. Contact Form Submission
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// 3. Admin Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { username: admin.username, id: admin._id },
      process.env.JWT_SECRET ||
        "your-super-secret-jwt-key-change-this-in-production",
      { expiresIn: "24h" }
    );

    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// 4. Get All Contact Messages (Protected)
app.get("/api/admin/messages", authenticateToken, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// 5. Mark Message as Read (Protected)
app.patch(
  "/api/admin/messages/:id/read",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const message = await Contact.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      );

      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Mark as read error:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  }
);

// 6. Delete Message (Protected)
app.delete("/api/admin/messages/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Contact.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

// 7. Get Dashboard Stats (Protected)
app.get("/api/admin/stats", authenticateToken, async (req, res) => {
  try {
    const totalMessages = await Contact.countDocuments();
    const unreadMessages = await Contact.countDocuments({ read: false });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMessages = await Contact.countDocuments({
      createdAt: { $gte: today },
    });

    res.json({
      totalMessages,
      unreadMessages,
      todayMessages,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Serve static files from the React build
if (process.env.NODE_ENV === "production") {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, "dist")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  if (process.env.NODE_ENV === "production") {
    console.log(`📱 Frontend served from: ${path.join(__dirname, "dist")}`);
  }
});
