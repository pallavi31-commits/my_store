import express from 'express';
import { placeOrder, getOrderById, downloadOrderPDF } from '../controllers/orderController.js';

const router = express.Router();

router.post('/place', placeOrder);

// routes/orderRoutes.js
router.get('/:id/pdf', downloadOrderPDF);

router.get('/:id', getOrderById);



export default router;