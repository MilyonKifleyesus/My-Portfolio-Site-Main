import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Trash2,
  Eye,
  Mail,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Silk from "../components/Silk";
import { getMessages, deleteMessage, getDashboardStats } from "../services/api";

const glassStyle = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin");
      return;
    }

    // Load messages from API
    loadMessages();
    loadStats();
  }, [navigate]);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await getMessages(token);
      setMessages(response.messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await getDashboardStats(token);
      // Stats are calculated from messages, so we don't need to store them separately
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const handleDeleteMessage = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await deleteMessage(id, token);

      // Remove from local state
      const updatedMessages = messages.filter((msg) => msg._id !== id);
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const openMessage = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  return (
    <div className="min-h-screen relative">
      <Silk
        speed={5}
        scale={1}
        color="#7B7481"
        noiseIntensity={1.5}
        rotation={0}
      />
      <div className="pt-20 pb-10">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 text-transparent bg-clip-text">
                Admin Dashboard
              </h1>
              <p className="text-indigo-200 mt-2">
                Manage your contact form submissions
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            <div className="rounded-[24px] p-6" style={glassStyle}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-indigo-400/20 to-violet-400/20 rounded-lg">
                  <Mail className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {messages.length}
                  </p>
                  <p className="text-indigo-200">Total Messages</p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] p-6" style={glassStyle}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {messages.filter((m) => !m.read).length}
                  </p>
                  <p className="text-indigo-200">Unread</p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] p-6" style={glassStyle}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-lg">
                  <User className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {new Set(messages.map((m) => m.email)).size}
                  </p>
                  <p className="text-indigo-200">Unique Contacts</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Messages List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[24px] overflow-hidden"
            style={glassStyle}
          >
            <div className="p-6 border-b border-indigo-400/20">
              <h2 className="text-xl font-semibold text-white">
                Contact Messages
              </h2>
            </div>

            {messages.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="w-16 h-16 text-indigo-400/50 mx-auto mb-4" />
                <p className="text-indigo-200 text-lg">No messages yet</p>
                <p className="text-indigo-300">
                  Messages from your contact form will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-indigo-400/20">
                {messages.map((message) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">
                            {message.name}
                          </h3>
                          <span className="text-sm text-indigo-300">
                            {message.email}
                          </span>
                          {!message.read && (
                            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-indigo-200 line-clamp-2 mb-2">
                          {message.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-indigo-300">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openMessage(message)}
                          className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg transition-colors"
                          title="View full message"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl rounded-[24px] overflow-hidden"
              style={glassStyle}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-indigo-400/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Message Details
                  </h2>
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-indigo-200 mb-1">
                    From
                  </label>
                  <p className="text-white">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-200 mb-1">
                    Email
                  </label>
                  <p className="text-white">{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-200 mb-1">
                    Date
                  </label>
                  <p className="text-white">
                    {formatDate(selectedMessage.timestamp)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-200 mb-1">
                    Message
                  </label>
                  <p className="text-white whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
