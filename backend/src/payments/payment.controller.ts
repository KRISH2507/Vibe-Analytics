import { Request, Response } from "express";
import { razorpay } from "./razorpay";
import { pool } from "../db";
import crypto from "crypto";

/**
 * POST /api/payments/create-order
 * Create Razorpay order for Pro upgrade
 */
export async function createProOrder(
  req: Request,
  res: Response
) {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const order = await razorpay.orders.create({
      amount: 49900, // ₹499 in paise
      currency: "INR",
      receipt: `rcpt_${Date.now().toString().slice(-10)}`, // Max 40 chars
      notes: {
        userId,
        plan: 'pro'
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

/**
 * POST /api/payments/verify
 * Verify Razorpay payment and upgrade user to Pro
 */
export async function verifyPayment(
  req: Request,
  res: Response
) {
  try {
    const userId = (req.user as any)?.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Update user to Pro plan and reset usage
    await pool.query(
      `UPDATE users SET plan = 'pro', queries_used = 0 WHERE id = $1`,
      [userId]
    );

    res.json({ 
      success: true, 
      message: 'Payment verified successfully. Welcome to Pro!' 
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
}
