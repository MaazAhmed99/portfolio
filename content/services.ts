/**
 * What a client can hire for, and how a project runs. Every "proof" line has
 * to point at real work on this site or a claim from the CV.
 */

export type Service = {
  title: string;
  body: string;
  proof: string;
  /** Case study that backs the claim, when there is one. */
  link?: { label: string; href: string };
};

export const services: Service[] = [
  {
    title: "Security check-ups for AI-built apps",
    body: "Built your app with Lovable, Bolt or Supabase? I review row-level security policies, exposed keys and sign-in flows, explain what is open in plain English, then fix it.",
    proof:
      "I hardened authentication and role-based access on a production ERP.",
  },
  {
    title: "Web apps, dashboards and portals",
    body: "Client portals, admin consoles and SaaS dashboards in React, Next.js and TypeScript, with role-based access and code your team can maintain.",
    proof: "Client portal plus a staff review console for a tax firm.",
    link: { label: "Tax Filing SaaS Platform", href: "/work/tax-filing-saas" },
  },
  {
    title: "Booking and marketplace platforms",
    body: "Search, availability, booking flows and supplier portals: the parts of a marketplace where users decide whether to trust it.",
    proof: "Three booking verticals and a supplier portal in one product.",
    link: {
      label: "Travel Booking Marketplace",
      href: "/work/travel-booking-marketplace",
    },
  },
  {
    title: "Fast business websites and speed fixes",
    body: "Next.js websites that load fast and rank, with contact forms and email that actually arrive. Or I profile your existing React app and make it faster.",
    proof: "Cut load times by about 30% on a live ERP.",
  },
];

export const workflow = [
  {
    step: "Free 15-minute call",
    body: "You tell me what you are building. I ask the questions that change the price.",
  },
  {
    step: "Written plan and quote",
    body: "Scope, milestones and a fixed price in writing, usually within a day.",
  },
  {
    step: "Weekly demos",
    body: "A live preview link from the first week, so you see progress instead of hearing about it.",
  },
  {
    step: "Clean handover",
    body: "Your code in your repository, deployed, with notes the next developer can follow.",
  },
];
