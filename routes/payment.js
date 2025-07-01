import express from 'express';
import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment.js';
import { protect } from './auth.js';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/charge', protect, asyncHandler(async (req, res) => {
  const { amount, paymentMethod } = req.body;

  if (!amount || !paymentMethod) {
    res.status(400);
    throw new Error('Amount and payment method are required');
  }

  if (paymentMethod !== 'Stripe' && paymentMethod !== 'PayPal') {
    res.status(400);
    throw new Error('Unsupported payment method');
  }

  if (paymentMethod === 'Stripe') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        payment_method_types: ['card'],
      });

      const payment = new Payment({
        user: req.user._id,
        amount,
        paymentMethod,
        paymentStatus: 'Pending',
        paymentIntentId: paymentIntent.id,
      });

      await payment.save();

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
      });
    } catch (error) {
      // Mock Stripe for testing (when no real Stripe key)
      const payment = new Payment({
        user: req.user._id,
        amount,
        paymentMethod,
        paymentStatus: 'Succeeded',
        paymentIntentId: 'pi_mock_' + Date.now(),
      });

      await payment.save();

      res.json({
        message: 'Stripe payment processed (mock)',
        paymentId: payment._id,
        clientSecret: 'pi_mock_client_secret'
      });
    }
  } else if (paymentMethod === 'PayPal') {
    const payment = new Payment({
      user: req.user._id,
      amount,
      paymentMethod,
      paymentStatus: 'Succeeded',
    });

    await payment.save();

    res.json({
      message: 'PayPal payment processed (mock)',
      paymentId: payment._id,
    });
  }
}));

router.get('/status/:id', protect, asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  if (payment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this payment');
  }
  res.json({
    paymentStatus: payment.paymentStatus,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  });
}));

router.get('/user', protect, asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(payments);
}));

export default router;