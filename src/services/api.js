// API Base URL - will use localhost for development, empty for production
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // If backend is not available (like in Vercel), show appropriate message
    if (!API_BASE_URL) {
      throw new Error('Backend services are not available in this environment. Please contact me directly via email or LinkedIn.');
    }
    throw error;
  }
};

// Contact Form API
export const submitContactForm = async (formData) => {
  if (!API_BASE_URL) {
    // Fallback for production: store in localStorage and show success
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    messages.push({
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      read: false
    });
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    return { success: true, message: 'Message stored locally' };
  }
  
  return apiCall("/contact", {
    method: "POST",
    body: JSON.stringify(formData),
  });
};

// Admin Authentication API
export const adminLogin = async (credentials) => {
  return apiCall("/admin/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

// Get Messages API
export const getMessages = async (token) => {
  if (!API_BASE_URL) {
    // Fallback for production: return localStorage messages
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    return { messages: messages.reverse() };
  }
  
  return apiCall("/admin/messages", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Mark Message as Read API
export const markMessageAsRead = async (id, token) => {
  if (!API_BASE_URL) {
    // Fallback for production: update localStorage
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const updatedMessages = messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    );
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
    return { success: true };
  }
  
  return apiCall(`/admin/messages/${id}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Delete Message API
export const deleteMessage = async (id, token) => {
  if (!API_BASE_URL) {
    // Fallback for production: remove from localStorage
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const updatedMessages = messages.filter(msg => msg.id !== id);
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
    return { success: true };
  }
  
  return apiCall(`/admin/messages/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get Dashboard Stats API
export const getDashboardStats = async (token) => {
  if (!API_BASE_URL) {
    // Fallback for production: calculate from localStorage
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const totalMessages = messages.length;
    const unreadMessages = messages.filter(msg => !msg.read).length;
    const today = new Date().toDateString();
    const todayMessages = messages.filter(msg => 
      new Date(msg.createdAt).toDateString() === today
    ).length;
    
    return {
      totalMessages,
      unreadMessages,
      todayMessages
    };
  }
  
  return apiCall("/admin/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Health Check API
export const checkServerHealth = async () => {
  if (!API_BASE_URL) {
    return { status: 'production', message: 'Frontend only mode' };
  }
  
  return apiCall("/health");
};
