import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

const FeaturedProducts = ({ featuredProducts }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(4);
	const { addToCart } = useCartStore();

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 640) setItemsPerPage(1);
			else if (window.innerWidth < 1024) setItemsPerPage(2);
			else if (window.innerWidth < 1280) setItemsPerPage(3);
			else setItemsPerPage(4);
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => prevIndex + itemsPerPage);
	};

	const prevSlide = () => {
		setCurrentIndex((prevIndex) => prevIndex - itemsPerPage);
	};

	const isStartDisabled = currentIndex === 0;
	const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;

	return (
		<div className='py-12'>
			<div className='container mx-auto px-4'>

				{/* Title */}
				<h2
					className='text-center text-2xl sm:text-3xl font-bold mb-8 tracking-widest uppercase'
					style={{
						background: "linear-gradient(135deg, #ffffff 0%, #a0aec0 50%, #e2e8f0 100%)",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
					}}
				>
					Featured
				</h2>

				<div className='relative'>
					<div className='overflow-hidden'>
						<div
							className='flex transition-transform duration-300 ease-in-out'
							style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
						>
							{featuredProducts?.map((product) => (
								<div
									key={product._id}
									className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2'
								>
									<div
										className='rounded-sm overflow-hidden h-full transition-all duration-300 hover:shadow-2xl'
										style={{
											background: "linear-gradient(160deg, #2d2d2d, #3a3a3a)",
											border: "1px solid #4a4a4a",
											boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
										}}
									>
										{/* Product Image */}
										<div className='overflow-hidden'>
											<img
												src={product.Image || product.image}
												alt={product.name}
												className='w-full h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-110'
											/>
										</div>

										{/* Product Details */}
										<div className='p-4'>
											<h3 className='text-lg font-semibold mb-2 text-white tracking-wide'>
												{product.name}
											</h3>
											<p
												className='font-bold mb-4 text-lg'
												style={{ color: "#e2e8f0" }}
											>
												${product.price.toFixed(2)}
											</p>
											<button
												onClick={() => addToCart(product)}
												className='w-full font-semibold py-2 px-4 rounded-sm transition-all duration-300 flex items-center justify-center hover:opacity-80'
												style={{
													background: "linear-gradient(135deg, #1f2937, #374151)",
													border: "1px solid #4b5563",
													color: "#e2e8f0",
												}}
											>
												<ShoppingCart className='w-5 h-5 mr-2' />
												Add to Cart
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Prev Button */}
					<button
						onClick={prevSlide}
						disabled={isStartDisabled}
						className='absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-sm transition-all duration-300'
						style={{
							background: isStartDisabled ? "#2a2a2a" : "linear-gradient(135deg, #374151, #4b5563)",
							border: "1px solid #4b5563",
							cursor: isStartDisabled ? "not-allowed" : "pointer",
							opacity: isStartDisabled ? 0.4 : 1,
						}}
					>
						<ChevronLeft className='w-6 h-6 text-white' />
					</button>

					{/* Next Button */}
					<button
						onClick={nextSlide}
						disabled={isEndDisabled}
						className='absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-sm transition-all duration-300'
						style={{
							background: isEndDisabled ? "#2a2a2a" : "linear-gradient(135deg, #374151, #4b5563)",
							border: "1px solid #4b5563",
							cursor: isEndDisabled ? "not-allowed" : "pointer",
							opacity: isEndDisabled ? 0.4 : 1,
						}}
					>
						<ChevronRight className='w-6 h-6 text-white' />
					</button>
				</div>
			</div>
		</div>
	);
};

export default FeaturedProducts;