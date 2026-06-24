import { Router } from "express";
import cookieSession from "cookie-session";
import { env } from "../config/env.js";
import { site, navLinks, footerLinks } from "../config/site.js";
import { requireAuth, verifyCsrf } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { uploadCover } from "../middleware/upload.js";
import * as admin from "../controllers/adminController.js";
import * as testimonials from "../controllers/adminTestimonialController.js";

const adminRouter = Router();

// Admin pages are private: never index or cache them.
adminRouter.use((_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "no-store");
  next();
});

// The admin chrome reuses the public site header & footer so admins can jump
// back to the marketing pages. Expose the data those partials need to every
// admin view. `isHome: false` makes in-page anchor links resolve back to "/".
adminRouter.use((_req, res, next) => {
  res.locals.site = site;
  res.locals.navLinks = navLinks;
  res.locals.footerLinks = footerLinks;
  res.locals.isHome = false;
  res.locals.year = new Date().getFullYear();
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
adminRouter.get("/posts/new", asyncHandler(admin.renderNewPost));
adminRouter.post("/posts", uploadCover, verifyCsrf, asyncHandler(admin.createPostAction));
adminRouter.get("/posts/:id/edit", asyncHandler(admin.renderEditPost));
adminRouter.post("/posts/:id", uploadCover, verifyCsrf, asyncHandler(admin.updatePostAction));
adminRouter.post("/posts/:id/delete", verifyCsrf, asyncHandler(admin.deletePostAction));
adminRouter.post("/posts/:id/publish", verifyCsrf, asyncHandler(admin.togglePublishAction));

// Testimonials CRUD (no file uploads, so no multer middleware).
adminRouter.get("/testimonials", asyncHandler(testimonials.renderList));
adminRouter.get("/testimonials/new", testimonials.renderNew);
adminRouter.post("/testimonials", verifyCsrf, asyncHandler(testimonials.createAction));
adminRouter.get("/testimonials/:id/edit", asyncHandler(testimonials.renderEdit));
adminRouter.post("/testimonials/:id", verifyCsrf, asyncHandler(testimonials.updateAction));
adminRouter.post("/testimonials/:id/delete", verifyCsrf, asyncHandler(testimonials.deleteAction));
adminRouter.post("/testimonials/:id/publish", verifyCsrf, asyncHandler(testimonials.toggleAction));

export default adminRouter;
