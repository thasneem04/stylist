import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  ShoppingBag,
  Heart,
  User,
  Sparkles,
  LogOut,
  PackageCheck,
  Home as HomeIcon,
  Grid3x3,
  Wand2,
  UserCircle,
} from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "./ProfileModal";

const Navbar = () => {
  const { cart, wishlist } = useShop();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/90 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <Sparkles className="text-accent shrink-0" size={24} />
            <span className="truncate text-base font-black tracking-wider uppercase text-white sm:text-xl">
              AI Fashion Assistant
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              to="/"
              className={`${isActive("/") ? "text-accent" : "text-gray-300 hover:text-white"} transition-colors`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`${isActive("/products") ? "text-accent" : "text-gray-300 hover:text-white"} transition-colors`}
            >
              Products
            </Link>
            <Link
              to="/orders"
              className={`${isActive("/orders") ? "text-accent" : "text-gray-300 hover:text-white"} transition-colors`}
            >
              My Orders
            </Link>
            <Link
              to="/ai-stylist"
              className={`${isActive("/ai-stylist") ? "text-accent" : "text-gray-300 hover:text-white"} transition-colors flex items-center gap-1`}
            >
              AI Stylist <Sparkles size={14} className="text-accent" />
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-6">
            <div className="hidden sm:flex gap-3">
              <button
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                onClick={() =>
                  document.getElementById("chatbot-toggle")?.click()
                }
              >
                Ask Aria
              </button>
              <Link
                to="/products"
                className="bg-gradient-btn px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
              >
                Shop Now
              </Link>
            </div>

            <div className="flex items-center gap-3 border-l border-white/20 pl-3 sm:gap-4 sm:pl-6">
              <Link
                to="/cart"
                className="relative text-gray-300 hover:text-accent transition-colors"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
              <Link
                to="/wishlist"
                className="relative text-gray-300 hover:text-accent transition-colors cursor-pointer"
              >
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              {user?.role !== "admin" && (
                <Link
                  to="/orders"
                  className="relative text-gray-300 hover:text-accent transition-colors cursor-pointer"
                  title="My Orders"
                >
                  <PackageCheck size={20} />
                </Link>
              )}
              {user ? (
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-sm font-bold text-white hidden sm:block">
                    Hi, {user.name.split(" ")[0]}
                  </span>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="text-xs font-bold uppercase tracking-widest text-accent hover:text-white transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="text-gray-300 hover:text-accent transition-colors"
                    title="Edit Profile"
                  >
                    <UserCircle size={20} />
                  </button>
                  <button
                    onClick={logout}
                    className="text-gray-300 hover:text-accent transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  <User size={20} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 w-full z-50 md:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="flex items-center justify-around px-4 py-3">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive("/") ? "text-accent" : "text-gray-400 hover:text-white"
            }`}
            title="Home"
          >
            <HomeIcon size={24} />
            <span className="text-[10px] font-bold uppercase">Home</span>
          </Link>
          <Link
            to="/products"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive("/products")
                ? "text-accent"
                : "text-gray-400 hover:text-white"
            }`}
            title="Products"
          >
            <Grid3x3 size={24} />
            <span className="text-[10px] font-bold uppercase">Shop</span>
          </Link>
          <Link
            to="/orders"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive("/orders")
                ? "text-accent"
                : "text-gray-400 hover:text-white"
            }`}
            title="Orders"
          >
            <PackageCheck size={24} />
            <span className="text-[10px] font-bold uppercase">Orders</span>
          </Link>
          <Link
            to="/ai-stylist"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive("/ai-stylist")
                ? "text-accent"
                : "text-gray-400 hover:text-white"
            }`}
            title="AI Stylist"
          >
            <Wand2 size={24} />
            <span className="text-[10px] font-bold uppercase">Stylist</span>
          </Link>
        </div>
      </nav>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};

export default Navbar;
