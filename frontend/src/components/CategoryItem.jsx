import { Link } from "react-router-dom";

const CategoryItem = ({ category }) => {
	return (
		<div
			className='relative overflow-hidden h-96 w-full group'
			style={{
				borderRadius: "4px",
				border: "1px solid #3a3a3a",
				boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
			}}
		>
			<Link to={"/category" + category.href}>
				<div className='w-full h-full cursor-pointer'>
					{/* Dark gunmetal gradient overlay */}
					<div
						className='absolute inset-0 z-10 transition-opacity duration-500 group-hover:opacity-70'
						style={{
							background: "linear-gradient(to bottom, rgba(26,26,26,0.2) 0%, rgba(15,15,15,0.85) 100%)",
						}}
					/>

					{/* Hover shine effect */}
					<div
						className='absolute inset-0 z-10 opacity-0 group-hover:opacity-20 transition-opacity duration-500'
						style={{
							background: "linear-gradient(135deg, #ffffff 0%, transparent 60%)",
						}}
					/>

					<img
						src={category.imageUrl}
						alt={category.name}
						className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110'
						loading='lazy'
					/>

					{/* Bottom text */}
					<div className='absolute bottom-0 left-0 right-0 p-5 z-20'>
						{/* Top divider line */}
						<div
							className='mb-3 w-8 group-hover:w-16 transition-all duration-300'
							style={{ height: "1px", background: "linear-gradient(90deg, #e2e8f0, transparent)" }}
						/>
						<h3
							className='text-white text-2xl font-bold mb-1 tracking-wide'
							style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
						>
							{category.name}
						</h3>
						<p
							className='text-sm tracking-widest uppercase flex items-center gap-2'
							style={{ color: "#9ca3af" }}
						>
							Explore
							<span
								className='inline-block w-0 group-hover:w-6 overflow-hidden transition-all duration-300'
								style={{ height: "1px", background: "#9ca3af", verticalAlign: "middle", display: "inline-block", marginBottom: "2px" }}
							/>
						</p>
					</div>
				</div>
			</Link>
		</div>
	);
};

export default CategoryItem;