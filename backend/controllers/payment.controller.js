import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import { initializeTransaction, verifyTransaction } from "../lib/paystack.js";

// ─────────────────────────────────────────────
//  STRIPE - existing functions (unchanged)
// ─────────────────────────────────────────────

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;

		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100); // stripe wants cents
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon
				? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }]
				: [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}

		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error processing Stripe checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{ code: session.metadata.couponCode, userId: session.metadata.userId },
					{ isActive: false }
				);
			}

			const products = JSON.parse(session.metadata.products);
			const newOrder = new Order({
				user: session.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: session.amount_total / 100,
				stripeSessionId: sessionId,
				paymentMethod: "stripe",
				currency: "USD",
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing Stripe success:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

// ─────────────────────────────────────────────
// PAYSTACK - new functions
// ─────────────────────────────────────────────

// LESSON: This mirrors createCheckoutSession but for Paystack
// Key differences:
// 1. We detect currency from the request (NGN or USD)
// 2. We convert amount to kobo (NGN) or cents (USD)
// 3. We get back an authorization_url instead of session.id
// 4. We also get back a reference to verify payment later

export const createPaystackSession = async (req, res) => {
	try {
		const { products, couponCode, currency = "NGN" } = req.body;
		// currency comes from frontend based on user's location
		// defaults to NGN since your main market is Nigeria

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		// Step 1: Calculate total in USD first (your prices are in USD)
		let totalAmountUSD = 0;
		products.forEach((product) => {
			totalAmountUSD += product.price * product.quantity;
		});

		// Step 2: Apply coupon if exists
		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({
				code: couponCode,
				userId: req.user._id,
				isActive: true,
			});
			if (coupon) {
				totalAmountUSD -= (totalAmountUSD * coupon.discountPercentage) / 100;
			}
		}

		// Step 3: Convert to correct currency amount
		// LESSON: Paystack requires amount in smallest unit
		// NGN: multiply by exchange rate then by 100 (kobo)
		// USD: multiply by 100 (cents)
		const NAIRA_RATE = 1600; // ← update this rate as needed
		const amountInSmallestUnit =
			currency === "NGN"
				? Math.round(totalAmountUSD * NAIRA_RATE * 100) // USD → Naira → Kobo
				: Math.round(totalAmountUSD * 100); // USD → Cents

		// Step 4: Initialize Paystack transaction
		// LESSON: This is like stripe.checkout.sessions.create()
		const transaction = await initializeTransaction({
			email: req.user.email, // Paystack requires customer email
			amount: amountInSmallestUnit,
			currency: currency, // "NGN" or "USD"
			callback_url: `${process.env.CLIENT_URL}/purchase-success`, // redirect after payment
			metadata: {
				// LESSON: Same as Stripe metadata - store info you need after payment
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				currency: currency,
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		// Step 5: Deactivate coupon if used
		if (coupon) {
			await Coupon.findOneAndUpdate(
				{ code: couponCode, userId: req.user._id },
				{ isActive: false }
			);
		}

		// Step 6: Create coupon reward for large orders
		if (totalAmountUSD >= 200) {
			await createNewCoupon(req.user._id);
		}

		// LESSON: We return authorization_url (to redirect customer)
		// and reference (to verify payment later) — similar to Stripe's session.id
		res.status(200).json({
			authorization_url: transaction.authorization_url, // redirect customer here
			reference: transaction.reference, // save this to verify payment
			totalAmount: totalAmountUSD,
			currency: currency,
		});
	} catch (error) {
		console.error("Error processing Paystack checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

// LESSON: This mirrors checkoutSuccess but for Paystack
// Instead of sessionId, we use reference to verify payment
export const paystackSuccess = async (req, res) => {
	try {
		const { reference } = req.body;
		// reference comes from Paystack after redirect
		// it's in the URL: /purchase-success?reference=xxx

		// Step 1: Verify payment with Paystack
		// LESSON: This is like stripe.checkout.sessions.retrieve(sessionId)
		const transaction = await verifyTransaction(reference);

		// Step 2: Check if payment was successful
		if (transaction.status === "success") {
			// Step 3: Deactivate coupon if used
			if (transaction.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: transaction.metadata.couponCode,
						userId: transaction.metadata.userId,
					},
					{ isActive: false }
				);
			}

			// Step 4: Create order in MongoDB
			// LESSON: Same as Stripe but uses paystackReference instead of stripeSessionId
			const products = JSON.parse(transaction.metadata.products);
			const newOrder = new Order({
				user: transaction.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: transaction.amount / 100, // convert from kobo/cents back
				paystackReference: reference, // ← Paystack equivalent of stripeSessionId
				paymentMethod: "paystack",
				currency: transaction.currency.toUpperCase(), // "NGN" or "USD"
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created.",
				orderId: newOrder._id,
			});
		} else {
			// Payment was not successful
			res.status(400).json({
				success: false,
				message: "Payment verification failed",
			});
		}
	} catch (error) {
		console.error("Error processing Paystack success:", error);
		res.status(500).json({ message: "Error processing payment", error: error.message });
	}
};

// ─────────────────────────────────────────────
//  Helper functions (shared by both)
// ─────────────────────────────────────────────

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});
	return coupon.id;
}

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
		userId: userId,
	});

	await newCoupon.save();
	return newCoupon;
}