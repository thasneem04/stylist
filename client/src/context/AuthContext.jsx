import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiUrl } from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const normalizeUser = (userData) => ({
  ...userData,
  role: userData.role || (userData.isAdmin ? "admin" : "user"),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("aura_user");
    const storedToken = localStorage.getItem("aura_token");

    if (storedUser && storedToken) {
      const parsedUser = normalizeUser(JSON.parse(storedUser));
      setUser(parsedUser);
      setToken(storedToken);
      localStorage.setItem("aura_user", JSON.stringify(parsedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, adminOnly = false) => {
    try {
      const res = await fetch(
        apiUrl(`/auth/${adminOnly ? "admin/login" : "login"}`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      const normalizedUser = normalizeUser(data);
      setUser(normalizedUser);
      setToken(data.token);
      localStorage.setItem("aura_user", JSON.stringify(normalizedUser));
      localStorage.setItem("aura_token", data.token);

      return normalizedUser;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(apiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Registration failed");

      const normalizedUser = normalizeUser(data);
      setUser(normalizedUser);
      setToken(data.token);
      localStorage.setItem("aura_user", JSON.stringify(normalizedUser));
      localStorage.setItem("aura_token", data.token);

      return normalizedUser;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("aura_user");
    localStorage.removeItem("aura_token");
    toast.success("Logged out successfully");
  };

  const updateProfile = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem("aura_user", JSON.stringify(updatedUser));
    toast.success("Profile updated successfully");
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateProfile }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
