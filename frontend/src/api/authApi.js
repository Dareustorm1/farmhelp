const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5000';

export const registerUser = async (email, password, role) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role }),
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: "Network error. Please try again." };
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        // Store token and user when returned by backend
        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        return data;
    } catch (error) {
        return { success: false, message: "Network error. Please try again." };
    }
};

export const getCurrentUser = async (token) => {
    try {
        // If token not passed, try localStorage
        const authToken = token || localStorage.getItem("token");
        if (!authToken) return { success: false, message: 'No token provided' };

        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        // Backend returns { user } on success
        if (response.ok) {
            return { success: true, user: data.user };
        }
        return { success: false, message: data.message || 'Failed to fetch user' };
    } catch (err) {
        return { success: false, message: 'Network error' };
    }
};


export const getUsernameFromEmail = () => {
    const userEmail = localStorage.getItem("userEmail"); // Retrieve stored email
    if (!userEmail) return null;
  
    const username = userEmail.split("@")[0]; // Extract username before '@'
    return username;
  };
  