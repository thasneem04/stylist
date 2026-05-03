import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { getUserProfile } from "../controllers/authController.js";

const router = express.Router();

router.use(protect, admin);

router.get("/profile", getUserProfile);
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.put("/orders/:id", updateOrderStatus);

export default router;
