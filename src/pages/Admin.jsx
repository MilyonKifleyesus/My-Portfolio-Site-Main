import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import { adminLogin } from "../services/api";

const Admin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProductionMode, setIsProductionMode] = useState(false);

  // Check if admin is already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin/dashboard");
      return;
    }

    // Check if we're in production mode (Vercel deployment)
    const isVercel = window.location.hostname.includes("vercel.app");
    const productionMode = isVercel || !import.meta.env.DEV;
    setIsProductionMode(productionMode);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isProductionMode) {
        // Production mode: use localStorage fallback
        const storedAdmin = localStorage.getItem("adminCredentials");
        if (storedAdmin) {
          const { username, password } = JSON.parse(storedAdmin);
          if (
            formData.username === username &&
            formData.password === password
          ) {
            localStorage.setItem("adminToken", "production-token");
            navigate("/admin/dashboard");
            return;
          }
        }
        // First time setup in production
        if (formData.username === "admin" && formData.password === "admin123") {
          localStorage.setItem("adminCredentials", JSON.stringify(formData));
          localStorage.setItem("adminToken", "production-token");
          navigate("/admin/dashboard");
          return;
        }
        throw new Error("Invalid credentials");
      } else {
        // Development mode: use real backend
        const response = await adminLogin({
          username: formData.username,
          password: formData.password,
        });

        localStorage.setItem("adminToken", response.token);
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setError(error.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Production Mode Notice */}
        {isProductionMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2 text-amber-300">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Production Mode</span>
            </div>
            <p className="text-amber-200 text-xs mt-2">
              Backend services are not available. Using local storage fallback.
            </p>
          </motion.div>
        )}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-gray-300 text-sm">
              {isProductionMode
                ? "Enter your credentials to access the dashboard"
                : "Sign in to access the admin dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {isProductionMode && (
            <div className="mt-6 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-xs text-center">
                <strong>Default credentials:</strong> admin / admin123
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Admin;
