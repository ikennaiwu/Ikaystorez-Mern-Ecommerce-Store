import { useEffect, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductsCard";
import VideoPlayer from "../components/VideoPlayer";
import axios from "../lib/axios";
import { PlayCircle } from "lucide-react";

const CategoryPage = () => {
	const { fetchProductsByCategory, products } = useProductStore();
	const { category } = useParams();

	// ── Video state ──────────────────────────────
	const [videoUrl, setVideoUrl] = useState(null);
	const [showVideo, setShowVideo] = useState(false);

	// Fetch products for this category
	useEffect(() => {
		fetchProductsByCategory(category);
	}, [fetchProductsByCategory, category]);

	// LESSON: Fetch video for this category when page loads
	// If no video exists, videoUrl stays null and button is hidden
	useEffect(() => {
		const fetchCategoryVideo = async () => {
			try {
				const res = await axios.get(`/categories/${category}/video`);
				setVideoUrl(res.data.videoUrl); // null if no video
			} catch (error) {
				console.log("No video for this category");
				setVideoUrl(null);
			}
		};
		fetchCategoryVideo();
	}, [category]);

	return (
		<div className='min-h-screen'>
			<div className='relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>

				{/* Category Title */}
				<motion.h1
					className='text-center text-4xl sm:text-5xl font-bold text-white mb-4'
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					{category.charAt(0).toUpperCase() + category.slice(1)}
				</motion.h1>

				{/* LESSON: Only show video button if a video exists for this category
				    If admin hasn't uploaded a video, this button is completely hidden */}
				{videoUrl && (
					<motion.div
						className='flex justify-center mb-8'
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<button
							onClick={() => setShowVideo(true)}
							className='flex items-center gap-2 px-6 py-3 rounded-sm font-semibold text-sm tracking-widest uppercase transition duration-300 hover:opacity-80'
							style={{
								background: "linear-gradient(135deg, #1a1a1a, #2d2d2d)",
								border: "1px solid #4a4a4a",
								color: "#e2e8f0",
							}}
						>
							<PlayCircle size={20} />
							Watch {category.charAt(0).toUpperCase() + category.slice(1)} Preview
						</button>
					</motion.div>
				)}

				{/* Products Grid */}
				<motion.div
					className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					{products?.length === 0 && (
						<h2 className='text-3xl font-semibold text-gray-300 text-center col-span-full'>
							No products found
						</h2>
					)}
					{products?.map((product) => (
						<ProductCard key={product._id} product={product} />
					))}
				</motion.div>
			</div>

			{/* LESSON: Video modal — only renders when showVideo is true */}
			{showVideo && videoUrl && (
				<VideoPlayer
					videoUrl={videoUrl}
					categoryName={category}
					onClose={() => setShowVideo(false)}
				/>
			)}
		</div>
	);
};

export default CategoryPage;