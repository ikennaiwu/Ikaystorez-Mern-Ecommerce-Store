import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
	const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";
	const { cart } = useCartStore();

	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&display=swap');
				.brand-font {
					font-family: 'Playfair Display', serif;
					font-style: italic;
					font-weight: 700;
				}
				.nav-link::after {
					content: '';
					display: block;
					width: 0;
					height: 2px;
					background: #1a1a1a;
					transition: width 0.3s ease;
				}
				.nav-link:hover::after {
					width: 100%;
				}
			`}</style>

			<header
				className='fixed top-0 left-0 w-full z-40 transition-all duration-300'
				style={{
					background: "linear-gradient(90deg, #d1d5db 0%, #e5e7eb 50%, #d1d5db 100%)",
					borderBottom: "2px solid #9ca3af",
					boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
				}}
			>
				<div className='container mx-auto px-6 py-4'>
					<div className='flex flex-wrap justify-between items-center'>

						{/* Logo - Black text on light background */}
						<Link to='/'>
							<span
								className='brand-font text-3xl'
								style={{
									color: "#111111",
									letterSpacing: "0.03em",
								}}
							>
								Ikaystorez
							</span>
						</Link>

						{/* Nav Links */}
						<nav className='flex flex-wrap items-center gap-4'>
							<Link
								to={"/"}
								className='nav-link text-gray-800 hover:text-black text-sm font-semibold tracking-widest uppercase transition duration-300 ease-in-out'
							>
								Home
							</Link>

							{user && (
								<Link
									to={"/cart"}
									className='relative group text-gray-800 hover:text-black transition duration-300 ease-in-out flex items-center gap-1'
								>
									<ShoppingCart size={20} />
									<span className='hidden sm:inline text-sm font-semibold tracking-widest uppercase'>Cart</span>
									{cart.length > 0 && (
										<span
											className='absolute -top-2 -left-1 text-white rounded-full px-1.5 py-0.5 text-xs font-bold'
											style={{ background: "#111111" }}
										>
											{cart.length}
										</span>
									)}
								</Link>
							)}

							{isAdmin && (
								<Link
									to={"/secret-dashboard"}
									className='flex items-center gap-1 px-3 py-1.5 rounded-sm text-sm font-semibold tracking-widest uppercase transition duration-300 ease-in-out hover:bg-black hover:text-white'
									style={{ border: "2px solid #111111", color: "#111111" }}
								>
									<Lock size={14} />
									<span className='hidden sm:inline'>Dashboard</span>
								</Link>
							)}

							{user ? (
								<button
									onClick={logout}
									className='flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-semibold tracking-widest uppercase transition duration-300 ease-in-out hover:bg-black hover:text-white'
									style={{ border: "2px solid #374151", color: "#1f2937" }}
								>
									<LogOut size={16} />
									<span className='hidden sm:inline'>Log Out</span>
								</button>
							) : (
								<>
									<Link
										to={"/signup"}
										className='flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold tracking-widest uppercase transition duration-300 ease-in-out hover:bg-gray-800 hover:text-white'
										style={{ background: "#111111", color: "#ffffff" }}
									>
										<UserPlus size={16} />
										<span>Sign Up</span>
									</Link>
									<Link
										to={"/login"}
										className='flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-semibold tracking-widest uppercase transition duration-300 ease-in-out hover:bg-black hover:text-white'
										style={{ border: "2px solid #374151", color: "#1f2937" }}
									>
										<LogIn size={16} />
										<span>Login</span>
									</Link>
								</>
							)}
						</nav>
					</div>
				</div>
			</header>
		</>
	);
};

export default Navbar;