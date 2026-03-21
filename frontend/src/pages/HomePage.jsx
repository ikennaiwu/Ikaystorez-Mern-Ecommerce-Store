import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
	{ href: "/slides", name: "Slides", imageUrl: "/Slides.jpeg" },
	{ href: "/coperate-shoes", name: "Coperate-Shoes", imageUrl: "/coperate-shoes.jpeg" },
	{ href: "/sneakers", name: "Sneaker", imageUrl: "/shoes.jpeg" },
	{ href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
	{ href: "/t-shirts", name: "T-shirts", imageUrl: "/T-polo.jpeg" },
	{ href: "/glasses", name: "Glasses", imageUrl: "/glasses.png" },
	{ href: "/joggers", name: "Joggers", imageUrl: "/Joggers.jpeg" },
	{ href: "/Beach-shirts", name: "Beach-shirts", imageUrl: "/Cuba-shirt2.jpeg" },
	{ href: "/Wrist-watches", name: "Wrist-Watches", imageUrl: "/Watch.jpeg" },
	{ href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<div
			className='relative min-h-screen overflow-hidden'
			style={{ background: "linear-gradient(160deg, #1a1a1a 0%, #2d2d2d 40%, #3a3a3a 70%, #1f1f1f 100%)" }}
		>
			{/* Gunmetal texture overlay */}
			<div
				className='absolute inset-0 opacity-30'
				style={{
					backgroundImage: "radial-gradient(ellipse at 20% 50%, #4a4a4a 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #555555 0%, transparent 50%)",
				}}
			/>

			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>

				{/* Header */}
				<div className='text-center mb-14'>
					<h1
						className='text-5xl sm:text-6xl font-bold mb-4'
						style={{
							background: "linear-gradient(135deg, #ffffff 0%, #a0aec0 50%, #e2e8f0 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							letterSpacing: "0.02em",
						}}
					>
						Explore Our Categories
					</h1>
					<p className='text-lg' style={{ color: "#9ca3af", letterSpacing: "0.05em" }}>
						Discover the latest trends in premium fashion
					</p>
					{/* Decorative line */}
					<div className='flex items-center justify-center mt-6 gap-3'>
						<div style={{ height: "1px", width: "60px", background: "linear-gradient(90deg, transparent, #6b7280)" }} />
						<div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#9ca3af" }} />
						<div style={{ height: "1px", width: "60px", background: "linear-gradient(90deg, #6b7280, transparent)" }} />
					</div>
				</div>

				{/* Category Grid */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.name} />
					))}
				</div>

				{!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			</div>
		</div>
	);
};

export default HomePage;