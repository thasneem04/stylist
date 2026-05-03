import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { adminUser } = useAuth();

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (adminUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};

export default AdminRoute;
