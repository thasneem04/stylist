import { useState, useEffect } from "react";
import { Sparkles, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, loginAdmin, register, user, adminUser } = useAuth();
  const isAdminLogin = location.pathname === "/admin/login";
  const redirectAfterLogin = location.state?.from?.pathname || "/home";

  useEffect(() => {
    if (isAdminLogin) {
      if (adminUser) navigate("/admin");
      return;
    }

    if (user) {
      navigate(redirectAfterLogin);
    }
  }, [user, adminUser, navigate, isAdminLogin, redirectAfterLogin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const loggedInUser = isAdminLogin
          ? await loginAdmin(formData.email, formData.password)
          : await loginUser(formData.email, formData.password);
        toast.success(
          isAdminLogin ? "Admin login successful!" : "Successfully logged in!",
          { icon: "🎉" },
        );
        navigate(isAdminLogin ? "/admin" : redirectAfterLogin);
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success("Successfully registered!", { icon: "🎉" });
        navigate(redirectAfterLogin);
      }
    } catch (err) {
      // Error handled in context
    }
  };

  const handleGoogleSignIn = () => {
    // Phase 2 placeholder
    toast("Google Sign-In coming soon!", { icon: "⏳" });
  };

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-8 sm:py-12">
      {/* Background elements */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent-purple/20 rounded-full blur-[120px]" />

      <div className="glass-card relative z-10 w-full max-w-md p-5 sm:p-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full glass text-accent mb-4">
            <Sparkles size={24} />
          </div>
          <h1 className="mb-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">
            Welcome to <span className="text-gradient">Aura</span>
          </h1>
          <p className="text-sm text-gray-400">
            {isAdminLogin
              ? "Admin access for managing products and orders"
              : isLogin
                ? "Sign in to access your personalized styles"
                : "Create an account for AI fashion insights"}
          </p>
        </div>

        {/* Toggle */}
        {!isAdminLogin && (
          <div className="flex p-1 bg-white/5 rounded-lg mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-colors ${isLogin ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-colors ${!isLogin ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"}`}
            >
              Register
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-accent text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-accent text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Password
              </label>
              {isLogin && (
                <a href="#" className="text-xs text-accent hover:underline">
                  Forgot?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-accent text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-btn py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-8"
          >
            {isAdminLogin
              ? "Admin Sign In"
              : isLogin
                ? "Sign In"
                : "Create Account"}{" "}
            <ArrowRight size={18} />
          </button>
        </form>

        {!isAdminLogin && (
          <div className="mt-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <span className="relative bg-primary px-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 sm:px-4 sm:text-xs">
                Or continue with
              </span>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="mt-6 w-full glass py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </div>
        )}

        {isAdminLogin && (
          <p className="mt-6 text-center text-xs text-gray-500">
            Customer account?{" "}
            <Link to="/login" className="text-accent hover:text-white">
              Sign in here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
