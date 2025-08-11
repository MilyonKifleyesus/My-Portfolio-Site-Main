import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Trash2,
  Eye,
  LogOut,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  getMessages,
  markMessageAsRead,
  deleteMessage,
  getDashboardStats,
} from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isProductionMode, setIsProductionMode] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin");
      return;
    }

    // Check if we're in production mode
    setIsProductionMode(!import.meta.env.DEV);

    // Load messages and stats
    loadMessages();
    loadStats();
  }, [navigate]);

  const loadMessages = async () => {
    try {
      if (isProductionMode) {
        // Production mode: use localStorage fallback
        const storedMessages = localStorage.getItem('contactMessages') || '[]';
        const messages = JSON.parse(storedMessages);
        setMessages(messages);
        return;
      }

      // Development mode: use real backend
      const token = localStorage.getItem("adminToken");
      const response = await getMessages(token);
      setMessages(response.messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      if (isProductionMode) {
        // Fallback to empty array in production
        setMessages([]);
      }
    }
  };

  const loadStats = async () => {
    try {
      if (isProductionMode) {
        // Production mode: stats calculated from local messages
        return;
      }

      // Development mode: use real backend
      const token = localStorage.getItem("adminToken");
      await getDashboardStats(token);
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
      if (isProductionMode) {
        // Production mode: update localStorage
        const storedMessages = localStorage.getItem('contactMessages') || '[]';
        let messages = JSON.parse(storedMessages);
        messages = messages.filter(msg => (msg._id !== id && msg.id !== id));
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        
        // Update local state
        setMessages(messages);
        return;
      }

      // Development mode: use real backend
      const token = localStorage.getItem("adminToken");
      await deleteMessage(id, token);

      // Remove from local state
      const updatedMessages = messages.filter(
        (msg) => msg._id !== id && msg.id !== id
      );
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      if (isProductionMode) {
        // Production mode: update localStorage
        const storedMessages = localStorage.getItem('contactMessages') || '[]';
        let messages = JSON.parse(storedMessages);
        messages = messages.map(msg => 
          (msg._id === id || msg.id === id) ? { ...msg, read: true } : msg
        );
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        
        // Update local state
        setMessages(messages);
        return;
      }

      // Development mode: use real backend
      const token = localStorage.getItem("adminToken");
      await markMessageAsRead(id, token);

      // Update local state
      const updatedMessages = messages.map((msg) =>
        msg._id === id || msg.id === id ? { ...msg, read: true } : msg
      );
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const openMessageModal = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    if (!message.read) {
      handleMarkAsRead(message._id || message.id);
    }
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageId = (message) => {
    return message._id || message.id;
  };

  const stats = {
    totalMessages: messages.length,
    unreadMessages: messages.filter((msg) => !msg.read).length,
    todayMessages: messages.filter((msg) => {
      const today = new Date().toDateString();
      return new Date(msg.createdAt).toDateString() === today;
    }).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Production Mode Notice */}
      {isProductionMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/20 border-b border-amber-500/30 p-3"
        >
          <div className="container mx-auto flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Production Mode</span>
            <span className="text-xs text-amber-200">
              - Using local storage fallback. Messages are stored locally.
            </span>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-300">
              Manage your portfolio contact messages
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Total Messages</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalMessages}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Mail className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Unread</p>
                <p className="text-2xl font-bold text-white">
                  {stats.unreadMessages}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Today</p>
                <p className="text-2xl font-bold text-white">
                  {stats.todayMessages}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Messages List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">
              Contact Messages
            </h2>
          </div>

          {messages.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">No messages yet</p>
              <p className="text-gray-400 text-sm">
                Contact form submissions will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {messages.map((message, index) => (
                <motion.div
                  key={getMessageId(message)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 hover:bg-white/5 transition-colors cursor-pointer ${
                    !message.read ? "bg-blue-500/10" : ""
                  }`}
                  onClick={() => openMessageModal(message)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">
                          {message.name}
                        </h3>
                        <span className="text-sm text-gray-400">
                          {message.email}
                        </span>
                        {!message.read && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 line-clamp-2">
                        {message.message}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openMessageModal(message);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="View message"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(getMessageId(message));
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeMessageModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Message Details
                </h2>
                <button
                  onClick={closeMessageModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">
                    From:
                  </label>
                  <p className="text-white font-semibold">
                    {selectedMessage.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">
                    Email:
                  </label>
                  <p className="text-white">{selectedMessage.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">
                    Date:
                  </label>
                  <p className="text-white">
                    {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">
                    Message:
                  </label>
                  <p className="text-white whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    handleMarkAsRead(getMessageId(selectedMessage));
                    closeMessageModal();
                  }}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => {
                    handleDeleteMessage(getMessageId(selectedMessage));
                    closeMessageModal();
                  }}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Delete Message
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
