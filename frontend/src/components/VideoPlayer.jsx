import { X } from "lucide-react";
import { useEffect } from "react";

// ─────────────────────────────────────────────
// LESSON: This is a modal component
// It shows on top of everything when opened
// and closes when user clicks X or outside
// ─────────────────────────────────────────────

const VideoPlayer = ({ videoUrl, onClose, categoryName }) => {
	// Close modal when Escape key is pressed
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	return (
		// Backdrop — dark overlay behind the video
		<div
			className='fixed inset-0 z-50 flex items-center justify-center p-4'
			style={{ background: "rgba(0,0,0,0.85)" }}
			onClick={onClose} // click outside to close
		>
			{/* Video container — stop click from closing when clicking video */}
			<div
				className='relative w-full max-w-3xl rounded-lg overflow-hidden'
				style={{ border: "1px solid #3a3a3a" }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div
					className='flex items-center justify-between px-4 py-3'
					style={{ background: "#1a1a1a" }}
				>
					<h3 className='text-white font-semibold tracking-wide uppercase text-sm'>
						{categoryName} — Preview
					</h3>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-white transition duration-200'
					>
						<X size={20} />
					</button>
				</div>

				{/* Video player */}
				<video
					src={videoUrl}
					controls
					autoPlay
					className='w-full'
					style={{ maxHeight: "70vh", background: "#000" }}
				>
					Your browser does not support the video tag.
				</video>
			</div>
		</div>
	);
};

export default VideoPlayer;