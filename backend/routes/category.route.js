import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
	uploadCategoryVideo,
	getCategoryVideo,
	deleteCategoryVideo,
} from "../controllers/category.controller.js";

const router = express.Router();

// ─────────────────────────────────────────────
// LESSON: Route protection levels
//
// Public route (anyone can access):
// GET /api/categories/:category/video
// → customers need to see the video
//
// Protected + Admin only:
// POST /api/categories/upload-video
// DELETE /api/categories/:category/video
// → only admin can upload/delete videos
// ─────────────────────────────────────────────

// Public — customers fetch category video
router.get("/:category/video", getCategoryVideo);

// Admin only — upload video for a category
router.post("/upload-video", protectRoute, adminRoute, uploadCategoryVideo);

// Admin only — delete video for a category
router.delete("/:category/video", protectRoute, adminRoute, deleteCategoryVideo);

export default router;