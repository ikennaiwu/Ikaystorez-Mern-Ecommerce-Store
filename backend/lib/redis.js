import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  tls: {}, // required for Upstash rediss:// connections
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null; // stop retrying after 3 attempts
    return Math.min(times * 200, 1000);
  },
});

redis.on("connect", () => console.log("Redis connected ✅"));
redis.on("error", (err) => console.log("Redis error:", err.message));