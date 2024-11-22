// routes/paypal.js
import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import client  from '../paypal/paypay.js';

const router = express.Router();

// Create Order
router.post('/create-orders', async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: req.body.amount,  // Amount to be paid
      },
    }],
  });

  try {
    const order = await client.execute(request);
    res.status(200).json({ id: order.result.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: error.message });
  }
});

// routes/paypal.js (continued)
router.post('/capture-order', async (req, res) => {
    const { orderID } = req.body;
  
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
  
    try {
      const capture = await client.execute(request);
      res.status(200).json({ status: 'success', capture });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  export default router;
  