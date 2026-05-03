import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

const AdminSidebar = () => {
  const { adminUser, logoutAdmin } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 p-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/admin"
            className="flex min-w-0 items-center gap-2 text-base font-black uppercase tracking-wider"
          >
            <Sparkles className="text-accent flex-shrink-0" size={20} />
            <span className="truncate">Aura Admin</span>
          </Link>
          <button
            onClick={logoutAdmin}
            className="text-gray-300 hover:text-accent"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                  isActive
                    ? "bg-gradient-btn text-white"
                    : "bg-white/5 text-gray-300"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <aside className="w-64 glass border-r border-white/10 hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link
            to="/admin"
            className="text-xl font-black uppercase tracking-wider flex items-center gap-2"
          >
            <Sparkles className="text-accent" size={20} /> Aura Admin
          </Link>
          <p className="mt-2 text-xs text-gray-500">
            Signed in as {adminUser?.name}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-gradient-btn text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="block px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5"
          >
            View Website
          </Link>
          <button
            onClick={logoutAdmin}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
