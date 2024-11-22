import express from 'express';
import { createOrder, getOrderByID } from '../controllers/paypal.js';

const router = express.Router();

router.post('/create-order',createOrder)

router.post('/capture-order',getOrderByID);

export default router;
