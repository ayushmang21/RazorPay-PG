import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import OrderModel from '../models/orderModel.js';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_ID,
});

// Helper function to generate signature for verification
const generateSignature = (razorpayOrderId, razorpayPaymentId) => {
    const keySecret = process.env.RAZORPAY_SECRET_ID;

    const sig = crypto
        .createHmac("sha256", keySecret)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");
    return sig;
};

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

// Verify payment
router.post('/verify', async (req, res) => {
    try {
        const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

        // Generate and verify signature
        const signature = generateSignature(orderId, razorpayPaymentId);

        if (signature !== razorpaySignature) {
            return res.status(400).json({
                message: "Payment verification failed",
                isOk: false
            });
        }

        // Update order in the database
        OrderModel.findOneAndUpdate(
            { orderId: orderId },
            {
                paymentId: razorpayPaymentId,
                paymentStatus: 'completed',
                status: 'paid'
            },
            { new: true }
        )
            .then((result) => {
                if (!result) {
                    return res.status(404).json({
                        message: 'Order not found',
                        isOk: false
                    });
                }

                // Order successfully verified and updated
                res.json({
                    message: "Payment verified successfully",
                    isOk: true,
                    order: result
                });
            }).catch((err) => {
                console.log(err);
                res.status(500).json({
                    message: "Database error during verification",
                    isOk: false,
                    error: err
                });
            });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({
            message: "Failed to verify payment",
            isOk: false,
            error: error.message
        });
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

// Update order
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

export default router;