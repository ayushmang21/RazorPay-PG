import express from 'express';
import crypto from 'crypto';
import OrderModel from '../models/orderModel.js';

const router = express.Router();

// Helper function to generate signature for verification
const generateSignature = (razorpayOrderId, razorpayPaymentId) => {
    const keySecret = process.env.RAZORPAY_SECRET_ID;

    const sig = crypto
        .createHmac("sha256", keySecret)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");
    return sig;
};

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

export default router;