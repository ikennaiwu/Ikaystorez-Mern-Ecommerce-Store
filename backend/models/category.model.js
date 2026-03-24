import mongoose from "mongoose";

// LESSON: This model stores one document per category
// Each category can have one video URL from Cloudinary
// We use the category name as a unique identifier

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true, // one document per category
			lowercase: true, // "Jeans" → "jeans" (matches URL params)
		},
		videoUrl: {
			type: String,
			default: null, // null means no video uploaded yet
		},
		videoPublicId: {
			type: String,
			default: null, // Cloudinary public ID (needed to delete old video)
		},
	},
	{ timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;