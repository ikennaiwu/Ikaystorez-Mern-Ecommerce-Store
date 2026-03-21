import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight, Loader } from "lucide-react";
import axios from "../lib/axios";
import { useEffect, useState } from "react";

// ─────────────────────────────────────────────
// LESSON: We no longer need Stripe on the frontend!
// Paystack handles the redirect entirely from the backend
// We just send the cart to our backend and redirect to
// the authorization_url Paystack gives back
// ─────────────────────────────────────────────

const NAIRA_RATE = 1600; // ← update this as exchange rate changes

const OrderSummary = () => {
	const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();

	// ── Currency state ──────────────────────────
	// LESSON: We store currency and whether we've
	// finished detecting it (to avoid flickering)
	const [currency, setCurrency] = useState("USD");
	const [detectingLocation, setDetectingLocation] = useState(true);
	const [isLoading, setIsLoading] = useState(false);

	// ── Detect user location on component load ──
	useEffect(() => {
		const detectCurrency = async () => {
			try {
				// LESSON: We call a free IP detection API
				// It tells us the user's country based on their IP address
				const res = await fetch("https://ipapi.co/json/");
				const data = await res.json();

				// If user is in Nigeria → NGN, otherwise → USD
				if (data.country_code === "NG") {
					setCurrency("NGN");
				} else {
					setCurrency("USD");
				}
			} catch (error) {
				// If detection fails, default to USD
				console.log("Location detection failed, defaulting to USD");
				setCurrency("USD");
			} finally {
				setDetectingLocation(false);
			}
		};

		detectCurrency();
	}, []);

	// ── Price conversion ─────────────────────────
	// LESSON: We convert prices for display only
	// MongoDB prices stay in USD — we just multiply for display
	const convertAmount = (amountUSD) => {
		if (currency === "NGN") {
			return amountUSD * NAIRA_RATE;
		}
		return amountUSD;
	};

	// ── Currency symbol and formatting ───────────
	const formatPrice = (amountUSD) => {
		const converted = convertAmount(amountUSD);
		if (currency === "NGN") {
			return `₦${converted.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
		}
		return `$${converted.toFixed(2)}`;
	};

	const savings = subtotal - total;

	// ── Paystack checkout handler ─────────────────
	// LESSON: This replaces the Stripe handlePayment function
	// Pattern:
	// 1. Send cart + currency to our backend
	// 2. Backend talks to Paystack → gets authorization_url
	// 3. We redirect customer to that URL
	// 4. Customer pays on Paystack's page
	// 5. Paystack redirects to /purchase-success?reference=xxx
	const handlePayment = async () => {
		setIsLoading(true);
		try {
			const res = await axios.post("/payments/create-paystack-session", {
				products: cart,
				couponCode: coupon ? coupon.code : null,
				currency: currency, // ← tell backend which currency to charge in
			});

			// LESSON: Paystack gives us authorization_url to redirect to
			// This is different from Stripe which gives session.id
			const { authorization_url } = res.data;

			// Redirect customer to Paystack checkout page
			window.location.href = authorization_url;
		} catch (error) {
			console.error("Payment error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-semibold text-white'>Order Summary</p>

			{/* Currency indicator */}
			{!detectingLocation && (
				<div className='flex items-center gap-2'>
					<span className='text-xs text-gray-400 tracking-widest uppercase'>
						Paying in:
					</span>
					<span
						className='text-xs font-bold px-2 py-0.5 rounded-sm'
						style={{
							background: currency === "NGN" ? "#25D366" : "#2563eb",
							color: "#fff",
						}}
					>
						{currency === "NGN" ? "🇳🇬 Nigerian Naira (₦)" : "🌍 US Dollar ($)"}
					</span>
				</div>
			)}

			<div className='space-y-4'>
				<div className='space-y-2'>

					{/* Original price */}
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-gray-300'>Original price</dt>
						<dd className='text-base font-medium text-white'>
							{detectingLocation ? "..." : formatPrice(subtotal)}
						</dd>
					</dl>

					{/* Savings */}
					{savings > 0 && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Savings</dt>
							<dd className='text-base font-medium text-green-400'>
								-{formatPrice(savings)}
							</dd>
						</dl>
					)}

					{/* Coupon */}
					{coupon && isCouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>
								Coupon ({coupon.code})
							</dt>
							<dd className='text-base font-medium text-green-400'>
								-{coupon.discountPercentage}%
							</dd>
						</dl>
					)}

					{/* Total */}
					<dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
						<dt className='text-base font-bold text-white'>Total</dt>
						<dd className='text-base font-bold text-white'>
							{detectingLocation ? "..." : formatPrice(total)}
						</dd>
					</dl>
				</div>

				{/* Paystack Checkout Button */}
				<motion.button
					className='flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-bold text-white transition duration-300'
					style={{ background: "linear-gradient(135deg, #1e40af, #2563eb)" }}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={handlePayment}
					disabled={isLoading || detectingLocation}
				>
					{isLoading ? (
						<>
							<Loader className='mr-2 animate-spin' size={18} />
							Processing...
						</>
					) : (
						<>
							{/* Paystack logo */}
							<svg
								className='mr-2'
								width='18'
								height='18'
								viewBox='0 0 24 24'
								fill='white'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path d='M4 6h16v2H4zm2 4h12v2H6zm-2 4h16v2H4z' />
							</svg>
							Pay {detectingLocation ? "..." : formatPrice(total)} with Paystack
						</>
					)}
				</motion.button>

				{/* Security note */}
				<p className='text-center text-xs text-gray-500'>
					🔒 Secured by Paystack — Cards, Bank Transfer & USSD accepted
				</p>

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-gray-400'>or</span>
					<Link
						to='/'
						className='inline-flex items-center gap-2 text-sm font-medium text-gray-400 underline hover:text-white'
					>
						Continue Shopping
						<MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
};

export default OrderSummary;