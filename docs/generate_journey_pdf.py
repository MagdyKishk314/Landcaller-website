#!/usr/bin/env python3
"""Generate the Visitor Journey Analysis PDF for the Land Caller landing page.

Run:  python docs/generate_journey_pdf.py
Output:  docs/Visitor-Journey-Analysis.pdf
"""
from fpdf import FPDF
from fpdf.enums import XPos, YPos

# Brand palette
ORANGE = (232, 82, 58)      # #E8523A
INK = (24, 24, 24)          # near-black body text
MUTED = (110, 110, 110)     # secondary text
HAIR = (220, 220, 220)      # hairlines
PANEL = (245, 243, 241)     # light panel fill
DARK = (14, 14, 14)         # #0E0E0E cover

PAGE_W = 210
MARGIN = 18
CONTENT_W = PAGE_W - 2 * MARGIN


def clean(s: str) -> str:
    """Replace characters Latin-1 core fonts can't render."""
    return (s.replace("’", "'").replace("‘", "'")
             .replace("“", '"').replace("”", '"')
             .replace("—", "-").replace("–", "-")
             .replace("→", "->").replace("…", "...")
             .replace("×", "x"))


class PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*ORANGE)
        self.set_xy(MARGIN, 10)
        self.cell(0, 6, "LAND CALLER")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*MUTED)
        self.cell(0, 6, "Visitor Journey Analysis", align="R")
        self.set_draw_color(*HAIR)
        self.line(MARGIN, 18, PAGE_W - MARGIN, 18)
        self.set_y(26)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-15)
        self.set_draw_color(*HAIR)
        self.line(MARGIN, self.get_y(), PAGE_W - MARGIN, self.get_y())
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*MUTED)
        self.set_y(-12)
        self.cell(0, 6, "Confidential - Land Caller", align="L")
        self.cell(0, 6, f"Page {self.page_no() - 1}", align="R")


def h2(pdf, text):
    pdf.ln(2)
    pdf.set_font("Helvetica", "B", 15)
    pdf.set_text_color(*INK)
    pdf.multi_cell(CONTENT_W, 8, clean(text))
    pdf.set_draw_color(*ORANGE)
    y = pdf.get_y() + 1
    pdf.set_line_width(0.8)
    pdf.line(MARGIN, y, MARGIN + 16, y)
    pdf.set_line_width(0.2)
    pdf.ln(5)


def body(pdf, text):
    pdf.set_font("Helvetica", "", 10.5)
    pdf.set_text_color(*INK)
    pdf.multi_cell(CONTENT_W, 5.6, clean(text))
    pdf.ln(2)


def label(pdf, text):
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.set_text_color(*ORANGE)
    pdf.cell(0, 5, clean(text.upper()))
    pdf.ln(6)


def bullets(pdf, items):
    pdf.set_font("Helvetica", "", 10.5)
    for it in items:
        pdf.set_x(MARGIN)
        pdf.set_text_color(*ORANGE)
        pdf.cell(5, 5.4, chr(149), new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_text_color(*INK)
        pdf.set_x(MARGIN + 5)
        pdf.multi_cell(CONTENT_W - 5, 5.4, clean(it),
                       new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)


def section_block(pdf, idx, name, role, what, why):
    """One landing-page section: numbered card with What / Why."""
    if pdf.get_y() > 235:
        pdf.add_page()
    pdf.set_draw_color(*HAIR)
    pdf.set_fill_color(*PANEL)
    start_y = pdf.get_y()

    # number chip
    pdf.set_fill_color(*ORANGE)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 11)
    pdf.rect(MARGIN, start_y, 9, 9, style="F")
    pdf.text(MARGIN + (2.0 if idx >= 10 else 3.4), start_y + 6.3, str(idx))

    # title + role
    pdf.set_xy(MARGIN + 13, start_y - 0.5)
    pdf.set_font("Helvetica", "B", 12.5)
    pdf.set_text_color(*INK)
    pdf.cell(0, 6, clean(name))
    pdf.set_xy(MARGIN + 13, start_y + 5)
    pdf.set_font("Helvetica", "BI", 9.5)
    pdf.set_text_color(*ORANGE)
    pdf.cell(0, 5, clean(role))
    pdf.set_y(start_y + 12)

    pdf.set_x(MARGIN)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(*MUTED)
    pdf.cell(0, 5, "WHAT THE VISITOR SEES")
    pdf.ln(5)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*INK)
    pdf.multi_cell(CONTENT_W, 5.2, clean(what))
    pdf.ln(1)

    pdf.set_x(MARGIN)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(*MUTED)
    pdf.cell(0, 5, "WHY IT'S HERE")
    pdf.ln(5)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*INK)
    pdf.multi_cell(CONTENT_W, 5.2, clean(why))
    pdf.ln(7)


pdf = PDF(format="A4")
pdf.set_auto_page_break(auto=True, margin=20)
pdf.set_margins(MARGIN, 26, MARGIN)

# ---------------------------------------------------------------- COVER
pdf.add_page()
pdf.set_fill_color(*DARK)
pdf.rect(0, 0, PAGE_W, 297, style="F")
pdf.set_xy(MARGIN, 60)
pdf.set_font("Helvetica", "B", 13)
pdf.set_text_color(*ORANGE)
pdf.cell(0, 8, "LAND CALLER")
pdf.set_xy(MARGIN, 95)
pdf.set_font("Helvetica", "B", 34)
pdf.set_text_color(255, 255, 255)
pdf.multi_cell(CONTENT_W, 14, "Visitor Journey\nAnalysis")
pdf.set_xy(MARGIN, 140)
pdf.set_font("Helvetica", "", 13)
pdf.set_text_color(200, 200, 200)
pdf.multi_cell(CONTENT_W, 7,
    clean("How the landing page guides a land investor from cold "
          "visitor to booked strategy call - and the reasoning behind "
          "the order of every section."))
pdf.set_draw_color(*ORANGE)
pdf.set_line_width(1.2)
pdf.line(MARGIN, 168, MARGIN + 40, 168)
pdf.set_line_width(0.2)
pdf.set_xy(MARGIN, 250)
pdf.set_font("Helvetica", "", 10)
pdf.set_text_color(150, 150, 150)
pdf.cell(0, 6, "Marketing / Conversion Strategy")
pdf.set_xy(MARGIN, 256)
pdf.cell(0, 6, "landcaller.com")

# ---------------------------------------------------------------- INTRO
pdf.add_page()
h2(pdf, "The big idea: the visitor is the hero")
body(pdf,
     "The page is built on a simple story-selling principle: the land investor "
     "visiting the site is the hero, and Land Caller is the guide who hands them "
     "a plan and a clear next step. Every section has one job - move a skeptical "
     "visitor one notch closer to booking a call - by alternately building desire "
     "and removing friction.")
body(pdf,
     "Rather than a flat brochure, the page is a deliberate emotional arc: hook "
     "the dream, prove it instantly with social proof, make the product tangible, "
     "explain the simple plan, present the offer, then ask for the booking while "
     "objections are freshly answered. Below is the exact running order and the "
     "reasoning behind each beat.")

label(pdf, "The arc at a glance")
bullets(pdf, [
    "Hook -> the dream outcome (Hero)",
    "Proof you can measure (Results band)",
    "Proof from peers, shown early (Testimonials)",
    "Why we win (Why Land Caller)",
    "Proof you can hear (Real call samples)",
    "The stakes / the villain (The Problem)",
    "The guide you can trust (Who We Are)",
    "The simple plan (How It Works)",
    "The offer (Pricing teaser)",
    "Authority & education (Blog teaser)",
    "The ask (Booking CTA + FAQ)",
])

# ---------------------------------------------------------------- SECTIONS
pdf.add_page()
h2(pdf, "The journey, section by section")

sections = [
    ("Hero", "The hook - sell the dream, not the service",
     "Eyebrow 'Cold Calling Lead Generation for Land Investors', a bold promise "
     "headline 'Warm Land Seller Leads. Done For You.', a one-line value "
     "statement, two CTAs (Book A Call + 'Hear a real lead'), three trust badges "
     "(5.0 rating, hundreds of campaigns, US-based / TCPA compliant), and an "
     "iPad-framed CRM screenshot bleeding off the right edge.",
     "The first screen has to answer 'what's in it for me?' in under five seconds. "
     "We lead with the dream outcome (warm leads, done for you), not our features. "
     "The CRM visual makes an abstract service feel like a real, polished product. "
     "The secondary 'Hear a real lead' CTA plants curiosity early, and the trust "
     "badges quietly de-risk the page before the visitor has scrolled an inch."),

    ("Results band", "Hard numbers - quantify the promise",
     "A compact stat strip: 45 - 65 leads per agent / month, 3x higher contact rate, "
     "1:1 dedicated caller per campaign, 60-70% cheaper than direct mail.",
     "Immediately after the emotional hook we ground it in numbers so the claim "
     "doesn't feel like hype. Placing measurable outcomes this high sets the frame "
     "that everything below is backed by results, and gives a data-minded investor "
     "a reason to keep reading."),

    ("Testimonials", "Social proof, deliberately early - borrowed authority",
     "A 3-card slider of real land-investor testimonials under 'We proved that we "
     "can do it,' with the sub-line 'Hear from land investors already winning with "
     "Land Caller.'",
     "This is the most important sequencing decision on the page. Most sites bury "
     "testimonials at the bottom; we surface them near the top on purpose. A cold "
     "visitor is most skeptical at the start, so we spend peer credibility "
     "immediately - people trust other investors far more than they trust our own "
     "marketing copy. Establishing authority early lowers the visitor's guard and "
     "makes every claim that follows easier to believe."),

    ("Why Land Caller", "Differentiation - why us over the alternatives",
     "Top differentiators plus a condensed 'us vs. everyone else' comparison and a "
     "Book A Call CTA.",
     "Once the visitor believes results are possible, the next question is 'why "
     "you?' We answer it while interest is high - land-only specialists, dedicated "
     "1:1 callers, compliant data - and contrast ourselves against DIY call teams "
     "and generic call centers so the choice feels obvious."),

    ("Real call samples", "Proof you can feel - hear an actual warm lead",
     "Audio players ('Stop imagining a warm lead. Hear one.') with real call "
     "recordings, each captioned with market, seller motivation, and outcome.",
     "This is the page's secret weapon. Reading that we generate 'warm leads' is "
     "abstract; hearing a motivated seller talk price makes the product visceral "
     "and undeniable. It converts a claim into an experience - the single most "
     "persuasive moment for a skeptical buyer - which is why it sits right after we "
     "make our case for why we win."),

    ("The Problem", "Name the villain - sharpen the pain",
     "'Most land lead channels are breaking' - three pain points: building a call "
     "team is a grind, direct mail keeps getting more expensive, inconsistent "
     "leads kill the pipeline.",
     "With desire established, we re-anchor the stakes so the visitor feels the "
     "cost of doing nothing. Naming a shared enemy (broken, expensive lead "
     "channels) positions Land Caller as the escape and increases urgency without "
     "attacking the visitor."),

    ("Who We Are", "The trustworthy guide - empathy + authority",
     "A 'Built by land investors, for land investors' story teaser linking to the "
     "full About page.",
     "Now that the visitor wants the outcome and feels the pain, they need to "
     "trust the guide. We show we are investors ourselves - so our callers speak "
     "the prospect's language - which builds empathy and authority at the exact "
     "moment the visitor is deciding whether we 'get' their world."),

    ("How It Works", "The plan - remove fear of the unknown",
     "Four simple steps: build the target list, dedicated caller dials, warm leads "
     "hit your CRM, we optimize while you close.",
     "People don't book when the process feels complicated or risky. A clear, "
     "four-step plan answers 'what actually happens after I book?' and makes "
     "getting started feel easy and low-effort - shrinking the perceived "
     "commitment right before the offer."),

    ("Pricing teaser", "The offer - transparency builds confidence",
     "Condensed package cards giving an at-a-glance view, linking to the full "
     "pricing page.",
     "By now the visitor is sold on the what and the how, so price is framed as "
     "the natural next question rather than the lead. Showing pricing openly "
     "signals confidence and respect for the buyer's time; teasing (not dumping) "
     "the full matrix keeps the funnel moving toward the booking instead of a "
     "spec-comparison rabbit hole."),

    ("Blog teaser", "Authority & education - depth for researchers",
     "Three latest-post cards linking to the blog.",
     "Some investors need to feel a company is a credible, ongoing authority "
     "before they commit. The blog teaser provides that depth for researchers and "
     "supports SEO, without distracting the ready-to-buy visitor who is already "
     "heading for the CTA below."),

    ("Booking CTA + FAQ", "The ask - convert with objections handled",
     "'Let's dial in your deal flow' - a contact form that swaps in-place to an "
     "embedded Calendly scheduler, with the FAQ accordion beside it.",
     "The climax. Every prior section earned the right to ask. We pair the booking "
     "action with the FAQ so last-second objections are answered inches from the "
     "button - removing the final friction. The inline embed lets the visitor book "
     "without leaving the page, and all 'Book A Call' buttons across the site point "
     "here so every path funnels to this one action."),
]

for i, (name, role, what, why) in enumerate(sections, start=1):
    section_block(pdf, i, name, role, what, why)

# ---------------------------------------------------------------- PRINCIPLES
pdf.add_page()
h2(pdf, "Principles that hold the journey together")
label(pdf, "Desire and friction, alternating")
body(pdf,
     "The page never stacks too much of one thing. It builds desire (hero, "
     "results, testimonials), then removes friction (problem framing, the plan, "
     "the FAQ), then asks. This rhythm keeps momentum without overwhelming or "
     "boring the visitor.")

label(pdf, "Proof, early and in three forms")
body(pdf,
     "Authority is established before it's needed: numbers (results band), peers "
     "(testimonials high on the page), and senses (real call audio). Each form "
     "convinces a different kind of skeptic, and front-loading them disarms the "
     "visitor while resistance is highest.")

label(pdf, "One action, everywhere")
body(pdf,
     "The entire site funnels to a single conversion: booking a call. Every "
     "'Book A Call' button - in the nav, on every page, in each section - points "
     "to the same booking section, so there is never ambiguity about the next "
     "step.")

label(pdf, "Tangible over abstract")
body(pdf,
     "Wherever possible we replace claims with experiences - the CRM screenshot, "
     "the playable call recordings, the concrete four-step plan - because showing "
     "always outperforms telling for a buyer deciding whether to trust us with "
     "their pipeline.")

pdf.ln(4)
pdf.set_draw_color(*HAIR)
pdf.line(MARGIN, pdf.get_y(), PAGE_W - MARGIN, pdf.get_y())
pdf.ln(4)
pdf.set_font("Helvetica", "I", 9.5)
pdf.set_text_color(*MUTED)
pdf.multi_cell(CONTENT_W, 5,
    clean("In short: hook the dream, prove it three ways early, make it "
          "tangible, name the pain, earn trust as the guide, lay out a simple "
          "plan, present the offer, then ask - with objections already handled."))

import os
out = os.path.join(os.path.dirname(__file__), "Visitor-Journey-Analysis.pdf")
pdf.output(out)
print("Wrote", out)
