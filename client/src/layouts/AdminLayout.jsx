import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="h-screen overflow-hidden text-white lg:flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 h-screen overflow-y-auto bg-[#050505]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
