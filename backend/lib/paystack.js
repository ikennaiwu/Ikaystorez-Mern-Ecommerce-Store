import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

// This is our Paystack client — same idea as:
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
// But Paystack uses a REST API so we use axios instead of an SDK

const paystack = axios.create({
	baseURL: "https://api.paystack.co", // Paystack's API base URL
	headers: {
		Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // secret key goes here
		"Content-Type": "application/json",
	},
});

// Helper functions that mirror Stripe's methods
// Instead of: stripe.checkout.sessions.create(...)
// We have:    paystack.initializeTransaction(...)

export const initializeTransaction = async ({ email, amount, currency, metadata, callback_url }) => {
	// amount must be in kobo for NGN (₦100 = 10000 kobo)
	// amount must be in cents for USD ($1 = 100 cents)
	const response = await paystack.post("/transaction/initialize", {
		email,
		amount, // already converted before calling this
		currency, // "NGN" or "USD"
		metadata, // store userId, products etc here (same as Stripe metadata)
		callback_url, // where Paystack redirects after payment (like Stripe's success_url)
	});

	// response.data.data contains:
	// {
	//   authorization_url: "https://checkout.paystack.com/xxx", ← redirect customer here
	//   access_code: "xxx",
	//   reference: "xxx" ← save this to verify payment later
	// }
	return response.data.data;
};

export const verifyTransaction = async (reference) => {
	// This is like stripe.checkout.sessions.retrieve(sessionId)
	// We use the reference to check if payment was successful
	const response = await paystack.get(`/transaction/verify/${reference}`);

	// response.data.data contains:
	// {
	//   status: "success", ← check this!
	//   amount: 10000,
	//   currency: "NGN",
	//   metadata: { userId, products... }
	// }
	return response.data.data;
};

export default paystack;