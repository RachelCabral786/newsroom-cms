import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = authService.getStoredToken();
        const storedUser = authService.getStoredUser();

        if (token && storedUser) {
          setUser(storedUser);
          // const response = await authService.getCurrentUser();
          // setUser(response.data.user);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        setUser(response.data.user);
        toast.success(response.message || "Registration successful!");
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Login
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        toast.success(response.message || "Login successful!");
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info("Logged out successfully");
  };

  // Update user
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isEditor: user?.role === "editor",
    isWriter: user?.role === "writer",
    isReader: user?.role === "reader",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
