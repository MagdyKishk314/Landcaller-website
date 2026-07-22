/**
 * GHL permission/scope profiles - extracted VERBATIM from the legacy PHP
 * (activate_basic_user.php, activate_enterprise_user.php,
 * activate_only_crm_user.php, data_only_webhook.php,
 * webhooks/admin_hold_update_permission.php, basic_user_leadcheck.php,
 * HighLevelAPI.php getDefaultPermissions/accessManagement).
 *
 * Key-set fidelity matters: GHL treats an ABSENT permission key as "leave
 * unchanged", so profiles reproduce exactly the keys the legacy code sent
 * (e.g. CAP_BLOCKED omits campaignsReadOnly/workflowsReadOnly on purpose).
 * Two legacy artifacts were deliberately cleaned, see `notes`.
 */

export interface ProfileData {
  role: "admin" | "user";
  permissions: Record<string, boolean>;
  scopes: string[];
}

export interface ProfilesFile {
  profiles: Record<string, ProfileData>;
  scopeAllowList: string[];
  notes: string[];
}

const ENTERPRISE_SCOPES: string[] = [
  "campaigns.readonly", "contacts.write", "contacts/bulkActions.write", "workflows.readonly",
  "triggers.write", "funnels.write", "forms.write", "websites.write", "medias.write",
  "opportunities.write", "opportunities/leadValue.readonly", "opportunities/bulkActions.write",
  "reporting/phone.readonly", "reporting/adwords.readonly", "reporting/facebookAds.readonly",
  "reporting/attributions.readonly", "reporting/agent.readonly", "reporting/reports.write",
  "payments.write", "payments/records.write", "payments/orders.readonly", "payments/orders.export",
  "payments/orders.import", "payments/orders.collectPayment", "payments/subscriptions.readonly",
  "payments/subscriptions.write", "payments/subscriptions.update", "payments/subscriptions.export",
  "payments/subscriptions.pauseResumeCancel", "payments/subscriptions.sharePaymentMethod",
  "payments/transactions.readonly", "payments/transactions.export", "payments/transactions.import",
  "payments/transactions.refund", "payments/transactions.viewReceipts",
  "payments/taxesSettings.readonly", "payments/taxesSettings.updateInclusiveExclusive",
  "payments/taxesSettings.manageRates", "payments/taxesSettings.configureAutomatic",
  "products.readonly", "products.write", "products.delete", "products.duplicate",
  "products.bulkActions", "payments/settings.readonly", "payments/settings.configureReceipt",
  "payments/settings.configureSubscription", "invoices.write", "reputation/review.write",
  "reputation/listing.write", "conversations.write", "contentAI.write", "dashboard/stats.readonly",
  "locations/tags.write", "marketing.write", "eliza.write", "settings.write",
  "socialplanner/post.write", "marketing/affiliate.write", "blogs.write", "membership.write",
  "communities.write", "gokollab.write", "certificates.write", "adPublishing.write",
  "wordpress.write", "users/team-management.write", "users/team-management.readonly",
  "internaltools.billing-common.write", "locations.billing.manage", "locations.details.manage",
];

// ONLY_CRM / ACCESS_GIVE use the enterprise list WITHOUT forms.write (legacy difference).
const CRM_SCOPES: string[] = ENTERPRISE_SCOPES.filter((s) => s !== "forms.write");

const data: ProfilesFile = {
  profiles: {
    // HighLevelAPI::getDefaultPermissions() - applied at user creation. No scopes in source.
    DEFAULT_CREATE: {
      role: "admin",
      permissions: {
        campaignsEnabled: false, campaignsReadOnly: false, workflowsEnabled: false, workflowsReadOnly: false,
        contactsEnabled: true, triggersEnabled: false, opportunitiesEnabled: false, settingsEnabled: false,
        tagsEnabled: false, leadValueEnabled: false, dashboardStatsEnabled: true, bulkRequestsEnabled: false,
        opportunitiesBulkActionsEnabled: false, appointmentsEnabled: false, reviewsEnabled: false,
        onlineListingsEnabled: false, phoneCallEnabled: false, conversationsEnabled: true,
        assignedDataOnly: false, funnelsEnabled: false, websitesEnabled: false, marketingEnabled: false,
        adwordsReportingEnabled: false, facebookAdsReportingEnabled: false, attributionsReportingEnabled: false,
        membershipEnabled: false, botService: false, agentReportingEnabled: false, socialPlanner: false,
        bloggingEnabled: false, invoiceEnabled: false, affiliateManagerEnabled: false, contentAiEnabled: false,
        refundsEnabled: false, recordPaymentEnabled: false, cancelSubscriptionEnabled: false,
        paymentsEnabled: true, communitiesEnabled: false, exportPaymentsEnabled: false,
        certificatesEnabled: false, mediaStorageEnabled: false, reportingEnabled: false,
        adPublishingEnabled: false, adPublishingReadOnly: false, wordpressEnabled: false,
        customMenuLinkReadOnly: false, customMenuLinkWrite: false, gokollabEnabled: false,
        formsEnabled: false, quizzesEnabled: false, textToPayEnabled: false, gmbMessagingEnabled: false,
        htmlBuilderEnabled: false, botServiceEnabled: false, proposalsEnabled: false, qrCodesEnabled: false,
        webChatEnabled: false, facebookMessengerEnabled: false, launchpadEnabled: false,
        gmbCallTrackingEnabled: false, emailBuilderEnabled: false, triggerLinksEnabled: false,
        surveysEnabled: false, smsEmailTemplatesEnabled: false, adManagerEnabled: false,
      },
      scopes: ["dashboard/stats.readonly"],
    },

    // activate_basic_user.php
    BASIC: {
      role: "admin",
      permissions: {
        campaignsEnabled: false, campaignsReadOnly: false, workflowsEnabled: false, workflowsReadOnly: false,
        contactsEnabled: true, triggersEnabled: false, opportunitiesEnabled: true, settingsEnabled: true,
        tagsEnabled: false, leadValueEnabled: false, dashboardStatsEnabled: true, bulkRequestsEnabled: true,
        opportunitiesBulkActionsEnabled: false, appointmentsEnabled: false, reviewsEnabled: false,
        onlineListingsEnabled: false, phoneCallEnabled: false, conversationsEnabled: false,
        assignedDataOnly: false, funnelsEnabled: false, websitesEnabled: false, marketingEnabled: false,
        adwordsReportingEnabled: false, facebookAdsReportingEnabled: true, attributionsReportingEnabled: false,
        membershipEnabled: false, botService: false, agentReportingEnabled: false, socialPlanner: false,
        bloggingEnabled: false, invoiceEnabled: false, affiliateManagerEnabled: false, contentAiEnabled: false,
        refundsEnabled: false, recordPaymentEnabled: false, cancelSubscriptionEnabled: false,
        paymentsEnabled: false, communitiesEnabled: false, exportPaymentsEnabled: false,
        certificatesEnabled: false, mediaStorageEnabled: false, reportingEnabled: false,
        adPublishingEnabled: false, adPublishingReadOnly: false, wordpressEnabled: false,
        customMenuLinkReadOnly: false, customMenuLinkWrite: false, gokollabEnabled: false,
        formsEnabled: false, quizzesEnabled: false, textToPayEnabled: false, gmbMessagingEnabled: false,
        htmlBuilderEnabled: false, botServiceEnabled: false, proposalsEnabled: false, qrCodesEnabled: false,
        webChatEnabled: false, facebookMessengerEnabled: false, launchpadEnabled: false,
        gmbCallTrackingEnabled: false, emailBuilderEnabled: false, triggerLinksEnabled: false,
        surveysEnabled: false, smsEmailTemplatesEnabled: false, adManagerEnabled: false,
      },
      scopes: [
        "contacts.write", "contacts/bulkActions.write", "dashboard/stats.readonly",
        "opportunities/leadValue.readonly", "opportunities.write", "reporting/facebookAds.readonly",
        "settings.write", "users/team-management.write", "users/team-management.readonly",
      ],
    },

    // activate_enterprise_user.php - everything on.
    ENTERPRISE: {
      role: "admin",
      permissions: {
        campaignsEnabled: true, campaignsReadOnly: true, workflowsEnabled: true, workflowsReadOnly: true,
        contactsEnabled: true, triggersEnabled: true, opportunitiesEnabled: true, settingsEnabled: true,
        tagsEnabled: true, leadValueEnabled: true, dashboardStatsEnabled: true, bulkRequestsEnabled: true,
        opportunitiesBulkActionsEnabled: true, appointmentsEnabled: true, reviewsEnabled: true,
        onlineListingsEnabled: true, phoneCallEnabled: true, conversationsEnabled: true,
        funnelsEnabled: true, websitesEnabled: true, marketingEnabled: true, adwordsReportingEnabled: true,
        facebookAdsReportingEnabled: true, attributionsReportingEnabled: true, membershipEnabled: true,
        botService: true, agentReportingEnabled: true, socialPlanner: true, bloggingEnabled: true,
        invoiceEnabled: true, affiliateManagerEnabled: true, contentAiEnabled: true, refundsEnabled: true,
        recordPaymentEnabled: true, cancelSubscriptionEnabled: true, paymentsEnabled: true,
        communitiesEnabled: true, exportPaymentsEnabled: true, certificatesEnabled: true,
        mediaStorageEnabled: true, reportingEnabled: true, adPublishingEnabled: true,
        adPublishingReadOnly: true, wordpressEnabled: true, customMenuLinkReadOnly: true,
        customMenuLinkWrite: true, gokollabEnabled: true, formsEnabled: true, quizzesEnabled: true,
        textToPayEnabled: true, gmbMessagingEnabled: true, htmlBuilderEnabled: true,
        botServiceEnabled: true, proposalsEnabled: true, qrCodesEnabled: true, webChatEnabled: true,
        facebookMessengerEnabled: true, launchpadEnabled: true, gmbCallTrackingEnabled: true,
        emailBuilderEnabled: true, triggerLinksEnabled: true, surveysEnabled: true,
        smsEmailTemplatesEnabled: true, adManagerEnabled: true,
        userManagementViewEnabled: true, userManagementManageEnabled: true,
      },
      scopes: ENTERPRISE_SCOPES,
    },

    // activate_only_crm_user.php - enterprise permissions minus user-management keys.
    ONLY_CRM: {
      role: "admin",
      permissions: {
        campaignsEnabled: true, campaignsReadOnly: true, workflowsEnabled: true, workflowsReadOnly: true,
        contactsEnabled: true, triggersEnabled: true, opportunitiesEnabled: true, settingsEnabled: true,
        tagsEnabled: true, leadValueEnabled: true, dashboardStatsEnabled: true, bulkRequestsEnabled: true,
        opportunitiesBulkActionsEnabled: true, appointmentsEnabled: true, reviewsEnabled: true,
        onlineListingsEnabled: true, phoneCallEnabled: true, conversationsEnabled: true,
        funnelsEnabled: true, websitesEnabled: true, marketingEnabled: true, adwordsReportingEnabled: true,
        facebookAdsReportingEnabled: true, attributionsReportingEnabled: true, membershipEnabled: true,
        botService: true, agentReportingEnabled: true, socialPlanner: true, bloggingEnabled: true,
        invoiceEnabled: true, affiliateManagerEnabled: true, contentAiEnabled: true, refundsEnabled: true,
        recordPaymentEnabled: true, cancelSubscriptionEnabled: true, paymentsEnabled: true,
        communitiesEnabled: true, exportPaymentsEnabled: true, certificatesEnabled: true,
        mediaStorageEnabled: true, reportingEnabled: true, adPublishingEnabled: true,
        adPublishingReadOnly: true, wordpressEnabled: true, customMenuLinkReadOnly: true,
        customMenuLinkWrite: true, gokollabEnabled: true, formsEnabled: true, quizzesEnabled: true,
        textToPayEnabled: true, gmbMessagingEnabled: true, htmlBuilderEnabled: true,
        botServiceEnabled: true, proposalsEnabled: true, qrCodesEnabled: true, webChatEnabled: true,
        facebookMessengerEnabled: true, launchpadEnabled: true, gmbCallTrackingEnabled: true,
        emailBuilderEnabled: true, triggerLinksEnabled: true, surveysEnabled: true,
        smsEmailTemplatesEnabled: true, adManagerEnabled: true,
      },
      scopes: CRM_SCOPES,
    },

    // data_only_webhook.php - locked down except assigned-data + menu + settings.
    ONLY_DATA: {
      role: "admin",
      permissions: {
        campaignsEnabled: false, campaignsReadOnly: false, workflowsEnabled: false, workflowsReadOnly: false,
        contactsEnabled: false, triggersEnabled: false, opportunitiesEnabled: false, settingsEnabled: true,
        tagsEnabled: false, leadValueEnabled: false, dashboardStatsEnabled: false, bulkRequestsEnabled: false,
        opportunitiesBulkActionsEnabled: false, appointmentsEnabled: false, reviewsEnabled: false,
        onlineListingsEnabled: false, phoneCallEnabled: false, conversationsEnabled: false,
        assignedDataOnly: true, funnelsEnabled: false, websitesEnabled: false, marketingEnabled: false,
        adwordsReportingEnabled: false, facebookAdsReportingEnabled: false, attributionsReportingEnabled: false,
        membershipEnabled: false, botService: false, agentReportingEnabled: false, socialPlanner: false,
        bloggingEnabled: false, invoiceEnabled: false, affiliateManagerEnabled: false, contentAiEnabled: false,
        refundsEnabled: false, recordPaymentEnabled: false, cancelSubscriptionEnabled: false,
        paymentsEnabled: false, communitiesEnabled: false, exportPaymentsEnabled: false,
        certificatesEnabled: false, mediaStorageEnabled: false, reportingEnabled: false,
        adPublishingEnabled: false, adPublishingReadOnly: false, wordpressEnabled: false,
        customMenuLinkReadOnly: true, customMenuLinkWrite: false, gokollabEnabled: false,
        formsEnabled: false, quizzesEnabled: false, textToPayEnabled: false, gmbMessagingEnabled: false,
        htmlBuilderEnabled: false, botServiceEnabled: false, proposalsEnabled: false, qrCodesEnabled: false,
        webChatEnabled: false, facebookMessengerEnabled: false, launchpadEnabled: false,
        gmbCallTrackingEnabled: false, emailBuilderEnabled: false, triggerLinksEnabled: false,
        surveysEnabled: false, smsEmailTemplatesEnabled: false, adManagerEnabled: false,
      },
      scopes: [
        "settings.write", "locations.details.manage", "locations.billing.manage",
        "internaltools.billing-common.write", "users/team-management.write", "users/team-management.readonly",
      ],
    },

    // webhooks/admin_hold_update_permission.php - final effective sets after overrides + array_diff.
    ADMIN_HOLD: {
      role: "admin",
      permissions: {
        campaignsEnabled: false, campaignsReadOnly: false, workflowsEnabled: false, workflowsReadOnly: false,
        contactsEnabled: true, triggersEnabled: false, opportunitiesEnabled: true, settingsEnabled: true,
        tagsEnabled: true, leadValueEnabled: true, dashboardStatsEnabled: true, bulkRequestsEnabled: true,
        opportunitiesBulkActionsEnabled: true, appointmentsEnabled: false, reviewsEnabled: false,
        onlineListingsEnabled: false, phoneCallEnabled: true, conversationsEnabled: true,
        assignedDataOnly: false, funnelsEnabled: false, websitesEnabled: false, marketingEnabled: false,
        adwordsReportingEnabled: true, facebookAdsReportingEnabled: true, attributionsReportingEnabled: true,
        membershipEnabled: false, botService: true, agentReportingEnabled: true, socialPlanner: false,
        bloggingEnabled: false, invoiceEnabled: true, affiliateManagerEnabled: false, contentAiEnabled: true,
        refundsEnabled: true, recordPaymentEnabled: true, cancelSubscriptionEnabled: true,
        paymentsEnabled: true, communitiesEnabled: false, exportPaymentsEnabled: true,
        certificatesEnabled: false, mediaStorageEnabled: false, reportingEnabled: true,
        adPublishingEnabled: false, adPublishingReadOnly: true, wordpressEnabled: false,
        customMenuLinkReadOnly: true, customMenuLinkWrite: true, gokollabEnabled: false,
        formsEnabled: true, quizzesEnabled: true, textToPayEnabled: true, gmbMessagingEnabled: true,
        htmlBuilderEnabled: true, botServiceEnabled: true, proposalsEnabled: true, qrCodesEnabled: true,
        webChatEnabled: true, facebookMessengerEnabled: true, launchpadEnabled: true,
        gmbCallTrackingEnabled: true, emailBuilderEnabled: true, triggerLinksEnabled: true,
        surveysEnabled: true, smsEmailTemplatesEnabled: true, adManagerEnabled: true,
        userManagementViewEnabled: true, userManagementManageEnabled: true,
      },
      scopes: [
        "contacts.write", "contentAI.write", "conversations.readonly", "conversations.write",
        "conversations/message.readonly", "conversations/message.write", "dashboard/stats.readonly",
        "eliza.write", "internaltools.billing-common.readonly", "internaltools.billing-common.write",
        "invoices.readonly", "invoices.write", "invoices/schedule.readonly", "invoices/schedule.write",
        "invoices/template.readonly", "invoices/template.write", "locations.billing.manage",
        "locations.details.manage", "locations/tags.readonly", "locations/tags.write",
        "opportunities.write", "opportunities/leadValue.readonly", "payments.write",
        "payments/orders.collectPayment", "payments/orders.export", "payments/orders.import",
        "payments/orders.readonly", "payments/settings.configureReceipt",
        "payments/settings.configureSubscription", "payments/settings.readonly", "payments/settings.write",
        "payments/subscriptions.export", "payments/subscriptions.pauseResumeCancel",
        "payments/subscriptions.readonly", "payments/subscriptions.sharePaymentMethod",
        "payments/subscriptions.update", "payments/subscriptions.write",
        "payments/taxesSettings.configureAutomatic", "payments/taxesSettings.manageRates",
        "payments/taxesSettings.readonly", "payments/taxesSettings.updateInclusiveExclusive",
        "payments/transactions.export", "payments/transactions.import", "payments/transactions.readonly",
        "payments/transactions.refund", "payments/transactions.viewReceipts", "products.bulkActions",
        "products.delete", "products.duplicate", "products.readonly", "products.write",
        "reporting/adwords.readonly", "reporting/agent.readonly", "reporting/attributions.readonly",
        "reporting/facebookAds.readonly", "reporting/phone.readonly", "reporting/reports.readonly",
        "reporting/reports.write", "settings.write", "users/team-management.readonly",
        "users/team-management.write",
      ],
    },

    // basic_user_leadcheck.php - cap reached: contacts view-only, no create/import.
    // NOTE: campaignsReadOnly/workflowsReadOnly keys are ABSENT in the legacy map (kept absent).
    CAP_BLOCKED: {
      role: "admin",
      permissions: {
        campaignsEnabled: false, workflowsEnabled: false, contactsEnabled: true, triggersEnabled: false,
        opportunitiesEnabled: false, settingsEnabled: true, tagsEnabled: false, leadValueEnabled: false,
        dashboardStatsEnabled: true, bulkRequestsEnabled: false, opportunitiesBulkActionsEnabled: false,
        appointmentsEnabled: false, reviewsEnabled: false, onlineListingsEnabled: false,
        phoneCallEnabled: false, conversationsEnabled: false, assignedDataOnly: false,
        funnelsEnabled: false, websitesEnabled: false, marketingEnabled: false,
        adwordsReportingEnabled: false, facebookAdsReportingEnabled: true, attributionsReportingEnabled: false,
        membershipEnabled: false, botService: false, agentReportingEnabled: false, socialPlanner: false,
        bloggingEnabled: false, invoiceEnabled: false, affiliateManagerEnabled: false, contentAiEnabled: false,
        refundsEnabled: false, recordPaymentEnabled: false, cancelSubscriptionEnabled: false,
        paymentsEnabled: false, communitiesEnabled: false, exportPaymentsEnabled: false,
        certificatesEnabled: false, mediaStorageEnabled: false, reportingEnabled: false,
        adPublishingEnabled: false, adPublishingReadOnly: false, wordpressEnabled: false,
        customMenuLinkReadOnly: false, customMenuLinkWrite: false, gokollabEnabled: false,
        formsEnabled: false, quizzesEnabled: false, textToPayEnabled: false, gmbMessagingEnabled: false,
        htmlBuilderEnabled: false, botServiceEnabled: false, proposalsEnabled: false, qrCodesEnabled: false,
        webChatEnabled: false, facebookMessengerEnabled: false, launchpadEnabled: false,
        gmbCallTrackingEnabled: false, emailBuilderEnabled: false, triggerLinksEnabled: false,
        surveysEnabled: false, smsEmailTemplatesEnabled: false, adManagerEnabled: false,
      },
      scopes: [
        "dashboard/stats.readonly", "reporting/facebookAds.readonly", "settings.write",
        "users/team-management.write", "users/team-management.readonly",
      ],
    },

    // HighLevelAPI::accessManagement('giveaccess') - same sets as ENTERPRISE minus forms.write.
    ACCESS_GIVE: {
      role: "admin",
      permissions: {
        campaignsEnabled: true, campaignsReadOnly: true, workflowsEnabled: true, workflowsReadOnly: true,
        contactsEnabled: true, triggersEnabled: true, opportunitiesEnabled: true, settingsEnabled: true,
        tagsEnabled: true, leadValueEnabled: true, dashboardStatsEnabled: true, bulkRequestsEnabled: true,
        opportunitiesBulkActionsEnabled: true, appointmentsEnabled: true, reviewsEnabled: true,
        onlineListingsEnabled: true, phoneCallEnabled: true, conversationsEnabled: true,
        funnelsEnabled: true, websitesEnabled: true, marketingEnabled: true, adwordsReportingEnabled: true,
        facebookAdsReportingEnabled: true, attributionsReportingEnabled: true, membershipEnabled: true,
        botService: true, agentReportingEnabled: true, socialPlanner: true, bloggingEnabled: true,
        invoiceEnabled: true, affiliateManagerEnabled: true, contentAiEnabled: true, refundsEnabled: true,
        recordPaymentEnabled: true, cancelSubscriptionEnabled: true, paymentsEnabled: true,
        communitiesEnabled: true, exportPaymentsEnabled: true, certificatesEnabled: true,
        mediaStorageEnabled: true, reportingEnabled: true, adPublishingEnabled: true,
        adPublishingReadOnly: true, wordpressEnabled: true, customMenuLinkReadOnly: true,
        customMenuLinkWrite: true, gokollabEnabled: true, formsEnabled: true, quizzesEnabled: true,
        textToPayEnabled: true, gmbMessagingEnabled: true, htmlBuilderEnabled: true,
        botServiceEnabled: true, proposalsEnabled: true, qrCodesEnabled: true, webChatEnabled: true,
        facebookMessengerEnabled: true, launchpadEnabled: true, gmbCallTrackingEnabled: true,
        emailBuilderEnabled: true, triggerLinksEnabled: true, surveysEnabled: true,
        smsEmailTemplatesEnabled: true, adManagerEnabled: true,
        userManagementViewEnabled: true, userManagementManageEnabled: true,
      },
      scopes: CRM_SCOPES,
    },

    // HighLevelAPI::accessManagement(anything else) - view-only lockout, role downgraded.
    ACCESS_BLOCK: {
      role: "user",
      permissions: {
        campaignsEnabled: false, campaignsReadOnly: false, workflowsEnabled: false, workflowsReadOnly: false,
        contactsEnabled: false, triggersEnabled: false, opportunitiesEnabled: false, settingsEnabled: false,
        tagsEnabled: false, leadValueEnabled: false, dashboardStatsEnabled: true, bulkRequestsEnabled: false,
        opportunitiesBulkActionsEnabled: false, appointmentsEnabled: false, reviewsEnabled: false,
        onlineListingsEnabled: false, phoneCallEnabled: false, conversationsEnabled: false,
        funnelsEnabled: false, websitesEnabled: false, marketingEnabled: false,
        adwordsReportingEnabled: false, facebookAdsReportingEnabled: false, attributionsReportingEnabled: false,
        membershipEnabled: false, botService: false, agentReportingEnabled: false, socialPlanner: false,
        bloggingEnabled: false, invoiceEnabled: false, affiliateManagerEnabled: false, contentAiEnabled: false,
        refundsEnabled: false, recordPaymentEnabled: false, cancelSubscriptionEnabled: false,
        paymentsEnabled: false, communitiesEnabled: false, exportPaymentsEnabled: false,
        certificatesEnabled: false, mediaStorageEnabled: false, reportingEnabled: false,
        adPublishingEnabled: false, adPublishingReadOnly: false, wordpressEnabled: false,
        customMenuLinkReadOnly: false, customMenuLinkWrite: false, gokollabEnabled: false,
        formsEnabled: false, quizzesEnabled: false, textToPayEnabled: false, gmbMessagingEnabled: false,
        htmlBuilderEnabled: false, botServiceEnabled: false, proposalsEnabled: false, qrCodesEnabled: false,
        webChatEnabled: false, facebookMessengerEnabled: false, launchpadEnabled: false,
        gmbCallTrackingEnabled: false, emailBuilderEnabled: false, triggerLinksEnabled: false,
        surveysEnabled: false, smsEmailTemplatesEnabled: false, adManagerEnabled: false,
        userManagementViewEnabled: false, userManagementManageEnabled: false,
      },
      scopes: ["dashboard/stats.readonly"],
    },
  },

  // GHL's users-API scope enum (from admin_hold_update_permission.php allow-list).
  scopeAllowList: [
    "adPublishing.readonly", "adPublishing.write", "blogs.write", "campaigns.readonly",
    "certificates.readonly", "certificates.write", "communities.write", "contacts.write",
    "contacts/bulkActions.write", "contentAI.write", "conversations.readonly", "conversations.write",
    "conversations/message.readonly", "conversations/message.write", "dashboard/stats.readonly",
    "eliza.write", "funnels.write", "gokollab.write", "internaltools.billing-common.readonly",
    "internaltools.billing-common.write", "invoices.readonly", "invoices.write",
    "invoices/schedule.readonly", "invoices/schedule.write", "invoices/template.readonly",
    "invoices/template.write", "locations.billing.manage", "locations.details.manage",
    "locations/tags.readonly", "locations/tags.write", "marketing.write", "marketing/affiliate.write",
    "medias.readonly", "medias.write", "membership.write", "opportunities.write",
    "opportunities/bulkActions.write", "opportunities/leadValue.readonly", "payments.write",
    "payments/orders.collectPayment", "payments/orders.export", "payments/orders.import",
    "payments/orders.readonly", "payments/records.write", "payments/settings.configureReceipt",
    "payments/settings.configureSubscription", "payments/settings.readonly", "payments/settings.write",
    "payments/subscriptions.export", "payments/subscriptions.pauseResumeCancel",
    "payments/subscriptions.readonly", "payments/subscriptions.sharePaymentMethod",
    "payments/subscriptions.update", "payments/subscriptions.write",
    "payments/taxesSettings.configureAutomatic", "payments/taxesSettings.manageRates",
    "payments/taxesSettings.readonly", "payments/taxesSettings.updateInclusiveExclusive",
    "payments/transactions.export", "payments/transactions.import", "payments/transactions.readonly",
    "payments/transactions.refund", "payments/transactions.viewReceipts", "products.bulkActions",
    "products.delete", "products.duplicate", "products.readonly", "products.write",
    "reporting/adwords.readonly", "reporting/agent.readonly", "reporting/attributions.readonly",
    "reporting/facebookAds.readonly", "reporting/phone.readonly", "reporting/reports.readonly",
    "reporting/reports.write", "reputation/listing.write", "reputation/review.write", "settings.write",
    "socialplanner/account.readonly", "socialplanner/account.write", "socialplanner/category.readonly",
    "socialplanner/category.write", "socialplanner/csv.readonly", "socialplanner/csv.write",
    "socialplanner/facebook.readonly", "socialplanner/filters.readonly", "socialplanner/group.write",
    "socialplanner/hashtag.readonly", "socialplanner/hashtag.write", "socialplanner/linkedin.readonly",
    "socialplanner/medias.readonly", "socialplanner/medias.write", "socialplanner/metatag.readonly",
    "socialplanner/notification.readonly", "socialplanner/notification.write",
    "socialplanner/oauth.readonly", "socialplanner/oauth.write", "socialplanner/post.readonly",
    "socialplanner/post.write", "socialplanner/recurring.readonly", "socialplanner/recurring.write",
    "socialplanner/review.readonly", "socialplanner/review.write", "socialplanner/rss.readonly",
    "socialplanner/rss.write", "socialplanner/search.readonly", "socialplanner/setting.readonly",
    "socialplanner/setting.write", "socialplanner/snapshot.readonly", "socialplanner/snapshot.write",
    "socialplanner/stat.readonly", "socialplanner/tag.readonly", "socialplanner/tag.write",
    "socialplanner/twitter.readonly", "socialplanner/watermarks.readonly",
    "socialplanner/watermarks.write", "triggers.write", "users/team-management.readonly",
    "users/team-management.write", "websites.write", "wordpress.read", "wordpress.write",
    "workflows.readonly",
  ],

  notes: [
    "Cleaned vs legacy: two bogus keys in ONLY_CRM permissions ('users/team-management.write/readonly' - OAuth scopes mistakenly used as permission flags) were dropped; duplicate 'settings.write' scope entries deduped.",
    "DEFAULT_CREATE had no scopes array in getDefaultPermissions(); user creation applied scope dashboard/stats.readonly separately - folded in here.",
    "ENTERPRISE scopes include forms.write; ONLY_CRM/ACCESS_GIVE deliberately do not (legacy difference preserved).",
    "CAP_BLOCKED omits campaignsReadOnly/workflowsReadOnly keys entirely - GHL leaves omitted keys unchanged, so they must stay absent.",
    "BASIC scopes exclude opportunities/bulkActions.write (commented out in legacy source).",
  ],
};

export default data;
