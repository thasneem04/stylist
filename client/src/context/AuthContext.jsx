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
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("aura_user");
    const storedToken = localStorage.getItem("aura_user_token");
    const storedAdminUser = localStorage.getItem("aura_admin_user");
    const storedAdminToken = localStorage.getItem("aura_admin_token");

    if (storedUser && storedToken) {
      const parsedUser = normalizeUser(JSON.parse(storedUser));
      setUser(parsedUser);
      setToken(storedToken);
      localStorage.setItem("aura_user", JSON.stringify(parsedUser));
    }

    if (storedAdminUser && storedAdminToken) {
      const parsedAdminUser = normalizeUser(JSON.parse(storedAdminUser));
      setAdminUser(parsedAdminUser);
      setAdminToken(storedAdminToken);
      localStorage.setItem("aura_admin_user", JSON.stringify(parsedAdminUser));
    }

    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    try {
      const res = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      const normalizedUser = normalizeUser(data);
      setUser(normalizedUser);
      setToken(data.token);
      localStorage.setItem("aura_user", JSON.stringify(normalizedUser));
      localStorage.setItem("aura_user_token", data.token);

      return normalizedUser;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const loginAdmin = async (email, password) => {
    try {
      const res = await fetch(apiUrl("/auth/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Admin login failed");

      const normalizedAdminUser = normalizeUser(data);
      if (normalizedAdminUser.role !== "admin") {
        throw new Error("Admin login required");
      }

      setAdminUser(normalizedAdminUser);
      setAdminToken(data.token);
      localStorage.setItem(
        "aura_admin_user",
        JSON.stringify(normalizedAdminUser),
      );
      localStorage.setItem("aura_admin_token", data.token);

      return normalizedAdminUser;
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
      localStorage.setItem("aura_user_token", data.token);

      return normalizedUser;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("aura_user");
    localStorage.removeItem("aura_user_token");
    toast.success("Logged out successfully");
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem("aura_admin_user");
    localStorage.removeItem("aura_admin_token");
    toast.success("Admin logged out successfully");
  };

  const logout = () => {
    logoutUser();
  };

  const getAuthHeaders = (role = "user") => {
    const selectedToken = role === "admin" ? adminToken : token;
    return selectedToken ? { Authorization: `Bearer ${selectedToken}` } : {};
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
      value={{
        user,
        token,
        adminUser,
        adminToken,
        loading,
        loginUser,
        loginAdmin,
        register,
        logoutUser,
        logoutAdmin,
        logout,
        getAuthHeaders,
        updateProfile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
