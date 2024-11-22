import paypal from '@paypal/checkout-server-sdk';  // Import PayPal SDK

import client from  '../paypal/paypay.js'
// Assuming client.js is where you set up the PayPal environment

// Create Order
export const createOrder = async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: req.body.amount, // amount to be paid
        },
      },
    ],
  });

  try {
    const order = await client.execute(request);
    res.status(200).json({ id: order.result.id });
    console.log( 'Order created successfully: ', order.result.id);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};

// Get Order By ID and capture it
export const getOrderByID = async (req, res) => {
  const { orderID } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    res.status(200).json({ status: 'success', capture });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
