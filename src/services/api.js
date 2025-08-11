// API Base URL - will use Vercel serverless functions in production
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  let url;
  
  if (API_BASE_URL) {
    // Development: use local backend
    url = `${API_BASE_URL}/api${endpoint}`;
  } else {
    // Production: use Vercel serverless functions
    url = `/api${endpoint}`;
  }
  
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
    // If backend is not available, show appropriate message
    if (!API_BASE_URL && error.message.includes('Failed to fetch')) {
      throw new Error('Backend services are not available. Please contact me directly via email or LinkedIn.');
    }
    throw error;
  }
};

// Contact Form API
export const submitContactForm = async (formData) => {
  if (!API_BASE_URL) {
    // Production: use Vercel serverless function
    return apiCall("/contact", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  }
  
  // Development: use local backend
  return apiCall("/contact", {
    method: "POST",
    body: JSON.stringify(formData),
  });
};

// Admin Authentication API
export const adminLogin = async (credentials) => {
  if (!API_BASE_URL) {
    // Production: use Vercel serverless function
    return apiCall("/admin-login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }
  
  // Development: use local backend
  return apiCall("/admin/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

// Get Messages API
export const getMessages = async (token) => {
  if (!API_BASE_URL) {
    // Production: use Vercel serverless function
    return apiCall("/admin-messages", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  // Development: use local backend
  return apiCall("/admin/messages", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Mark Message as Read API
export const markMessageAsRead = async (id, token) => {
  if (!API_BASE_URL) {
    // Production: use Vercel serverless function
    return apiCall(`/admin-messages?id=${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  // Development: use local backend
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
    // Production: use Vercel serverless function
    return apiCall(`/admin-messages?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  // Development: use local backend
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
    // Production: use Vercel serverless function
    return apiCall("/admin-stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  // Development: use local backend
  return apiCall("/admin/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Health Check API
export const checkServerHealth = async () => {
  if (!API_BASE_URL) {
    return { status: 'production', message: 'Using Vercel serverless functions' };
  }
  
  return apiCall("/health");
};
