/**
 * Client-side behaviour for the Land Caller replica.
 * Mirrors the original SPA interactions: mobile menu,
 * package feature accordions, FAQ accordion (single/collapsible), and the
 * contact form (toast + reset, no persistence - matching the source).
 */

const MENU_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>';
const X_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';

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
      // type="multiple" collapsible: toggle only the clicked item, leaving others open.
      if (panel.hidden) open(item);
      else close(item);
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

/* --- Booking flow: contact form -> inline Calendly scheduler --------------- */

function initBookingFlow(): void {
  const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
  const formWrap = document.querySelector<HTMLElement>("[data-booking-form]");
  const calWrap = document.querySelector<HTMLElement>("[data-booking-calendly]");
  const container = document.querySelector<HTMLElement>("[data-calendly]");
  if (!form || !container) return;

  const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
  const CSS_HREF = "https://assets.calendly.com/assets/external/widget.css";
  let loaded = false;

  // Loads Calendly's widget once and renders the inline scheduler, prefilled
  // with whatever the visitor just entered in the form.
  const loadCalendly = (prefill: { name?: string; email?: string }) => {
    const url = container.dataset.url;
    if (!url || loaded) return;
    loaded = true;
    const render = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Calendly = (window as any).Calendly;
      if (!Calendly) return;
      container.querySelector("[data-calendly-loading]")?.remove();
      Calendly.initInlineWidget({ url, parentElement: container, prefill });
    };
    if (!document.querySelector(`link[href="${CSS_HREF}"]`)) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = CSS_HREF;
      document.head.appendChild(css);
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).Calendly) render();
      else existing.addEventListener("load", render, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", render, { once: true });
    document.head.appendChild(script);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();

    // Fire-and-forget so the lead reaches the server if/when it persists.
    const params = new URLSearchParams();
    data.forEach((v, k) => params.append(k, String(v)));
    void fetch("/contact", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }).catch(() => {});

    // Swap the form for the scheduler, prefilled with what they gave us.
    if (formWrap) formWrap.hidden = true;
    if (calWrap) calWrap.hidden = false;
    loadCalendly({ name: name || undefined, email: email || undefined });
    showToast("Thanks! Pick a time that works for you.");
    calWrap?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

/* --- Audio players (custom controls over native <audio>) ------------------- */

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function initAudioPlayers(): void {
  const players = Array.from(document.querySelectorAll<HTMLElement>("[data-audio-player]"));
  if (!players.length) return;

  // Track every audio element so starting one pauses the rest.
  const allAudio: HTMLAudioElement[] = [];

  players.forEach((player) => {
    const audio = player.querySelector<HTMLAudioElement>("[data-audio-el]");
    const toggle = player.querySelector<HTMLButtonElement>("[data-audio-toggle]");
    const playIcon = player.querySelector<HTMLElement>('[data-audio-icon="play"]');
    const pauseIcon = player.querySelector<HTMLElement>('[data-audio-icon="pause"]');
    const track = player.querySelector<HTMLElement>("[data-audio-track]");
    const fill = player.querySelector<HTMLElement>("[data-audio-fill]");
    const current = player.querySelector<HTMLElement>("[data-audio-current]");
    const duration = player.querySelector<HTMLElement>("[data-audio-duration]");
    if (!audio || !toggle || !track || !fill) return;
    allAudio.push(audio);

    const setPlayingUI = (playing: boolean) => {
      toggle.setAttribute("aria-pressed", String(playing));
      playIcon?.classList.toggle("hidden", playing);
      playIcon?.classList.toggle("flex", !playing);
      pauseIcon?.classList.toggle("hidden", !playing);
      pauseIcon?.classList.toggle("flex", playing);
    };

    toggle.addEventListener("click", () => {
      if (audio.paused) {
        allAudio.forEach((a) => a !== audio && a.pause());
        // play() may reject (e.g. placeholder file); UI is driven by events.
        void audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", () => setPlayingUI(true));
    audio.addEventListener("pause", () => setPlayingUI(false));
    audio.addEventListener("ended", () => {
      setPlayingUI(false);
      fill.style.width = "0%";
      track.setAttribute("aria-valuenow", "0");
      if (current) current.textContent = "0:00";
    });

    audio.addEventListener("loadedmetadata", () => {
      if (duration && Number.isFinite(audio.duration)) {
        duration.textContent = formatTime(audio.duration);
      }
    });

    audio.addEventListener("timeupdate", () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      fill.style.width = `${pct}%`;
      track.setAttribute("aria-valuenow", String(Math.round(pct)));
      if (current) current.textContent = formatTime(audio.currentTime);
    });

    const seekToClientX = (clientX: number) => {
      if (!Number.isFinite(audio.duration) || audio.duration === 0) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      audio.currentTime = ratio * audio.duration;
    };
    track.addEventListener("click", (e) => seekToClientX(e.clientX));
    track.addEventListener("keydown", (e) => {
      if (!Number.isFinite(audio.duration)) return;
      if (e.key === "ArrowRight") {
        audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
        e.preventDefault();
      } else if (e.key === " " || e.key === "Enter") {
        toggle.click();
        e.preventDefault();
      }
    });
  });
}

/* --- Carousels (testimonials, blog teaser, …) ------------------------------ */

function initSliders(): void {
  document.querySelectorAll<HTMLElement>("[data-slider]").forEach(initSlider);
}

function initSlider(root: HTMLElement): void {
  const viewport = root.querySelector<HTMLElement>(".lc-slider__viewport");
  const track = root.querySelector<HTMLElement>("[data-slider-track]");
  const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-slider-slide]"));
  const prev = root.querySelector<HTMLButtonElement>("[data-slider-prev]");
  const next = root.querySelector<HTMLButtonElement>("[data-slider-next]");
  if (!viewport || !track || slides.length === 0) return;

  // Autoplay is on by default; opt out per-slider with data-slider-autoplay="off".
  const autoplay = root.dataset.sliderAutoplay !== "off";
  const count = slides.length;
  let index = 0;
  let timer = 0;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Step (one card + gap) and how many cards are visible are measured at runtime
  // so the slider adapts to the 1/2/3-per-view breakpoints automatically.
  const metrics = () => {
    const slideW = slides[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = slideW + gap;
    const perView = step > 0 ? Math.max(1, Math.round((viewport.getBoundingClientRect().width + gap) / step)) : 1;
    return { step, maxIndex: Math.max(0, count - perView) };
  };

  // Hide the arrows when everything already fits (nothing to scroll to).
  const updateControls = () => {
    const hide = metrics().maxIndex < 1;
    if (prev) prev.hidden = hide;
    if (next) next.hidden = hide;
  };

  const apply = () => {
    track.style.transform = `translateX(-${index * metrics().step}px)`;
    updateControls();
  };

  const go = (i: number) => {
    const { maxIndex } = metrics();
    index = i < 0 ? maxIndex : i > maxIndex ? 0 : i; // wrap at both ends
    apply();
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = 0;
    }
  };
  const start = () => {
    if (!autoplay || reduce || metrics().maxIndex < 1 || timer) return;
    timer = window.setInterval(() => go(index + 1), 6000);
  };
  const restart = () => {
    stop();
    start();
  };

  prev?.addEventListener("click", () => {
    go(index - 1);
    restart();
  });
  next?.addEventListener("click", () => {
    go(index + 1);
    restart();
  });

  // Pause autoplay on hover / keyboard focus.
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);

  // Touch swipe.
  let startX = 0;
  root.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      stop();
    },
    { passive: true }
  );
  root.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    start();
  });

  // Re-clamp + re-position on resize (per-view changes across breakpoints).
  let raf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const { maxIndex } = metrics();
      if (index > maxIndex) index = maxIndex;
      apply();
    });
  });

  apply();
  start();
}

/* --- "The Plan" timeline (scroll reveal + rail draw) ----------------------- */

function initTimelines(): void {
  const timelines = Array.from(document.querySelectorAll<HTMLElement>("[data-timeline]"));
  if (!timelines.length) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  timelines.forEach((timeline) => {
    const items = Array.from(timeline.querySelectorAll<HTMLElement>("[data-timeline-item]"));
    const rail = timeline.querySelector<HTMLElement>("[data-timeline-rail]");
    const progress = timeline.querySelector<HTMLElement>("[data-timeline-progress]");
    const nodes = items.map((it) => it.querySelector<HTMLElement>("[data-timeline-node]"));
    if (!items.length) return;

    // Reduced motion: leave the copy visible (default), just fill the rail and
    // light the nodes. No `is-animated` class -> no hidden initial state.
    if (reduce) {
      nodes.forEach((n) => n?.classList.add("is-active"));
      if (progress) progress.style.height = "100%";
      return;
    }

    // Opt into the animated state only now that JS is running. The hidden
    // initial state in CSS is scoped to `.is-animated`, so the copy stays
    // visible if this script never loads (progressive enhancement).
    timeline.classList.add("is-animated");

    // Fade/slide each item in as it scrolls into view.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -12% 0px" }
    );
    items.forEach((it) => io.observe(it));

    // Node centres (relative to the timeline top) drive the rail geometry and
    // the scroll-linked progress fill. The node reveal scales about its centre,
    // so these measurements stay stable regardless of reveal state.
    let centers: number[] = [];
    const layout = () => {
      const top = timeline.getBoundingClientRect().top;
      centers = nodes.map((n) => {
        if (!n) return 0;
        const r = n.getBoundingClientRect();
        return r.top - top + r.height / 2;
      });
      if (rail && centers.length) {
        const first = centers[0];
        const last = centers[centers.length - 1];
        rail.style.top = `${first}px`;
        rail.style.height = `${Math.max(0, last - first)}px`;
      }
    };

    const update = () => {
      if (centers.length < 2) return;
      const top = timeline.getBoundingClientRect().top;
      const first = centers[0];
      const span = centers[centers.length - 1] - first;
      if (span <= 0) return;
      const anchor = window.innerHeight * 0.75; // fill's leading edge sits 75% down the viewport
      const ratio = Math.min(Math.max((anchor - (top + first)) / span, 0), 1);
      if (progress) progress.style.height = `${ratio * 100}%`;
      const filled = ratio * span;
      nodes.forEach((n, i) => {
        if (n && filled >= centers[i] - first - 4) n.classList.add("is-active");
      });
    };

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        layout();
        update();
      });
    };

    layout();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Re-measure once fonts/layout settle (node heights can shift on font swap).
    window.setTimeout(() => {
      layout();
      update();
    }, 350);
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
  initMobileMenu();
  initPackageAccordions();
  initFaqAccordion();
  initAudioPlayers();
  initSliders();
  initTimelines();
  initBookingFlow();
  handleNoJsFallback();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
