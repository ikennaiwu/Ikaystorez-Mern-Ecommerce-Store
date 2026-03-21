import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCartStore } from "../stores/useCartStore";

const GiftCouponCard = () => {
	const [userInputCode, setUserInputCode] = useState("");
	const { coupon, isCouponApplied, applyCoupon, getMyCoupon, removeCoupon } = useCartStore();

	// Fetch the user's available coupon on mount
	useEffect(() => {
		getMyCoupon();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Pre-fill the input when a coupon is loaded and not yet applied
	useEffect(() => {
		if (coupon && !isCouponApplied) setUserInputCode(coupon.code);
	}, [coupon, isCouponApplied]);

	const handleApplyCoupon = () => {
		const trimmed = userInputCode.trim();
		if (!trimmed) return;
		applyCoupon(trimmed);
	};

	const handleRemoveCoupon = () => {
		removeCoupon();
		setUserInputCode("");
	};

	// Allow submitting the coupon code by pressing Enter
	const handleKeyDown = (e) => {
		if (e.key === "Enter") handleApplyCoupon();
	};

	const isInputEmpty = !userInputCode.trim();

	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<div className='space-y-4'>
				<div>
					<label htmlFor='voucher' className='mb-2 block text-sm font-medium text-gray-300'>
						Do you have a voucher or gift card?
					</label>
					<input
						type='text'
						id='voucher'
						className='block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm
							uppercase text-white placeholder-gray-400 focus:border-grey-500 focus:ring-grey-500'
						placeholder='Enter code here'
						value={userInputCode}
						onChange={(e) => setUserInputCode(e.target.value.toUpperCase())}
						onKeyDown={handleKeyDown}
						autoComplete='off'
						aria-label='Voucher or gift card code'
					/>
				</div>

				<motion.button
					type='button'
					className='flex w-full items-center justify-center rounded-lg bg-grey-600 px-5 py-2.5
						text-sm font-medium text-white hover:bg-grey-700 focus:outline-none focus:ring-4
						focus:ring-grey-300 disabled:cursor-not-allowed disabled:opacity-50'
					whileHover={isInputEmpty ? {} : { scale: 1.05 }}
					whileTap={isInputEmpty ? {} : { scale: 0.95 }}
					onClick={handleApplyCoupon}
					disabled={isInputEmpty}
				>
					Apply Code
				</motion.button>
			</div>

			{isCouponApplied && coupon && (
				<div className='mt-4'>
					<h3 className='text-lg font-medium text-gray-300'>Applied Coupon</h3>
					<p className='mt-2 text-sm text-gray-400'>
						<span className='font-mono font-semibold text-grey-400'>{coupon.code}</span>
						{" — "}
						<span className='text-grey-400'>{coupon.discountPercentage}% off</span>
					</p>

					<motion.button
						type='button'
						className='mt-2 flex w-full items-center justify-center rounded-lg bg-red-600
							px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none
							focus:ring-4 focus:ring-red-300'
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleRemoveCoupon}
					>
						Remove Coupon
					</motion.button>
				</div>
			)}

			{coupon && !isCouponApplied && (
				<div className='mt-4 rounded-lg border border-grey-700 bg-grey-900/20 p-3'>
					<h3 className='text-sm font-medium text-grey-400'>🎁 Available Coupon</h3>
					<p className='mt-1 text-sm text-gray-400'>
						Use{" "}
						<span className='font-mono font-semibold text-grey-400'>{coupon.code}</span>
						{" "}for{" "}
						<span className='text-grey-400'>{coupon.discountPercentage}% off</span>
					</p>
				</div>
			)}
		</motion.div>
	);
};

export default GiftCouponCard;
