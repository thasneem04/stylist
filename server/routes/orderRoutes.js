import express from "express";
import {
  addOrderItems,
  cancelOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, admin, user } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, user, addOrderItems);
router.route("/myorders").get(protect, user, getMyOrders);
router.route("/:id/cancel").put(protect, user, cancelOrder);
router
  .route("/:id")
  .get(protect, user, getOrderById)
  .put(protect, admin, updateOrderStatus);

export default router;
