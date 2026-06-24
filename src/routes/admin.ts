import { Router } from "express";
import cookieSession from "cookie-session";
import { env } from "../config/env.js";
import { requireAuth, verifyCsrf } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { uploadCover } from "../middleware/upload.js";
import * as admin from "../controllers/adminController.js";

const adminRouter = Router();

// Admin pages are private: never index or cache them.
adminRouter.use((_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Stateless signed-cookie session - works on Vercel's read-only filesystem.
adminRouter.use(
  cookieSession({
    name: "lc_admin",
    secret: env.sessionSecret,
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
);

// Unauthenticated endpoints.
adminRouter.get("/login", admin.renderLogin);
adminRouter.post("/login", verifyCsrf, admin.submitLogin);
adminRouter.post("/logout", verifyCsrf, admin.logout);

// Everything below requires a valid session.
adminRouter.use(requireAuth);

adminRouter.get("/", asyncHandler(admin.renderPostList));
adminRouter.get("/posts/new", admin.renderNewPost);
adminRouter.post("/posts", uploadCover, verifyCsrf, asyncHandler(admin.createPostAction));
adminRouter.get("/posts/:id/edit", asyncHandler(admin.renderEditPost));
adminRouter.post("/posts/:id", uploadCover, verifyCsrf, asyncHandler(admin.updatePostAction));
adminRouter.post("/posts/:id/delete", verifyCsrf, asyncHandler(admin.deletePostAction));
adminRouter.post("/posts/:id/publish", verifyCsrf, asyncHandler(admin.togglePublishAction));

export default adminRouter;
