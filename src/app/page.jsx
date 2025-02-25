"use client";

import React, { useCallback } from 'react';
import Script from "next/script";
import { useState } from "react";
import axios from 'axios';
import Card from '../components/Card';

const pricingPlans = [
  {
    title: "Basic Plan",
    amount: 499,
    description: "Perfect for small businesses",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    features: [
      "1 User",
      "5GB Storage",
      "Basic Support",
      "Email Support"
    ]
  },
  {
    title: "Pro Plan",
    amount: 999,
    description: "Ideal for growing teams",
    image: "https://images.unsplash.com/photo-1526614180703-827d23e7c8f2",
    features: [
      "5 Users",
      "20GB Storage",
      "Priority Support",
      "24/7 Phone Support",
      "API Access"
    ]
  },
  {
    title: "Enterprise Plan",
    amount: 1999,
    description: "For large organizations",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    features: [
      "Unlimited Users",
      "100GB Storage",
      "Dedicated Support",
      "Custom Integration",
      "Advanced Analytics",
      "SLA Agreement"
    ]
  }
];

const Home = () => {
  const [amount, setAmount] = useState(0);

  const handleBuyNow = useCallback(async (planAmount) => {
    try {
      const { data } = await axios.post('/api/create-order', {
        amount: planAmount * 100
      });

      if (!data || !data.id) {
        throw new Error('Invalid response data');
      }

      const paymentData = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: data.id,
        amount: planAmount * 100,
        handler: async function (response) {
          try {
            const { data: verifyData } = await axios.post('/api/verify-order', {
              orderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyData.isOk) {
              alert("Payment successful");
            } else {
              alert("Payment verification failed");
            }
          } catch (error) {
            console.error("Verification error:", error.response?.data || error.message);
            alert("Payment verification failed");
          }
        },
      };

      const payment = new window.Razorpay(paymentData);
      payment.open();
    } catch (error) {
      console.error("Order creation error:", error.response?.data || error.message);
      alert("Failed to create order");
    }
  }, []);

  return (
    <div className="min-h-screen p-8">
      <Script
        type="text/javascript"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      {/* Pricing Cards */}
      <div className="flex flex-wrap justify-center gap-8 mb-12">
        {pricingPlans.map((plan, index) => (
          <div key={index} className="cursor-pointer">
            <Card
              image={plan.image}
              title={plan.title}
              amount={plan.amount}
              description={plan.description}
              onBuyNow={() => handleBuyNow(plan.amount)}
            />
          </div>
        ))}
      </div>

      {/* Payment Input */}
      {/* <div className="flex flex-col items-center gap-4">
        <input
          id='amount'
          type="number"
          placeholder="Enter amount"
          className="px-4 py-2 rounded-md text-black"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-md"
          onClick={createOrder}
        >
          Create Order
        </button>
      </div> */}
    </div>
  );
}

export default Home;