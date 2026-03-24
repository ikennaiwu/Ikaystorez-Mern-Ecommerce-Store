import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();    

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 120000, // ← 2 minutes timeout for large video uploads
});

export default cloudinary;