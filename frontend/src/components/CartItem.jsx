import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

const CartItem = ({ item }) => {
	const { removeFromCart, updateQuantity } = useCartStore();

	return (
		<div
			className='rounded-sm p-4 shadow-sm md:p-6'
			style={{
				background: "linear-gradient(160deg, #2d2d2d, #3a3a3a)",
				border: "1px solid #4a4a4a",
			}}
		>
			<div className='space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0'>

				{/* Product Image */}
				<div className='shrink-0 md:order-1'>
					<img
						className='h-20 md:h-32 rounded-sm object-cover'
						src={item.Image || item.image}
						alt={item.name}
					/>
				</div>

				<label className='sr-only'>Choose quantity:</label>

				{/* Quantity Controls + Price */}
				<div className='flex items-center justify-between md:order-3 md:justify-end'>
					<div className='flex items-center gap-2'>
						{/* Decrease */}
						<button
							className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm transition duration-200 hover:opacity-80'
							style={{ border: "1px solid #4b5563", background: "#1f2937" }}
							onClick={() => updateQuantity(item._id, item.quantity - 1)}
						>
							<Minus className='text-gray-300' size={12} />
						</button>

						<p className='text-white font-medium w-6 text-center'>{item.quantity}</p>

						{/* Increase */}
						<button
							className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm transition duration-200 hover:opacity-80'
							style={{ border: "1px solid #4b5563", background: "#1f2937" }}
							onClick={() => updateQuantity(item._id, item.quantity + 1)}
						>
							<Plus className='text-gray-300' size={12} />
						</button>
					</div>

					{/* Price */}
					<div className='text-end md:order-4 md:w-32'>
						<p className='text-base font-bold text-white'>${item.price}</p>
					</div>
				</div>

				{/* Product Info */}
				<div className='w-full min-w-0 flex-1 space-y-2 md:order-2 md:max-w-md'>
					<p className='text-base font-semibold text-white tracking-wide'>
						{item.name}
					</p>
					<p className='text-sm text-gray-400'>{item.description}</p>

					{/* Remove Button */}
					<div className='flex items-center gap-4 pt-1'>
						<button
							className='inline-flex items-center gap-1 text-sm font-medium transition duration-200'
							style={{ color: "#ef4444" }}
							onClick={() => removeFromCart(item._id)}
						>
							<Trash size={15} />
							<span>Remove</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CartItem;