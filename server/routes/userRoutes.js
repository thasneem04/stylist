import express from "express";
import { protect, user } from "../middleware/authMiddleware.js";
import { getUserProfile } from "../controllers/authController.js";
import {
  addOrderItems,
  cancelOrder,
  getOrderById,
  getMyOrders,
} from "../controllers/orderController.js";

const router = express.Router();

router.use(protect, user);

router.get("/profile", getUserProfile);
router.post("/orders", addOrderItems);
router.get("/orders", getMyOrders);
router.get("/orders/:id", getOrderById);
router.put("/orders/:id/cancel", cancelOrder);

export default router;
