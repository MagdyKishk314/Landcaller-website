/**
 * Client-side behaviour for the Land Caller replica.
 * Mirrors the original SPA interactions: scroll-aware header, mobile menu,
 * package feature accordions, FAQ accordion (single/collapsible), and the
 * contact form (toast + reset, no persistence - matching the source).
 */

const MENU_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>';
const X_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';

const SCROLLED_CLASSES = ["bg-[#0A0A0A]/98", "backdrop-blur-md", "border-b", "border-white/5"];

function initHeaderScroll(): void {
  const header = document.getElementById("site-header");
  if (!header) return;
  const apply = () => {
    if (window.scrollY > 20) {
      header.classList.remove("bg-transparent");
      header.classList.add(...SCROLLED_CLASSES);
    } else {
      header.classList.add("bg-transparent");
      header.classList.remove(...SCROLLED_CLASSES);
    }
  };
  apply();
  window.addEventListener("scroll", apply, { passive: true });
}

function initMobileMenu(): void {
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  const setOpen = (open: boolean) => {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.innerHTML = open ? X_ICON : MENU_ICON;
  };

  toggle.addEventListener("click", () => setOpen(menu.hidden));
  menu.querySelectorAll<HTMLAnchorElement>("[data-mobile-link]").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
}

function initPackageAccordions(): void {
  document.querySelectorAll<HTMLElement>("[data-accordion-item]").forEach((item) => {
    const trigger = item.querySelector<HTMLButtonElement>("[data-accordion-trigger]");
    const panel = item.querySelector<HTMLElement>("[data-accordion-panel]");
    const chevron = trigger?.querySelector<SVGElement>("svg.lucide-chevron-down");
    if (!trigger || !panel) return;
    trigger.addEventListener("click", () => {
      const open = panel.hidden;
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      if (chevron) {
        chevron.classList.toggle("rotate-180", open);
        chevron.classList.toggle("text-[#E8523A]", open);
      }
    });
  });
}

function initFaqAccordion(): void {
  const root = document.querySelector<HTMLElement>("[data-faq]");
  if (!root) return;
  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-faq-item]"));

  const setState = (el: HTMLElement, state: "open" | "closed") => {
    el.dataset.state = state;
    el.querySelectorAll<HTMLElement>("[data-state]").forEach((c) => (c.dataset.state = state));
    const h3 = el.querySelector<HTMLElement>("h3");
    if (h3) h3.dataset.state = state;
  };

  const close = (item: HTMLElement) => {
    const panel = item.querySelector<HTMLElement>("[data-faq-panel]");
    const trigger = item.querySelector<HTMLButtonElement>("[data-faq-trigger]");
    if (!panel || !trigger || panel.hidden) return;
    panel.style.setProperty("--radix-collapsible-content-height", `${panel.scrollHeight}px`);
    setState(item, "closed");
    trigger.setAttribute("aria-expanded", "false");
    panel.addEventListener(
      "animationend",
      () => {
        if (panel.dataset.state === "closed") panel.hidden = true;
      },
      { once: true }
    );
  };

  const open = (item: HTMLElement) => {
    const panel = item.querySelector<HTMLElement>("[data-faq-panel]");
    const trigger = item.querySelector<HTMLButtonElement>("[data-faq-trigger]");
    if (!panel || !trigger) return;
    panel.hidden = false;
    panel.style.setProperty("--radix-collapsible-content-height", `${panel.scrollHeight}px`);
    setState(item, "open");
    trigger.setAttribute("aria-expanded", "true");
  };

  items.forEach((item) => {
    const trigger = item.querySelector<HTMLButtonElement>("[data-faq-trigger]");
    const panel = item.querySelector<HTMLElement>("[data-faq-panel]");
    if (!trigger || !panel) return;
    trigger.addEventListener("click", () => {
      const isOpen = !panel.hidden;
      // type="single" collapsible: close everything, then open the clicked one if it was closed.
      items.forEach(close);
      if (!isOpen) open(item);
    });
  });
}

/* --- Toast (Sonner-like) --------------------------------------------------- */

function ensureToastStyles(): void {
  if (document.getElementById("lc-toast-style")) return;
  const style = document.createElement("style");
  style.id = "lc-toast-style";
  style.textContent = `
.lc-toaster{position:fixed;bottom:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
.lc-toast{pointer-events:auto;display:flex;align-items:center;gap:10px;min-width:260px;max-width:380px;padding:14px 16px;border-radius:10px;background:#1c1c1e;color:#fff;box-shadow:0 8px 30px rgba(0,0,0,.4);font-size:13px;line-height:1.3;border:1px solid rgba(255,255,255,.12);opacity:0;transform:translateY(12px);transition:opacity .25s ease,transform .25s ease}
.lc-toast.is-visible{opacity:1;transform:translateY(0)}
.lc-toast__icon{display:inline-flex;width:18px;height:18px;color:#fff;align-items:center;justify-content:center;flex:0 0 auto}
@media (max-width:480px){.lc-toaster{left:16px;right:16px}.lc-toast{max-width:none;width:100%}}`;
  document.head.appendChild(style);
}

function showToast(message: string): void {
  ensureToastStyles();
  const region = document.getElementById("toast-region");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = "lc-toast";
  toast.setAttribute("role", "status");
  toast.innerHTML =
    '<span class="lc-toast__icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg></span><span></span>';
  (toast.querySelector("span:last-child") as HTMLElement).textContent = message;
  region.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 4000);
}

function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Message sent! We'll be in touch shortly.");
    form.reset();
  });
}

function handleNoJsFallback(): void {
  const params = new URLSearchParams(window.location.search);
  if (params.get("sent") === "1") {
    showToast("Message sent! We'll be in touch shortly.");
    history.replaceState(null, "", window.location.pathname + window.location.hash);
  }
}

function init(): void {
  initHeaderScroll();
  initMobileMenu();
  initPackageAccordions();
  initFaqAccordion();
  initContactForm();
  handleNoJsFallback();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
