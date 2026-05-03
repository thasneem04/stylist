import jwt from "jsonwebtoken";
import User from "../models/User.js";

const requireRole = (requiredRole) => (req, res, next) => {
  if (req.user && req.user.role === requiredRole) {
    return next();
  }
  return res.status(403).json({ message: `Not authorized as ${requiredRole}` });
};

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }
      req.user = {
        ...user.toObject(),
        role: decoded.role || (user.isAdmin ? "admin" : "user"),
        isAdmin: decoded.role === "admin" || user.isAdmin,
      };
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  return res.status(401).json({ message: "Not authorized, no token" });
};

export const admin = requireRole("admin");
export const user = requireRole("user");
