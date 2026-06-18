/**
 * Vercel serverless entry point.
 * Static files in /public are served by the CDN before this handler runs.
 */
import { createApp } from "../dist/app.js";

export default createApp();
