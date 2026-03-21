import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";

// ─────────────────────────────────────────────
// LESSON: This page now handles TWO payment types
//
// Stripe redirects to:
// /purchase-success?session_id=xxx
//
// Paystack redirects to:
// /purchase-success?reference=xxx
//
// We check which parameter is in the URL
// and call the right backend endpoint
// ─────────────────────────────────────────────

const PurchaseSuccessPage = () => {
	const [isProcessing, setIsProcessing] = useState(true);
	const [error, setError] = useState(null);
	const [orderId, setOrderId] = useState(null);
	const { clearCart } = useCartStore();

	useEffect(() => {
		const handleSuccess = async () => {
			try {
				// LESSON: Read URL parameters to detect payment type
				const urlParams = new URLSearchParams(window.location.search);
				const sessionId = urlParams.get("session_id"); // Stripe
				const reference = urlParams.get("reference"); // Paystack

				if (sessionId) {
					// ── Stripe payment success ──────────────────
					// LESSON: Same as before — send sessionId to backend
					const res = await axios.post("/payments/checkout-success", {
						sessionId,
					});
					setOrderId(res.data.orderId);
					clearCart();

				} else if (reference) {
					// ── Paystack payment success ─────────────────
					// LESSON: New — send reference to backend to verify
					// Backend calls Paystack API to confirm payment
					// then creates the order in MongoDB
					const res = await axios.post("/payments/paystack-success", {
						reference,
					});
					setOrderId(res.data.orderId);
					clearCart();

				} else {
					// No payment parameter found in URL
					setError("No payment reference found. Please contact support.");
				}
			} catch (error) {
				console.log(error);
				setError("Something went wrong processing your payment.");
			} finally {
				setIsProcessing(false);
			}
		};

		handleSuccess();
	}, [clearCart]);

	if (isProcessing) {
		return (
			<div className='h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4' />
					<p className='text-gray-300 text-lg'>Confirming your payment...</p>
					<p className='text-gray-500 text-sm mt-2'>Please do not close this page</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='h-screen flex items-center justify-center px-4'>
				<div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center'>
					<h1 className='text-2xl font-bold text-red-400 mb-4'>Payment Error</h1>
					<p className='text-gray-300 mb-6'>{error}</p>
					<Link
						to='/'
						className='inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300'
					>
						Go Home
						<ArrowRight size={18} />
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='h-screen flex items-center justify-center px-4'>
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				style={{ zIndex: 99 }}
				numberOfPieces={700}
				recycle={false}
			/>

			<div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10'>
				<div className='p-6 sm:p-8'>
					<div className='flex justify-center'>
						<CheckCircle className='text-green-400 w-16 h-16 mb-4' />
					</div>
					<h1 className='text-2xl sm:text-3xl font-bold text-center text-white mb-2'>
						Purchase Successful!
					</h1>
					<p className='text-gray-300 text-center mb-2'>
						Thank you for your order. We're processing it now.
					</p>
					<p className='text-gray-400 text-center text-sm mb-6'>
						Check your email for order details and updates.
					</p>

					<div className='bg-gray-700 rounded-lg p-4 mb-6'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm text-gray-400'>Order number</span>
							<span className='text-sm font-semibold text-white'>
								#{orderId ? orderId.toString().slice(-6).toUpperCase() : "------"}
							</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-gray-400'>Estimated delivery</span>
							<span className='text-sm font-semibold text-white'>3-5 business days</span>
						</div>
					</div>

					<div className='space-y-4'>
						<button
							className='w-full text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center'
							style={{ background: "linear-gradient(135deg, #1e40af, #2563eb)" }}
						>
							<HandHeart className='mr-2' size={18} />
							Thanks for trusting us!
						</button>
						<Link
							to={"/"}
							className='w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center'
						>
							Continue Shopping
							<ArrowRight className='ml-2' size={18} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PurchaseSuccessPage;