import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},

		// ── Stripe ──────────────────────────────
		stripeSessionId: {
			type: String,
			unique: true,
			sparse: true, // allows null for Paystack orders
		},

		// ── Paystack ────────────────────────────
		paystackReference: {
			type: String,
			unique: true,
			sparse: true, // allows null for Stripe orders
		},

		// ── Shared ──────────────────────────────
		currency: {
			type: String,
			enum: ["USD", "NGN"],
			default: "USD",
		},
		paymentMethod: {
			type: String,
			enum: ["stripe", "paystack"],
			default: "stripe",
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;