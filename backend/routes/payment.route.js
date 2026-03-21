import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	// ── Stripe ──────────────────────────
	createCheckoutSession,
	checkoutSuccess,
	// ── Paystack ────────────────────────
	createPaystackSession,
	paystackSuccess,
} from "../controllers/payment.controller.js";

const router = express.Router();

// ─────────────────────────────────────────────
// STRIPE ROUTES
// LESSON: These are your existing Stripe routes
// protectRoute = middleware that checks if user is logged in
// ─────────────────────────────────────────────
router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, checkoutSuccess);
// NOTE: checkoutSuccess was missing its controller before — now it's fixed!

// ─────────────────────────────────────────────
// PAYSTACK ROUTES
// LESSON: Same pattern as Stripe routes
// 1. HTTP method (POST)
// 2. URL path
// 3. Middleware (protectRoute — same as Stripe)
// 4. Controller function
// ─────────────────────────────────────────────
router.post("/create-paystack-session", protectRoute, createPaystackSession);
router.post("/paystack-success", protectRoute, paystackSuccess);

export default router;