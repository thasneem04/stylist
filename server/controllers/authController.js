import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isConfiguredAdminEmail } from "../config/adminAccount.js";

const generateToken = (id, role = "user") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email?.toLowerCase() || "";
  try {
    if (isConfiguredAdminEmail(normalizedEmail)) {
      return res
        .status(403)
        .json({ message: "This email is reserved for admin login" });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email: normalizedEmail, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? "admin" : "user",
      token: generateToken(user._id, user.isAdmin ? "admin" : "user"),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase() || "";
  try {
    if (isConfiguredAdminEmail(normalizedEmail)) {
      return res
        .status(403)
        .json({ message: "Please use the admin login page" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.isAdmin ? "admin" : "user",
        token: generateToken(user._id, user.isAdmin ? "admin" : "user"),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase() || "";
  try {
    if (!isConfiguredAdminEmail(normalizedEmail)) {
      return res
        .status(401)
        .json({ message: "Invalid admin email or password" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (user && user.isAdmin && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: "admin",
        token: generateToken(user._id, "admin"),
      });
    } else {
      res.status(401).json({ message: "Invalid admin email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? "admin" : "user",
      cart: user.cart,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
