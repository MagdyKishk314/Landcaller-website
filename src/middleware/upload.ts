import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

/**
 * Cover-image uploads for the blog admin. Files are written to public/uploads
 * (served at /uploads) so they persist on a VPS's disk. On a read-only
 * serverless filesystem the write fails and we surface a friendly error -
 * authors can still paste an image URL/path instead.
 */

const UPLOAD_DIR =
  process.env.UPLOADS_DIR || path.resolve(process.cwd(), "public", "uploads");

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    try {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(err as Error, UPLOAD_DIR);
    }
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}`;
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok = file.mimetype.startsWith("image/") && ALLOWED_EXT.has(ext);
    // Reject by skipping the file (not erroring) so the rest of the form still
    // parses; flag it so the controller can report via res.locals.uploadError.
    if (!ok) (req as Request & { uploadRejected?: boolean }).uploadRejected = true;
    cb(null, ok);
  },
});

const single = upload.single("imageFile");

/** Public URL for an uploaded file. */
export function uploadedUrl(filename: string): string {
  return `/uploads/${filename}`;
}

/**
 * Run the cover-image upload, converting any multer error into a friendly
 * message on res.locals.uploadError instead of crashing the request.
 */
export function uploadCover(req: Request, res: Response, next: NextFunction): void {
  single(req, res, (err: unknown) => {
    if (err) {
      const code = (err as { code?: string }).code;
      res.locals.uploadError =
        code === "LIMIT_FILE_SIZE"
          ? "That image is too large (max 8 MB)."
          : "Could not upload that image. Try a different file, or paste a URL/path.";
    } else if ((req as Request & { uploadRejected?: boolean }).uploadRejected) {
      res.locals.uploadError = "Unsupported image type. Use JPG, PNG, WebP, GIF, or AVIF.";
    }
    next();
  });
}
