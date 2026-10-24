import app from "./api";

// Cloudflare sends /api/* here; every other path is served from dist as static files.
export default app;