import cloudinary from "../lib/cloudinary.js";
import Category from "../models/category.model.js";

// ─────────────────────────────────────────────
// LESSON: Upload video for a category
// This is called when admin uploads a video
// from the dashboard
// ─────────────────────────────────────────────
export const uploadCategoryVideo = async (req, res) => {
	try {
		const { category, video } = req.body;
		// video = base64 encoded video string from frontend
		// category = category name e.g. "jeans"

		if (!category || !video) {
			return res.status(400).json({ message: "Category and video are required" });
		}

		// Step 1: Check if category already has a video
		// If yes, delete the old one from Cloudinary first
		const existingCategory = await Category.findOne({ name: category.toLowerCase() });

		if (existingCategory?.videoPublicId) {
			// LESSON: Delete old video from Cloudinary
			// Same as deleting old product images
			await cloudinary.uploader.destroy(existingCategory.videoPublicId, {
				resource_type: "video", // ← important! tell Cloudinary it's a video
			});
		}

		// Step 2: Upload new video to Cloudinary
		// LESSON: Same as image upload but with resource_type: "video"
		const cloudinaryResponse = await cloudinary.uploader.upload(video, {
			folder: "category-videos", // stored in separate folder
			resource_type: "video", // ← tells Cloudinary this is a video
		});

		// Step 3: Save or update category in MongoDB
		const updatedCategory = await Category.findOneAndUpdate(
			{ name: category.toLowerCase() }, // find by category name
			{
				name: category.toLowerCase(),
				videoUrl: cloudinaryResponse.secure_url, // video URL from Cloudinary
				videoPublicId: cloudinaryResponse.public_id, // save for future deletion
			},
			{ upsert: true, new: true } // create if doesn't exist, return updated doc
		);

		res.status(200).json({
			message: "Video uploaded successfully",
			videoUrl: updatedCategory.videoUrl,
		});
	} catch (error) {
		console.log("Error in uploadCategoryVideo:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// ─────────────────────────────────────────────
// LESSON: Get video for a specific category
// Called when customer visits a category page
// ─────────────────────────────────────────────
export const getCategoryVideo = async (req, res) => {
	try {
		const { category } = req.params;

		const categoryDoc = await Category.findOne({ name: category.toLowerCase() });

		if (!categoryDoc || !categoryDoc.videoUrl) {
			// No video for this category — that's okay!
			return res.status(200).json({ videoUrl: null });
		}

		res.status(200).json({ videoUrl: categoryDoc.videoUrl });
	} catch (error) {
		console.log("Error in getCategoryVideo:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// ─────────────────────────────────────────────
// LESSON: Delete video for a category
// Admin can remove a video from the dashboard
// ─────────────────────────────────────────────
export const deleteCategoryVideo = async (req, res) => {
	try {
		const { category } = req.params;

		const categoryDoc = await Category.findOne({ name: category.toLowerCase() });

		if (!categoryDoc || !categoryDoc.videoPublicId) {
			return res.status(404).json({ message: "No video found for this category" });
		}

		// Delete from Cloudinary
		await cloudinary.uploader.destroy(categoryDoc.videoPublicId, {
			resource_type: "video",
		});

		// Remove from MongoDB
		await Category.findOneAndUpdate(
			{ name: category.toLowerCase() },
			{ videoUrl: null, videoPublicId: null }
		);

		res.status(200).json({ message: "Video deleted successfully" });
	} catch (error) {
		console.log("Error in deleteCategoryVideo:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};