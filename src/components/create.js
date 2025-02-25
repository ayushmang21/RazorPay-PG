import express from 'express';
import Razorpay from 'razorpay';
import OrderModel from '../models/orderModel.js';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_ID,
});

// Create a new order
router.post('/create', async (req, res) => {
    try {
        const { amount } = req.body;

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount,
            currency: "INR",
        });

        // Save order to MongoDB
        const orderData = {
            orderId: razorpayOrder.id,
            amount: amount,
            currency: "INR",
            status: razorpayOrder.status,
            createdAt: new Date()
        };

        new OrderModel(orderData).save()
            .then((result) => {
                res.json(result);
            }).catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// Get all orders
router.get('/getall', (req, res) => {
    OrderModel.find()
        .then((result) => {
            res.json(result);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

// Get order by ID
router.get('/getbyid/:id', (req, res) => {
    OrderModel.findById(req.params.id)
        .then((result) => {
            res.json(result);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

// Get order by Razorpay order ID
router.get('/getbyorderid/:orderId', (req, res) => {
    OrderModel.findOne({ orderId: req.params.orderId })
        .then((result) => {
            res.json(result);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

// Update order status
router.put('/update/:id', async (req, res) => {
    try {
        const result = await OrderModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating order', error: err.message });
    }
});

// Delete order
router.delete('/delete/:id', (req, res) => {
    OrderModel.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.json(result);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

// Verify payment
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Here you would verify the payment signature with Razorpay
        // This is a simplified example

        // Update order with payment details
        OrderModel.findOneAndUpdate(
            { orderId: razorpay_order_id },
            {
                paymentId: razorpay_payment_id,
                paymentStatus: 'completed'
            },
            { new: true }
        )
            .then((result) => {
                if (!result) {
                    return res.status(404).json({ message: 'Order not found' });
                }
                res.json(result);
            }).catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ error: "Failed to verify payment" });
    }
});

export default router;