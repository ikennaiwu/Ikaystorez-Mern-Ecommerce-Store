import { useState } from "react";
import { Upload, Trash2, Video, Loader } from "lucide-react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { computeRadarPoints } from "recharts/types/polar/Radar";

// List of all your categories
const CATEGORIES = [
	"slides",
	"coperate-shoes",
	"sneakers",
	"jeans",
	"t-shirts",
	"glasses",
	"joggers",
	"Beach-shirts",
	"Wrist-watches",
	"bags",
	"coperatefits",
	"underwears"
];

const CategoryVideoUpload = () => {
	const [selectedCategory, setSelectedCategory] = useState("");
	const [videoFile, setVideoFile] = useState(null);
	const [videoPreview, setVideoPreview] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// LESSON: Convert video file to base64
	// Same pattern as product image upload
	const handleVideoSelect = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Check file size — videos can be large!
		// Cloudinary free tier allows up to 100MB
		if (file.size > 100 * 1024 * 1024) {
			toast.error("Video must be less than 100MB");
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			setVideoFile(reader.result); // base64 string
			setVideoPreview(URL.createObjectURL(file)); // for preview
		};
		reader.readAsDataURL(file);
	};

	// Upload video to backend
	const handleUpload = async () => {
		if (!selectedCategory) {
			toast.error("Please select a category first");
			return;
		}
		if (!videoFile) {
			toast.error("Please select a video first");
			return;
		}

		setIsUploading(true);
		try {
			await axios.post("/categories/upload-video", {
				category: selectedCategory,
				video: videoFile,
			});

			toast.success(`Video uploaded for ${selectedCategory}!`);
			setVideoFile(null);
			setVideoPreview(null);
		} catch (error) {
			toast.error("Failed to upload video");
			console.log(error);
		} finally {
			setIsUploading(false);
		}
	};

	// Delete video for a category
	const handleDelete = async () => {
		if (!selectedCategory) {
			toast.error("Please select a category first");
			return;
		}

		setIsDeleting(true);
		try {
			await axios.delete(`/categories/${selectedCategory}/video`);
			toast.success(`Video removed from ${selectedCategory}`);
			setVideoFile(null);
			setVideoPreview(null);
		} catch (error) {
			toast.error("Failed to delete video");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className='max-w-2xl mx-auto'>
			<div
				className='rounded-lg p-6'
				style={{ background: "#1a1a2e", border: "1px solid #2a2a4a" }}
			>
				<h2 className='text-2xl font-bold text-white mb-2 flex items-center gap-2'>
					<Video size={24} />
					Category Videos
				</h2>
				<p className='text-gray-400 text-sm mb-6'>
					Upload a video for each category. Customers will see a "Watch Preview" button on the category page.
				</p>

				{/* Category Selector */}
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-300 mb-2 tracking-widest uppercase'>
						Select Category
					</label>
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className='w-full px-4 py-2 rounded-sm text-white'
						style={{ background: "#2d2d2d", border: "1px solid #3a3a3a" }}
					>
						<option value=''>-- Choose a category --</option>
						{CATEGORIES.map((cat) => (
							<option key={cat} value={cat}>
								{cat.charAt(0).toUpperCase() + cat.slice(1)}
							</option>
						))}
					</select>
				</div>

				{/* Video Upload Area */}
				<div className='mb-6'>
					<label className='block text-sm font-medium text-gray-300 mb-2 tracking-widest uppercase'>
						Upload Video (Max 100MB)
					</label>
					<div
						className='border-2 border-dashed rounded-sm p-8 text-center cursor-pointer hover:border-gray-500 transition duration-300'
						style={{ borderColor: "#3a3a3a" }}
						onClick={() => document.getElementById("video-upload").click()}
					>
						<input
							id='video-upload'
							type='file'
							accept='video/*'
							onChange={handleVideoSelect}
							className='hidden'
						/>
						{videoPreview ? (
							<video
								src={videoPreview}
								controls
								className='w-full rounded-sm max-h-48'
							/>
						) : (
							<div className='flex flex-col items-center gap-2'>
								<Upload size={32} className='text-gray-500' />
								<p className='text-gray-400 text-sm'>
									Click to select a video file
								</p>
								<p className='text-gray-600 text-xs'>
									MP4, MOV, AVI supported
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Action Buttons */}
				<div className='flex gap-3'>
					{/* Upload Button */}
					<button
						onClick={handleUpload}
						disabled={isUploading || !selectedCategory || !videoFile}
						className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm font-semibold text-sm tracking-widest uppercase transition duration-300 disabled:opacity-50'
						style={{ background: "linear-gradient(135deg, #1e40af, #2563eb)", color: "#fff" }}
					>
						{isUploading ? (
							<><Loader size={16} className='animate-spin' /> Uploading...</>
						) : (
							<><Upload size={16} /> Upload Video</>
						)}
					</button>

					{/* Delete Button */}
					<button
						onClick={handleDelete}
						disabled={isDeleting || !selectedCategory}
						className='flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm font-semibold text-sm tracking-widest uppercase transition duration-300 disabled:opacity-50'
						style={{ background: "#7f1d1d", color: "#fff", border: "1px solid #991b1b" }}
					>
						{isDeleting ? (
							<Loader size={16} className='animate-spin' />
						) : (
							<Trash2 size={16} />
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default CategoryVideoUpload;