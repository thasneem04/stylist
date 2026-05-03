import express from 'express';
import { addOrderItems, cancelOrder, getOrderById, getMyOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id').get(protect, getOrderById).put(protect, admin, updateOrderStatus);

export default router;
