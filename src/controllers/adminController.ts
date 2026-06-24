import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { ensureCsrfToken, passwordMatches } from "../middleware/auth.js";
import { uploadedUrl } from "../middleware/upload.js";
import { slugify } from "../lib/markdown.js";
import type { BlogPostRecord, PostInput } from "../models/types.js";
import {
  listAllPosts,
  listCategories,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  slugExists,
} from "../repositories/postRepository.js";

const DEFAULT_IMAGE = "/assets/images/laptop-mockup-square.webp";

/** Normalized shape the edit form template renders (works for new + edit). */
interface PostForm {
  id: number | null;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image: string;
  published: boolean;
  date: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(): PostForm {
  return {
    id: null,
    slug: "",
    title: "",
    excerpt: "",
    body: "",
    category: "",
    image: DEFAULT_IMAGE,
    published: false,
    date: "",
  };
}

function recordToForm(p: BlogPostRecord): PostForm {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    body: p.body,
    category: p.category,
    image: p.image,
    published: p.published,
    date: p.date,
  };
}

/** Build the DB write payload from a submitted form, deriving sensible defaults. */
function parseForm(req: Request): PostInput {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  const rawSlug = String(b.slug ?? "").trim();
  const slug = rawSlug ? slugify(rawSlug) : slugify(title);
  const published =
    b.published === "on" || b.published === "true" || b.published === true;
  let publishedAt = String(b.date ?? "").trim();
  if (!publishedAt && published) publishedAt = todayIso();
  return {
    slug,
    title,
    excerpt: String(b.excerpt ?? "").trim(),
    body: String(b.body ?? ""),
    category: String(b.category ?? "").trim() || "General",
    // Resolved later (upload > typed URL > existing > default).
    image: String(b.image ?? "").trim(),
    published,
    publishedAt: publishedAt || null,
  };
}

/**
 * Decide the post's cover image: a freshly uploaded file wins, then a typed
 * path/URL, then the existing image (on edit), then the default.
 */
function resolveImage(req: Request, typed: string, existingImage?: string): string {
  if (req.file) return uploadedUrl(req.file.filename);
  if (typed) return typed;
  if (existingImage) return existingImage;
  return DEFAULT_IMAGE;
}

/** Mirror a PostInput back into the form shape (for re-rendering on error). */
function inputToForm(input: PostInput, id: number | null): PostForm {
  return {
    id,
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    category: input.category,
    image: input.image,
    published: input.published,
    date: input.publishedAt ?? "",
  };
}

function validate(input: PostInput): string | null {
  if (!input.title) return "Title is required.";
  if (!input.slug) return "A URL slug is required (it can be derived from the title).";
  return null;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export function renderLogin(req: Request, res: Response): void {
  if (req.session?.authed) {
    res.redirect("/admin");
    return;
  }
  res.render("admin/login", {
    error: env.adminPassword ? null : "ADMIN_PASSWORD is not set on the server.",
    csrf: ensureCsrfToken(req),
  });
}

export function submitLogin(req: Request, res: Response): void {
  const password = String(req.body?.password ?? "");
  if (!passwordMatches(password, env.adminPassword)) {
    res.status(401).render("admin/login", {
      error: "Incorrect password.",
      csrf: ensureCsrfToken(req),
    });
    return;
  }
  if (req.session) {
    req.session.authed = true;
    // Rotate the CSRF token across the privilege boundary.
    req.session.csrf = undefined;
  }
  res.redirect("/admin");
}

export function logout(req: Request, res: Response): void {
  req.session = null;
  res.redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function renderPostList(req: Request, res: Response): Promise<void> {
  const posts = await listAllPosts();
  res.render("admin/list", {
    posts,
    csrf: ensureCsrfToken(req),
    flash: typeof req.query.flash === "string" ? req.query.flash : null,
  });
}

export async function renderNewPost(req: Request, res: Response): Promise<void> {
  res.render("admin/edit", {
    mode: "new",
    form: emptyForm(),
    categories: await listCategories(),
    error: null,
    action: "/admin/posts",
    csrf: ensureCsrfToken(req),
  });
}

export async function renderEditPost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next();
  const post = await getPostById(id);
  if (!post) return next();
  res.render("admin/edit", {
    mode: "edit",
    form: recordToForm(post),
    categories: await listCategories(),
    error: null,
    action: `/admin/posts/${id}`,
    csrf: ensureCsrfToken(req),
  });
}

export async function createPostAction(req: Request, res: Response): Promise<void> {
  const input = parseForm(req);
  const error =
    (res.locals.uploadError as string | undefined) ??
    validate(input) ??
    ((await slugExists(input.slug)) ? "That slug is already in use." : null);
  if (error) {
    res.status(400).render("admin/edit", {
      mode: "new",
      form: inputToForm(input, null),
      categories: await listCategories(),
      error,
      action: "/admin/posts",
      csrf: ensureCsrfToken(req),
    });
    return;
  }
  input.image = resolveImage(req, input.image);
  await createPost(input);
  res.redirect("/admin?flash=created");
}

export async function updatePostAction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next();
  const existing = await getPostById(id);
  if (!existing) return next();

  const input = parseForm(req);
  const error =
    (res.locals.uploadError as string | undefined) ??
    validate(input) ??
    ((await slugExists(input.slug, id)) ? "That slug is already in use." : null);
  if (error) {
    // Keep the current cover image visible in the preview on re-render.
    res.status(400).render("admin/edit", {
      mode: "edit",
      form: inputToForm({ ...input, image: input.image || existing.image }, id),
      categories: await listCategories(),
      error,
      action: `/admin/posts/${id}`,
      csrf: ensureCsrfToken(req),
    });
    return;
  }
  input.image = resolveImage(req, input.image, existing.image);
  await updatePost(id, input);
  res.redirect("/admin?flash=updated");
}

export async function deletePostAction(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isInteger(id)) await deletePost(id);
  res.redirect("/admin?flash=deleted");
}

/** Quick publish/unpublish toggle from the list view. */
export async function togglePublishAction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next();
  const existing = await getPostById(id);
  if (!existing) return next();

  const nowPublished = !existing.published;
  const input: PostInput = {
    slug: existing.slug,
    title: existing.title,
    excerpt: existing.excerpt,
    body: existing.body,
    category: existing.category,
    image: existing.image,
    published: nowPublished,
    publishedAt: existing.date || (nowPublished ? todayIso() : null),
  };
  await updatePost(id, input);
  res.redirect("/admin?flash=toggled");
}
