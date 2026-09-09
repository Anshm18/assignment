import express from 'express';
import protect from '../middleware/auth';
import { getUserOrders, createOrder, getOrder } from '../controller/orderController';
const router = express.Router();

router.route('/').get(protect, getUserOrders);
router.route('/').post(protect, createOrder);
router.route('/:id').get(protect, getOrder);

export default router;