/**
 * JS template for custom_popup.js.php - plan popups, menu curation, and the
 * Opportunity->Lead rename, injected into the GHL SPA.
 *
 * Faithful port of the legacy emitted JS (element IDs, funnel IDs, banner
 * texts, localStorage keys, and timings verbatim) with ONE deliberate change:
 * the legacy embedded the entire ghl_sub_accounts table (every customer's
 * name/email) into the script for all visitors. The port embeds only the
 * location-id list (needed for the routing gate) and fetches the current
 * location's record from /custom_popup_data.php at runtime.
 */

export interface CustomPopupParams {
  allLocationIds: string[];
  masterLocationIds: string[]; // skipped entirely (master + special)
  dataUrl: string; // e.g. /custom_popup_data.php
}

const FUNNELS = {
  pricing: "5VVIXCjh9MkIqpov3Bhx",
  buyLeads: "8Ha056YIDQlFqCVyNk4z",
  upgradeEnterprise: "QGXzpikDtFd6w63Nm7ST",
  fullCrm: "tKhFzXrvRxeXtFs9Bo5m",
  autoRenew: "kAsdQUILBraAaEjR5n2u",
};

const IDS = {
  upgradeMenu: "334e6ddb-5a2a-439f-9f93-3747351c0c10",
  dashboardMenu: "0971a6dc-90aa-4bc8-8404-91c10e745c25",
  startCampaign: "57b87a8a-3e37-45c1-a9aa-21f52353a601",
  nonEnterprise1: "3a2fe5f1-6451-48e6-a137-00142332e52d",
  nonEnterprise2: "d389581b-a627-4887-83bd-8a873a66ffeb",
};

const ALWAYS_HIDDEN = [
  "#sb_AI\\ Agents", "#sb_labs", "#sb_external-tracking", "#sb_objects", "#sb_whatsapp",
  "#quickActions", "#sb_reporting", "#sb_app-marketplace", "#recent_activities-toggle",
  "#template-power-dialer", "#sb_manage-scoring",
  "#sidebar-v2 > div.relative.flex.flex-col.h-screen.w-56 > div > div.flex.flex-col.w-full.overflow-x-hidden.overflow-y-auto.hl_nav-header-without-footer > nav > div:nth-child(4)",
  "#tb_affiliate-manager", "#tb_payment-orders-new", "#tb_payment-subscriptions",
  "#tb_payment-links", "#tb_payment-transactions-new", "#tb_payments-products",
  "#tb_payments-coupons", "#tb_gift-cards", "#tb_payment-invoices",
  "#contact-details > div > div.relative.p-0.hl_contact-details-left > div > div.h-full.overflow-y-auto > div.bg-gray-100 > div.py-3.px-3.border-t.border-b.bg-white > div:nth-child(2) > div.tag-group.mt-1 > button",
];

export function renderCustomPopupJs(p: CustomPopupParams): string {
  return `(function () {
  const ALL_IDS = ${JSON.stringify(p.allLocationIds)};
  const MASTER_IDS = ${JSON.stringify(p.masterLocationIds)};
  const DATA_URL = ${JSON.stringify(p.dataUrl)};
  const FUNNELS = ${JSON.stringify(FUNNELS)};
  const IDS = ${JSON.stringify(IDS)};
  const ALWAYS_HIDDEN = ${JSON.stringify(ALWAYS_HIDDEN)};

  function getLocationId() {
    const parts = window.location.pathname.split("/");
    const index = parts.indexOf("location");
    return index !== -1 ? parts[index + 1] : null;
  }
  function showTopMenu() {
    document.querySelectorAll(".topmenu-nav, .hl_nav-header").forEach(function (el) { el.style.display = "flex"; });
  }
  function funnelUrl(id, u, extra) {
    return "https://app.gohighlevel.com/v2/preview/" + id + "?notrack=true&location_id=" + encodeURIComponent(u.location_id) +
      "&first_name=" + encodeURIComponent(u.first_name || "") + "&last_name=" + encodeURIComponent(u.last_name || "") +
      "&email=" + encodeURIComponent(u.email || "") + (extra || "");
  }

  let initialized = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 100;
  function waitForLocation() {
    if (initialized) return;
    const id = getLocationId();
    if (id && MASTER_IDS.indexOf(id) !== -1) { showTopMenu(); return; }
    if (!id || ALL_IDS.indexOf(id) === -1) {
      if (id) showTopMenu();
      if (attempts++ < MAX_ATTEMPTS) setTimeout(waitForLocation, 500);
      return;
    }
    initialized = true;
    fetch(DATA_URL + "?loc=" + encodeURIComponent(id))
      .then(function (r) { return r.json(); })
      .then(function (u) { u.location_id = id; initAddon(id, u); })
      .catch(function () { showTopMenu(); });
  }

  function initAddon(locationId, userData) {
    if (MASTER_IDS.indexOf(locationId) !== -1) return;
    const userPackage = userData.package || "";
    const currentPlanStatus = userData.plan_status || "";
    const isWindowExpired = userData.window_expired === true;
    const isAllLeadsDelivered = userData.is_all_leads_delivered === true || userData.is_all_leads_delivered === "true";
    const contractEnding = userData.is_enteprise_contract_ending === true || userData.is_enteprise_contract_ending === "true";
    const planAutoRenewDate = userData.plan_auto_renew_date || "";
    const contractStatus = (userData.contract_status || "").toLowerCase();

    // Body theme + menu renames
    setInterval(function () { document.body.classList.add("location-theme-dark"); }, 500);
    setInterval(function () {
      const opp = document.querySelector("#sb_opportunities > span");
      if (opp && opp.innerText !== "Leads") opp.innerText = "Leads";
      const tab = document.querySelector("#tb_opportunities-tab span");
      if (tab && tab.innerText !== "Leads") tab.innerText = "Leads";
    }, 500);
    const dashInterval = setInterval(function () {
      const el = document.querySelector("#sb_dashboard .nav-title");
      if (el) { el.innerText = currentPlanStatus === "active" ? "KPI Dashboard" : "Onboarding"; clearInterval(dashInterval); }
    }, 500);

    // Upgrade button visibility (only_data only), every 5s
    function handleUpgradeButton() {
      const el = document.getElementById(IDS.upgradeMenu);
      if (el) el.style.display = userPackage.toLowerCase() === "only_data" ? "flex" : "none";
    }
    handleUpgradeButton(); setInterval(handleUpgradeButton, 5000);

    // Contract pending banner
    if (contractStatus === "send") {
      const el = document.createElement("div");
      el.id = "contract-banner";
      el.style.cssText = "position:fixed;top:9px;left:50%;transform:translateX(-50%);width:60%;background:#ff3b3b;color:#fff;z-index:9999;padding:8px 20px;font-size:14px;font-weight:bold;text-align:center;border-radius:10px";
      el.textContent = "⚠️ Contract Pending: After paying the onboarding fee, your contract has been sent to your email. You will receive access to your CRM only after the contract is signed.";
      document.body.appendChild(el);
      const hide = setInterval(function () {
        const d = document.getElementById(IDS.dashboardMenu);
        if (d) { d.style.display = "none"; clearInterval(hide); }
      }, 300);
    }

    // Onboarding tour (ENTERPRISE)
    function openTourPopup() {
      if (userPackage !== "ENTERPRISE") return;
      if (document.getElementById("tour-popup")) { document.getElementById("tour-popup").style.display = "flex"; return; }
      const pop = document.createElement("div");
      pop.id = "tour-popup";
      pop.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:center;justify-content:center";
      pop.innerHTML = '<div style="position:relative;width:90%;height:90%;background:#fff;border-radius:10px;overflow:hidden">' +
        '<span id="close-tour-popup" style="position:absolute;top:8px;right:14px;font-size:26px;cursor:pointer;z-index:2">&times;</span>' +
        '<div id="iframe-loader" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">Loading…</div>' +
        '<iframe id="tour-iframe" src="https://landcallercrm.com/welcome-840470" style="width:100%;height:100%;border:0"></iframe></div>';
      document.body.appendChild(pop);
      pop.querySelector("#tour-iframe").addEventListener("load", function () {
        const l = document.getElementById("iframe-loader"); if (l) l.remove();
      });
      pop.querySelector("#close-tour-popup").onclick = function () { pop.style.display = "none"; };
    }
    if (userPackage === "ENTERPRISE") {
      if (!document.getElementById("tour-btn")) {
        const btn = document.createElement("button");
        btn.id = "tour-btn";
        btn.textContent = "Onboarding Checklist";
        btn.style.cssText = "position:fixed;top:8px;right:59px;background:rgb(239 45 45);color:#fff;border:0;border-radius:6px;padding:6px 12px;z-index:9998;cursor:pointer";
        btn.onclick = openTourPopup;
        document.body.appendChild(btn);
      }
      setTimeout(function () {
        if (!localStorage.getItem("tourShown")) { openTourPopup(); localStorage.setItem("tourShown", "1"); }
      }, 5000);
    }

    // BASIC welcome popup (?welcome=true, once per location)
    function createWelcomePopup() {
      if (document.getElementById("customPopup")) return;
      const pop = document.createElement("div");
      pop.id = "customPopup";
      pop.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center";
      pop.innerHTML = '<div style="max-width:460px;background:radial-gradient(circle at top,#2b0d0d,#120404);color:#fff;border:1px solid #440B0B;border-radius:12px;padding:28px;text-align:center">' +
        '<span id="popupCloseBtn" style="float:right;cursor:pointer;font-size:20px">&times;</span>' +
        "<h4>🎉 Time to build your cold calling list! 🎉 </h4>" +
        "<p>Now that you've purchased your Basic Package, your data credits have been added to your account balance to be used to build your cold calling list.</p>" +
        "<p>Please navigate to the Data Dashboard to begin preparing your list now.</p>" +
        '<button id="popupOkBtn" style="background:#ff3b3b;color:#fff;border:0;border-radius:6px;padding:8px 22px;cursor:pointer">Got it</button></div>';
      document.body.appendChild(pop);
      function close() { pop.remove(); localStorage.setItem("popupShown_" + locationId, "true"); }
      pop.querySelector("#popupOkBtn").onclick = close;
      pop.querySelector("#popupCloseBtn").onclick = close;
    }
    if (userPackage === "BASIC" || userPackage === "Basic") {
      const maybeShow = function () {
        if (new URLSearchParams(window.location.search).get("welcome") === "true" &&
            !localStorage.getItem("popupShown_" + locationId)) {
          createWelcomePopup();
        }
      };
      setTimeout(maybeShow, 500); setInterval(maybeShow, 500);
    }

    // BASIC leads-delivered popup + sidebar links
    function openLeadsPopup() {
      let pop = document.getElementById("buyLeadsPopup");
      if (pop) { pop.style.display = "flex"; return; }
      pop = document.createElement("div");
      pop.id = "buyLeadsPopup";
      pop.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center";
      pop.innerHTML = '<div style="max-width:500px;background:#1b0808;color:#fff;border-radius:12px;padding:28px;text-align:center">' +
        '<span id="leadsPopupCloseBtn" style="float:right;cursor:pointer;font-size:20px">&times;</span>' +
        "<h5>📈 <b> Want to keep the momentum going?</b> 📈</h5>" +
        "<p>Your Basic campaign has been fulfilled. Purchase more leads or consider upgrading to our Enterprise Packages for additional customizations, full-CRM access, and more.</p>" +
        '<a href="' + funnelUrl(FUNNELS.buyLeads, userData) + '" target="_blank" style="display:inline-block;margin:6px;background:#ff3b3b;color:#fff;border-radius:6px;padding:8px 16px;text-decoration:none">Buy More Leads</a>' +
        '<a href="' + funnelUrl(FUNNELS.upgradeEnterprise, userData) + '" target="_blank" style="display:inline-block;margin:6px;background:#ff7e5f;color:#fff;border-radius:6px;padding:8px 16px;text-decoration:none">Upgrade to Enterprise</a>' +
        '<div><button id="leadsPopupCloseBtn2" style="margin-top:10px;background:transparent;color:#bbb;border:1px solid #555;border-radius:6px;padding:6px 14px;cursor:pointer">Not Ready to Buy Yet</button></div></div>';
      document.body.appendChild(pop);
      pop.querySelector("#leadsPopupCloseBtn").onclick = function () { pop.style.display = "none"; };
      pop.querySelector("#leadsPopupCloseBtn2").onclick = function () { pop.style.display = "none"; };
    }
    function addBasicSidebarLinks() {
      const anchor = document.getElementById(IDS.dashboardMenu);
      if (!anchor || !anchor.parentNode) { setTimeout(addBasicSidebarLinks, 500); return; }
      function mkLink(id, text, onclick, href) {
        if (document.getElementById(id)) return;
        const a = document.createElement("a");
        a.id = id; a.textContent = text;
        a.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px 14px;color:inherit;cursor:pointer;text-decoration:none";
        if (href) { a.href = href; a.target = "_blank"; }
        if (onclick) a.onclick = onclick;
        anchor.parentNode.insertBefore(a, anchor.nextSibling);
      }
      mkLink("upgrade-enterprise", "Upgrade", null,
        "https://landcallercrm.com/upgrade-to-plan?location_id=" + encodeURIComponent(locationId) +
        "&first_name=" + encodeURIComponent(userData.first_name || "") +
        "&last_name=" + encodeURIComponent(userData.last_name || "") +
        "&email=" + encodeURIComponent(userData.email || ""));
      if (isAllLeadsDelivered) {
        mkLink("upgrade-fullcrm", "Get Full CRM", function () { window.open(funnelUrl(FUNNELS.fullCrm, userData), "_blank"); });
        mkLink("buy-more-leads-link", "Buy More Leads", openLeadsPopup);
      }
    }
    if (userPackage === "BASIC" || userPackage === "Basic") {
      setTimeout(addBasicSidebarLinks, 500); setTimeout(addBasicSidebarLinks, 2000);
      if (isAllLeadsDelivered) setTimeout(openLeadsPopup, 2000);
    }

    // Simple dismissible banner helper
    function banner(id, width, bg, html) {
      if (document.getElementById(id)) return;
      const el = document.createElement("div");
      el.id = id;
      el.style.cssText = "position:fixed;top:9px;left:50%;transform:translateX(-50%);width:" + width + ";background:" + bg + ";color:#fff;z-index:9999;padding:8px 20px;font-size:14px;font-weight:bold;text-align:center;border-radius:10px";
      el.innerHTML = html + ' <span data-close style="cursor:pointer;margin-left:12px">&times;</span>';
      document.body.appendChild(el);
      el.querySelector("[data-close]").onclick = function () { el.remove(); };
    }

    if (userPackage.toLowerCase() === "only_crm") {
      setTimeout(function () {
        banner("crm-only-banner", "78%", "#ff3b3b",
          '⚠️ Your current package includes CRM + DATA. To start a cold-calling campaign and utilize your CRM, please upgrade your package. <a id="crmOnlyBannerCloseBtn" href="' +
          funnelUrl(FUNNELS.pricing, userData, "&isupgrade=true") + '" target="_blank" style="color:#fff;text-decoration:underline">Upgrade Now</a>');
      }, 2000);
    }

    if (userPackage.toLowerCase() === "only_data") {
      setTimeout(function () {
        const wait = setInterval(function () {
          const d = document.getElementById(IDS.dashboardMenu);
          if (d) { clearInterval(wait); d.click(); }
        }, 300);
        banner("only-data-banner", "65%", "linear-gradient(90deg,#ff3b3b 0%,#ff7e5f 100%)",
          "🚀 Purchase a <b>Basic</b> or <b>Enterprise</b> Package to get more consistent deal flow and keep your pipeline full. " +
          'Use the Land Caller CRM which is included in the cost of running cold calling campaigns with us. No extra charge! <a href="' +
          funnelUrl(FUNNELS.pricing, userData) + '" target="_blank" style="color:#fff;text-decoration:underline">Upgrade Now</a>');
        setInterval(function () {
          const sc = document.getElementById(IDS.startCampaign);
          if (sc) sc.hidden = true;
        }, 500);
      }, 5000);
    }

    if (contractEnding) {
      setTimeout(function () {
        banner("enterprise-contract-auto-renew-banner", "60%", "#ff3b3b",
          "⚠️ Your contract will auto-renew on " + planAutoRenewDate + '. If you would like to make changes, please <a id="close-banner-btn" href="' +
          funnelUrl(FUNNELS.autoRenew, userData) + '" target="_blank" style="color:#fff;text-decoration:underline">Click HERE</a>');
      }, 5000);
    }

    // Menu curation + pricing takeover
    function hideExtraFeatures() {
      ALWAYS_HIDDEN.forEach(function (sel) {
        try { const el = document.querySelector(sel); if (el) el.remove(); } catch (e) { /* bad selector guard */ }
      });
      const sc = document.getElementById(IDS.startCampaign);
      if (sc) sc.style.display = (userPackage.toLowerCase() === "only_data" && currentPlanStatus === "active") ? "flex" : "none";
      showTopMenu();
      if (userPackage !== "ENTERPRISE") {
        [IDS.nonEnterprise1, IDS.nonEnterprise2].forEach(function (id) {
          const el = document.getElementById(id); if (el) el.remove();
        });
      }
      if (userPackage === "BASIC" || userPackage === "Basic") {
        ["location-dashboard_btn--edit-dashboard", "sb_conversations"].forEach(function (id) {
          const el = document.getElementById(id); if (el) el.remove();
        });
      }
      const dash = document.getElementById("location-dashboard");
      if (dash && !(currentPlanStatus === "active" && !isWindowExpired) && !document.getElementById("ghl-pricing-page-cus")) {
        localStorage.setItem("currentLocationId", locationId);
        dash.innerHTML = "";
        const iframe = document.createElement("iframe");
        iframe.id = "ghl-pricing-page-cus";
        iframe.src = funnelUrl(FUNNELS.pricing, userData);
        iframe.style.cssText = "width:100%;height:100vh;border:0";
        dash.appendChild(iframe);
      }
    }
    setTimeout(hideExtraFeatures, 500); setInterval(hideExtraFeatures, 500);
    window.addEventListener("load", function () { setTimeout(hideExtraFeatures, 500); });

    // Restore-contact back button
    setInterval(function () {
      const p = document.querySelector("#contacts-restore-container-div p");
      if (p && !document.getElementById("restore-back-btn")) {
        const btn = document.createElement("button");
        btn.id = "restore-back-btn"; btn.textContent = "←";
        btn.style.cssText = "margin-right:8px;cursor:pointer";
        btn.onclick = function () { window.history.back(); };
        p.prepend(btn);
      }
    }, 500);

    // Pricing iframe -> upgrade redirect
    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "UPGRADE_BUTTON_CLICKED") {
        window.location.href = funnelUrl(FUNNELS.pricing, userData);
      }
    });
  }

  waitForLocation();

  // --- Global rename: Opportunity -> Lead (runs for every visitor) ---
  function renameAllTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue || node.nodeValue.indexOf("pportunit") === -1 && node.nodeValue.indexOf("PPORTUNIT") === -1) continue;
      node.nodeValue = node.nodeValue
        .replace(/Opportunity Value/g, "Lead Value")
        .replace(/OPPORTUNITIES/g, "LEADS").replace(/OPPORTUNITY/g, "LEAD")
        .replace(/Opportunities/g, "Leads").replace(/Opportunity/g, "Lead")
        .replace(/opportunities/g, "leads").replace(/opportunity/g, "lead");
    }
    document.querySelectorAll("input[placeholder*='pportunit']").forEach(function (i) {
      i.placeholder = i.placeholder.replace(/Opportunities/g, "Leads").replace(/Opportunity/g, "Lead");
    });
  }
  setInterval(function () {
    const opp = document.querySelector("#sb_opportunities > span");
    if (opp && opp.innerText !== "Leads") opp.innerText = "Leads";
  }, 500);
  new MutationObserver(function () { renameAllTextNodes(); }).observe(document.body, { childList: true, subtree: true, characterData: true });
  renameAllTextNodes();
  console.log('✅ Renaming active: Sidebar menu → Leads, and all "Opportunity" text → Lead');
})();
`;
}
