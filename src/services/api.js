const API_BASE_URL = "http://localhost:5000/api";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Contact Form API
export const submitContactForm = async (contactData) => {
  return apiCall("/contact", {
    method: "POST",
    body: JSON.stringify(contactData),
  });
};

// Admin Authentication API
export const adminLogin = async (credentials) => {
  return apiCall("/admin/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};



// Admin Messages API
export const getMessages = async (token) => {
  return apiCall("/admin/messages", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const markMessageAsRead = async (messageId, token) => {
  return apiCall(`/admin/messages/${messageId}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteMessage = async (messageId, token) => {
  return apiCall(`/admin/messages/${messageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getDashboardStats = async (token) => {
  return apiCall("/admin/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Health check
export const checkServerHealth = async () => {
  return apiCall("/health");
};
