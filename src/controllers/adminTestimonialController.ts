import type { Request, Response, NextFunction } from "express";
import { ensureCsrfToken } from "../middleware/auth.js";
import type { TestimonialRecord, TestimonialInput } from "../models/types.js";
import {
  listAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../repositories/testimonialRepository.js";

/** Normalized shape the edit form renders (works for new + edit). */
interface TestimonialForm {
  id: number | null;
  quote: string;
  name: string;
  company: string;
  rating: number;
  published: boolean;
  sortOrder: number;
}

function emptyForm(): TestimonialForm {
  return {
    id: null,
    quote: "",
    name: "",
    company: "",
    rating: 5,
    published: true,
    sortOrder: 0,
  };
}

function recordToForm(t: TestimonialRecord): TestimonialForm {
  return {
    id: t.id,
    quote: t.quote,
    name: t.name,
    company: t.company,
    rating: t.rating,
    published: t.published,
    sortOrder: t.sortOrder,
  };
}

/** Build the DB write payload from a submitted form, with safe defaults. */
function parseForm(req: Request): TestimonialInput {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const ratingNum = Math.round(Number(b.rating));
  const rating = Number.isFinite(ratingNum) ? Math.min(5, Math.max(1, ratingNum)) : 5;
  const orderNum = parseInt(String(b.sortOrder ?? ""), 10);
  return {
    quote: String(b.quote ?? "").trim(),
    name: String(b.name ?? "").trim(),
    company: String(b.company ?? "").trim(),
    rating,
    published:
      b.published === "on" || b.published === "true" || b.published === true,
    sortOrder: Number.isFinite(orderNum) ? orderNum : 0,
  };
}

function inputToForm(input: TestimonialInput, id: number | null): TestimonialForm {
  return { id, ...input };
}

function validate(input: TestimonialInput): string | null {
  if (!input.quote) return "A quote is required.";
  if (!input.name) return "A name is required.";
  return null;
}

export async function renderList(req: Request, res: Response): Promise<void> {
  const testimonials = await listAllTestimonials();
  res.render("admin/testimonials-list", {
    testimonials,
    csrf: ensureCsrfToken(req),
    flash: typeof req.query.flash === "string" ? req.query.flash : null,
  });
}

export function renderNew(req: Request, res: Response): void {
  res.render("admin/testimonial-edit", {
    mode: "new",
    form: emptyForm(),
    error: null,
    action: "/admin/testimonials",
    csrf: ensureCsrfToken(req),
  });
}

export async function renderEdit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next();
  const testimonial = await getTestimonialById(id);
  if (!testimonial) return next();
  res.render("admin/testimonial-edit", {
    mode: "edit",
    form: recordToForm(testimonial),
    error: null,
    action: `/admin/testimonials/${id}`,
    csrf: ensureCsrfToken(req),
  });
}

export async function createAction(req: Request, res: Response): Promise<void> {
  const input = parseForm(req);
  const error = validate(input);
  if (error) {
    res.status(400).render("admin/testimonial-edit", {
      mode: "new",
      form: inputToForm(input, null),
      error,
      action: "/admin/testimonials",
      csrf: ensureCsrfToken(req),
    });
    return;
  }
  await createTestimonial(input);
  res.redirect("/admin/testimonials?flash=created");
}

export async function updateAction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next();
  const existing = await getTestimonialById(id);
  if (!existing) return next();

  const input = parseForm(req);
  const error = validate(input);
  if (error) {
    res.status(400).render("admin/testimonial-edit", {
      mode: "edit",
      form: inputToForm(input, id),
      error,
      action: `/admin/testimonials/${id}`,
      csrf: ensureCsrfToken(req),
    });
    return;
  }
  await updateTestimonial(id, input);
  res.redirect("/admin/testimonials?flash=updated");
}

export async function deleteAction(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isInteger(id)) await deleteTestimonial(id);
  res.redirect("/admin/testimonials?flash=deleted");
}

/** Quick show/hide toggle from the list view. */
export async function toggleAction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next();
  const existing = await getTestimonialById(id);
  if (!existing) return next();
  await updateTestimonial(id, {
    quote: existing.quote,
    name: existing.name,
    company: existing.company,
    rating: existing.rating,
    published: !existing.published,
    sortOrder: existing.sortOrder,
  });
  res.redirect("/admin/testimonials?flash=toggled");
}
