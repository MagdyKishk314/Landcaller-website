/**
 * Content for the "Enterprise Data" section of /pricing: All-Inclusive vs Bring
 * Your Own Data, credit packages, and a real customer cost breakdown.
 *
 * Customer example arithmetic (10,000-credit package, $0.115 per credit):
 *   24,539 submitted - 2,176 unmatched - 7,933 excluded = 14,430 billable
 *   14,430 x 0.50 = 7,215 credits = $829.73 (3.38c per submitted record)
 *   14,430 x 0.35 = 5,050.5 credits = $580.81 (2.37c per submitted record)
 * The one-campaign estimate halves the volume: $414.86 and $290.40.
 */

export interface CreditPackage {
  credits: number;
  price: number;
}

export const creditPackages: CreditPackage[] = [
  { credits: 2000, price: 260 },
  { credits: 5000, price: 600 },
  { credits: 10000, price: 1150 },
  { credits: 25000, price: 2750 },
];

export const processingRates = [
  { label: "Skip Tracing + TCPA/DNC Scrubbing", credits: 0.5 },
  { label: "TCPA/DNC Scrubbing Only", credits: 0.35 },
];

export const enterpriseData = {
  eyebrow: "Enterprise Data",
  heading: "Choose Your Data Option",
  allInclusive: {
    name: "All-Inclusive Data",
    price: "Additional $1,100/month",
    body:
      "We pull, skip trace, and scrub your records, delivering approximately 10,000-12,000 dial-ready records per month.",
    bestFor: "A fully managed solution with no credits to buy or manage.",
    note: "Client must provide enough geographic coverage.",
  },
  byod: {
    name: "Bring Your Own Data (BYOD)",
    price: "Usage-Based Processing Costs",
    body: "Process your own records through our Data Dashboard, using credits:",
    bestFor: "Customers who already have property data and want more control over costs.",
  },
  dnc: {
    heading: "You Don't Pay for DNC Records",
    body:
      "Credits are only deducted for clean, dialable records. DNC records are typically about 50% of a list, and unmatched records are returned at no cost. Actual percentages vary by list.",
  },
  packages: {
    heading: "BYOD Credit Packages",
    larger: "Larger packages are available in the Data Dashboard.",
  },
  example: {
    expand: "See a Real Customer Cost Breakdown",
    basis:
      "A completed Enterprise customer job covering two campaigns, using the 10,000-credit package ($0.115 per credit).",
    records: [
      { label: "Records Submitted", value: "24,539" },
      { label: "Unmatched (not billed)", value: "2,176" },
      { label: "Excluded (not billed)", value: "7,933" },
      { label: "Billable Records", value: "14,430", strong: true },
    ],
    costs: [
      { label: "Credits Used", skip: "7,215", scrub: "5,050.5" },
      { label: "Total Cost", skip: "$829.73", scrub: "$580.81", strong: true },
      { label: "Cost per Submitted Record", skip: "3.38¢", scrub: "2.37¢" },
      { label: "Estimated Cost for One Campaign*", skip: "$414.86", scrub: "$290.40" },
    ],
    note:
      "*Illustrative estimate at half the volume, with the same matching and exclusion rates. Actual costs will vary.",
  },
  dashboard: {
    cta: "Access the Data Dashboard",
    note:
      "Open to everyone, not just Land Caller customers. Existing customers should register with the email on their Land Caller account.",
  },
};
