/**
 * JS template for accesscheck.php - the in-CRM gatekeeper script.
 * Verdicts are computed server-side (routes/accesscheck.ts) and interpolated
 * as constants; the DOM machinery below is a faithful port of the legacy
 * emitted JS (element IDs, selector lists, banner texts, and timings kept
 * verbatim; dead legacy code - trial banner, commented hide list - dropped).
 */

export interface AccesscheckVerdicts {
  isRestricted: boolean;
  showDataDashboard: boolean;
  dataOnlyUpgrade: boolean;
  daysLeft: number | null;
  locId: string;
  upcomingCharge: { due_date: string; amount: string | number } | null;
  adminBlock: { campaign_status: string; pause_weeks: number | null } | null;
}

// Buttons hidden outright during an admin pause (pause_weeks === null).
const PAUSE_HIDE_IDS = [
  "location-dashboard_btn--edit-dashboard",
  "add-record-btn",
  "add-object-record-button-Contact",
  "primary-blue",
  "page-email-builder-template__btn-actions",
  "new-conversation-btn-collapsed",
  "location_dashboard-btn-add_dashboard",
];

// Selectors disabled (not hidden) during an admin pause.
const PAUSE_DISABLE_SELECTORS = [
  "#composer-textarea", "#clear-search-button", "#add-note-button",
  "#add-opportunity-pane-button", "#CreateUpdateOpportunity", "#DeleteOpportunity",
  "#hr-dropdown-option-delete", "#task-container-opportunity button",
  "#notes-empty-zero-state-btn-positive-action", "#conv-send-button-simple",
  "#mail-header-reply-button", "#add-tag-button", "#tags-dropdown-trigger",
  "#followers-dropdown-menu", "#owner-dropdown-menu", "#add-opportunity-button",
  "#delete-contact-trigger", "#dropdown_contacts",
  'button[aria-label="Mark as done"]', 'button[aria-label="Mark as pending"]',
  'button[aria-label="Delete"]', '#task div[tabulator-field="actions"]',
  "#add-object-record-button-Task", "#m_apply", "#add-object-record-button-Company",
  ".list-individual-contact-options-icon", "#contacts-more-action-options",
  "#hr-dropdown-option-create_opportunity", "#hr-dropdown-option-add_opportunity",
  "#item-menu-dropdown", "#conv-send-options-dropdown-arrow", "#archive-conversation",
  "#star-toggle", "#read-toggle", '[id^="hr-button-v-"]', '[id^="tasks-form-save-btn"]',
  '[id^="conv-mail-header-forward-email-button-"]',
  '[id^="conv-mail-header-forward-thread-button-"]',
];

const UPGRADE_MENU_ID = "334e6ddb-5a2a-439f-9f93-3747351c0c10";
const DASHBOARD_MENU_ID = "0971a6dc-90aa-4bc8-8404-91c10e745c25";

export function renderAccesscheckJs(v: AccesscheckVerdicts): string {
  return `(function () {
  const isRestricted = ${JSON.stringify(v.isRestricted)};
  const showDataDashboard = ${JSON.stringify(v.showDataDashboard)};
  const data_only_upgrade = ${JSON.stringify(v.dataOnlyUpgrade)};
  const daysLeft = ${JSON.stringify(v.daysLeft)};
  const locId = ${JSON.stringify(v.locId)};
  const upcomingCharge = ${JSON.stringify(v.upcomingCharge)};
  const adminBlockAcess = ${JSON.stringify(v.adminBlock)};

  // --- Signout link: rename + toast + redirect to my.landcaller.com ---
  setInterval(function () {
    document.querySelectorAll("a").forEach(function (a) {
      const t = a.textContent.trim();
      if ((t === "Signout" || t === "Sign Out") && !a.dataset.listenerAdded) {
        a.textContent = "Sign out";
        a.dataset.listenerAdded = "1";
        a.addEventListener("click", function () {
          setTimeout(function () {
            const toast = document.createElement("div");
            toast.textContent = "You have been successfully signed out";
            toast.style.cssText = "position:fixed;top:20px;right:20px;background:#22c55e;color:#fff;padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-size:14px;z-index:9999;opacity:0;transition:opacity .3s";
            document.body.appendChild(toast);
            requestAnimationFrame(function () { toast.style.opacity = "1"; });
            setTimeout(function () { window.location.href = "https://my.landcaller.com/"; }, 1500);
          }, 300);
        });
      }
    });
  }, 200);

  console.log("Restricted:", isRestricted, "Days Left:", daysLeft);

  // --- Pre-auto-charge banner ---
  function showPreAutoChargeBanner() {
    if (!upcomingCharge || document.getElementById("pre-auto-charge-banner")) return;
    const formattedDate = new Date(upcomingCharge.due_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const el = document.createElement("div");
    el.id = "pre-auto-charge-banner";
    el.style.cssText = "position:fixed;top:9px;left:50%;transform:translateX(-50%);width:60%;background:red;color:#fff;z-index:9999;padding:8px 20px;font-size:14px;font-weight:bold;text-align:center;border-radius:10px;box-shadow:0 4px 15px rgba(0,0,0,0.3)";
    el.innerHTML = '💳 Reminder: Your Landcaller subscription will be automatically charged <strong>$' + upcomingCharge.amount + '</strong> on <strong>' + formattedDate + '</strong>. Please ensure your payment method has sufficient funds. <span id="close-pre-charge-banner" style="cursor:pointer;margin-left:12px">&times;</span>';
    document.body.appendChild(el);
    document.getElementById("close-pre-charge-banner").onclick = function () { el.remove(); };
  }
  setTimeout(showPreAutoChargeBanner, 3000);

  // --- Admin pause machinery ---
  const PAUSE_HIDE_IDS = ${JSON.stringify(PAUSE_HIDE_IDS)};
  const PAUSE_DISABLE = ${JSON.stringify(PAUSE_DISABLE_SELECTORS)};
  function hideButtons() {
    PAUSE_HIDE_IDS.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.style.setProperty("display", "none", "important");
    });
  }
  function disableElements() {
    PAUSE_DISABLE.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        const txt = (el.innerText || "").toLowerCase();
        const risky = /save|add|delete|update|create|send|task/.test(txt);
        if (sel.indexOf("hr-button-v-") !== -1 && !risky) return;
        if (el.dataset.lcDisabled) return;
        el.dataset.lcDisabled = "1";
        el.setAttribute("disabled", "disabled");
        el.style.pointerEvents = "none";
        el.style.cursor = "not-allowed";
        el.style.background = "#ccc";
        el.style.borderColor = "#ccc";
        el.style.color = "#666";
        el.addEventListener("click", function (e) { e.stopPropagation(); e.preventDefault(); }, true);
      });
    });
  }
  function disableOpportunityDragging() {
    document.querySelectorAll(".crm-opportunities-stage-cards").forEach(function (el) {
      el.style.pointerEvents = "none";
      el.querySelectorAll("a,button,input").forEach(function (c) { c.style.pointerEvents = "auto"; });
    });
    document.querySelectorAll(".cardWrapper").forEach(function (card) {
      card.setAttribute("draggable", "false");
      ["mousedown", "mousemove", "mouseup", "dragstart", "touchstart", "touchmove", "pointerdown"].forEach(function (ev) {
        card.addEventListener(ev, function (e) { e.stopPropagation(); }, true);
      });
    });
  }

  // --- Contract pause banner ---
  function showContractPauseBanner() {
    if (!adminBlockAcess || adminBlockAcess.campaign_status !== "paused" || document.getElementById("contract-pause-banner")) return;
    const pauseWeeks = adminBlockAcess.pause_weeks;
    let message, backgroundColor = "#d9534f";
    if (pauseWeeks === null) {
      message = "⚠️ Admin has paused your contract. Your CRM access is temporarily blocked. Please contact support.";
      hideButtons(); setInterval(hideButtons, 500);
      window._contractPauseButtonObserver = new MutationObserver(hideButtons);
      window._contractPauseButtonObserver.observe(document.body, { childList: true, subtree: true });
      disableElements(); setInterval(disableElements, 500);
      new MutationObserver(disableElements).observe(document.body, { childList: true, subtree: true });
      disableOpportunityDragging(); setInterval(disableOpportunityDragging, 1000);
      new MutationObserver(disableOpportunityDragging).observe(document.body, { childList: true, subtree: true });
    } else if (pauseWeeks == 1) {
      message = "Your contract and dialing are paused for 1 week. They will automatically resume afterward.";
    } else if (pauseWeeks == 2) {
      message = "Your contract and dialing are paused for 2 week. They will automatically resume afterward.";
    } else {
      message = "Your contract and dialing are paused for " + pauseWeeks + " weeks.";
    }
    const el = document.createElement("div");
    el.id = "contract-pause-banner";
    el.style.cssText = "position:fixed;top:5px;left:50%;transform:translateX(-50%);width:719px;background:" + backgroundColor + ";color:#fff;z-index:9999;padding:10px 20px;font-size:14px;font-weight:bold;text-align:center;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.3)";
    el.innerHTML = message + ' <span id="close-contract-pause-banner" style="cursor:pointer;margin-left:12px">&times;</span>';
    document.body.appendChild(el);
    document.getElementById("close-contract-pause-banner").onclick = function () { el.remove(); };
  }
  setTimeout(showContractPauseBanner, 3500);

  // --- Cap restriction: hide contact create/import affordances ---
  function disableActions() {
    const importBtn = document.getElementById("import-btn");
    if (importBtn) importBtn.style.setProperty("display", "none", "important");
    document.querySelectorAll("button, a").forEach(function (el) {
      const t = (el.innerText || "").toLowerCase();
      if (t.includes("add contact") || t.includes("create contact") || t.includes("new contact") || t.includes("import")) {
        el.style.setProperty("display", "none", "important");
      }
    });
  }
  if (isRestricted) {
    disableActions();
    new MutationObserver(disableActions).observe(document.body, { childList: true, subtree: true });
  }

  // --- Menu element toggles (upgrade + data dashboard) ---
  function setDisplayById(id, value) {
    const apply = function () {
      const el = document.getElementById(id);
      if (el) el.style.display = value;
    };
    apply();
    new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
  }
  setDisplayById(${JSON.stringify(UPGRADE_MENU_ID)}, data_only_upgrade ? "flex" : "none");
  setDisplayById(${JSON.stringify(DASHBOARD_MENU_ID)}, showDataDashboard ? "flex" : "none");
})();
`;
}
