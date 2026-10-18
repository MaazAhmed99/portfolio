/**
 * ============================================================================
 * PROJECT CATALOGUE — single source of truth for cards, case studies and SEO.
 * ============================================================================
 *
 * - `client` renders only when `confidential` is false; otherwise the UI shows
 *   `clientGeneric` instead.
 * - `year` and `liveUrl` are optional, and the UI omits them when absent. A
 *   missing value beats a wrong one: only add live URLs that are public and
 *   return 200.
 * - Screenshots live in public/work/<slug>/. Re-run `pnpm run textures` after
 *   changing them so the 3D showcase picks them up.
 */

export type Screenshot = {
  src: string;
  alt: string;
  caption?: string;
};

export type Project = {
  slug: string;
  title: string;
  /** Real client name. Only render when confidential === false. */
  client?: string;
  /** Shown in place of the client name while confidential. */
  clientGeneric: string;
  tagline: string;
  year?: string;
  role: string;
  stack: string[];
  /** What problem the product existed to solve. */
  problem: string;
  /** What HE built. This is the part that signals seniority. */
  contribution: string[];
  /** Only real, defensible outcomes. Omit rather than invent. */
  outcome?: string;
  liveUrl?: string;
  screenshots: Screenshot[];
  featured: boolean;
  confidential: boolean;
};

export const projects: Project[] = [
  {
    slug: "travel-booking-marketplace",
    title: "Travel Booking Marketplace",
    clientGeneric: "Pacific-region travel operator",
    tagline:
      "Two-sided booking platform spanning car rental, airport transfers and restaurant reservations.",
    role: "Frontend Developer",
    stack: ["React.js", "Redux", "REST APIs", "Responsive Design"],
    problem:
      "A regional travel operator was taking bookings across three unrelated business lines — vehicle hire, airport transfers and restaurant tables — through separate manual channels. They needed one storefront customers could search and book from, and a self-service portal so partner suppliers could manage their own inventory instead of phoning it in.",
    contribution: [
      "Built the customer-facing search and booking flow across all three verticals, with a shared date/time/location form model so the same interaction pattern carries between rental cars, transfers and restaurant reservations.",
      "Implemented the supplier-side portal — a separate authenticated surface for partners to onboard, list inventory and manage incoming reservations.",
      "Wired multi-currency pricing through the booking funnel so displayed rates stay consistent from search to confirmation.",
      "Handled the full reservation lifecycle in the UI: search, availability, driver/passenger details, modification and cancellation.",
    ],
    screenshots: [
      {
        src: "/work/travel-booking-marketplace/01.png",
        alt: "Booking homepage with a tabbed search panel for rental cars, transfers and restaurants over a tropical hero image",
        caption:
          "One search panel, three booking verticals — tabs swap the form without a page change.",
      },
      {
        src: "/work/travel-booking-marketplace/02.png",
        alt: "Restaurant search results with per-listing booking buttons",
      },
      {
        src: "/work/travel-booking-marketplace/03.png",
        alt: "Supplier recruitment section showing the four service lines partners can list",
      },
      {
        src: "/work/travel-booking-marketplace/04.png",
        alt: "Airport transfer service section with fleet and customer stats",
      },
      {
        src: "/work/travel-booking-marketplace/05.png",
        alt: "Feature highlights and a customer testimonial carousel",
      },
    ],
    featured: true,
    confidential: true,
  },

  {
    slug: "community-social-platform",
    title: "Community Social Platform",
    clientGeneric: "Creator-community startup",
    tagline:
      "Social network and marketplace in one product — stories, live video, real-time messaging and seller listings.",
    role: "Frontend Developer",
    stack: [
      "React.js",
      "Redux",
      "WebSockets",
      "Live Video Streaming",
      "REST APIs",
    ],
    problem:
      "A community startup wanted the engagement mechanics of a social network and the transaction mechanics of a marketplace in a single product, rather than sending members off-platform to buy and sell. That meant a feed, stories, live broadcast and direct messaging all had to coexist with product listings and a cart.",
    contribution: [
      "Built the social core: an infinite feed with post composition, image and video attachments, a stories rail with creation flow, and profile pages.",
      "Implemented the real-time layer over WebSockets — direct messaging, unread badges for cart/chat/notifications, and a live presence list showing which members are currently broadcasting.",
      "Integrated live video broadcast and playback into the feed so streams appear inline alongside ordinary posts.",
      "Built the commerce surfaces — seller listing creation, product browsing, cart — and a referral rewards flow issuing platform credit for successful invites.",
      "Delivered the whole product against a dark-first design system, working at the density a feed-based UI demands.",
    ],
    screenshots: [
      {
        src: "/work/community-social-platform/01.png",
        alt: "Dark-themed social feed with a stories rail, post composer offering live video, and a live-members sidebar",
        caption:
          "Feed, stories, live broadcast and commerce entry points sharing one screen.",
      },
      {
        src: "/work/community-social-platform/02.png",
        alt: "Feed post with image attachment beside the friends list",
      },
      {
        src: "/work/community-social-platform/03.png",
        alt: "Paginated comments and the site footer with newsletter sign-up",
      },
      {
        src: "/work/community-social-platform/04.png",
        alt: "Seller profile with their merchandise listings",
      },
      {
        src: "/work/community-social-platform/05.png",
        alt: "Product detail page with image gallery, price and purchase actions",
      },
    ],
    featured: true,
    confidential: true,
  },

  {
    slug: "web3-collectibles-platform",
    title: "NFT Game Landing Site",
    clientGeneric: "Blockchain gaming studio",
    tagline:
      "Cinematic long-scroll landing site for a mythology-themed play-to-earn collection.",
    role: "Frontend Developer",
    stack: ["React.js", "Next.js", "Firebase", "CSS Animation"],
    problem:
      "A gaming studio launching a Greek-mythology collectible drop needed a landing site that could carry heavy art direction and hold attention through a long-scroll story — collection, lore and roadmap — while pointing every visitor at the mint and wallet-connect actions.",
    contribution: [
      "Built the long-scroll site with layered artwork, sectioned storytelling and reveal animation tuned to stay readable rather than merely busy.",
      "Implemented the mint and sold counters in the hero and the collector and roadmap sections.",
      "Wired clear calls to action for minting, the roadmap and wallet connection.",
      "Held the dense, high-contrast visual treatment together across breakpoints, which is where heavily art-directed pages usually break.",
    ],
    screenshots: [
      {
        src: "/work/web3-collectibles-platform/01.png",
        alt: "Dark landing hero with ornate gold framing, mythology artwork and mint counters",
        caption:
          "Heavy art direction held to a strict type and spacing system.",
      },
      {
        src: "/work/web3-collectibles-platform/02.png",
        alt: "The same hero on a wide display",
      },
      {
        src: "/work/web3-collectibles-platform/03.png",
        alt: "Play-to-earn story section",
      },
      {
        src: "/work/web3-collectibles-platform/04.png",
        alt: "Collector section with featured character artwork",
      },
      {
        src: "/work/web3-collectibles-platform/05.png",
        alt: "Roadmap with launch milestones",
      },
    ],
    featured: true,
    confidential: true,
  },

  {
    slug: "tax-filing-saas",
    title: "Tax Filing SaaS Platform",
    clientGeneric: "Tax consultancy firm",
    tagline:
      "Client portal and internal review console for a fixed-fee tax filing service.",
    role: "Frontend Developer",
    stack: ["React.js", "REST APIs", "Authentication", "Form Validation"],
    problem:
      "A tax firm selling a flat-fee 24-hour filing service was collecting client documents over email, which made status opaque to the customer and unmanageable for staff. They needed clients to self-serve submission and tracking, and staff to have a queue they could actually work through.",
    contribution: [
      "Built the marketing site and the authenticated client portal — registration, sign-in, and the multi-step filing intake.",
      "Implemented document upload and submission with validation, so incomplete filings are caught before they reach staff rather than after.",
      "Built filing status tracking, giving clients a clear state for each submission instead of an email thread.",
      "Delivered the internal review console staff use to work the submission queue and move filings through processing.",
    ],
    screenshots: [
      {
        src: "/work/tax-filing-saas/01.png",
        alt: "Tax service homepage with a rotating hero offering 24-hour filing and a prominent call to action",
        caption:
          "Public marketing site and the authenticated portal shared one component library.",
      },
      {
        src: "/work/tax-filing-saas/02.png",
        alt: "Company stats and about section",
      },
      {
        src: "/work/tax-filing-saas/03.png",
        alt: "Tax plans for individuals, small businesses and independent contractors",
      },
      {
        src: "/work/tax-filing-saas/04.png",
        alt: "Mission and vision section",
      },
      {
        src: "/work/tax-filing-saas/05.png",
        alt: "Service guarantees and the filing price tiers",
      },
    ],
    featured: true,
    confidential: true,
  },

  {
    slug: "wellness-food-platform",
    title: "Wellness Food Platform",
    clientGeneric: "Health and wellness brand",
    tagline:
      "Diet plans, live cooking sessions and a food market in one product, with admin dashboards for the team.",
    year: "2025",
    role: "Full Stack Developer",
    stack: ["React.js", "React Native", "Express.js", "MongoDB"],
    problem:
      "A wellness brand built around food as medicine needed one place where customers could take a health assessment, get a diet plan matched to them, book cooking sessions with its chefs and order meals — and where staff could manage users, coaches and orders without spreadsheets.",
    contribution: [
      "Built the health assessment flow and the personalised diet plans it produces, including the blood-type meal plans.",
      "Built the cooking-session pages for browsing and booking online sessions with the brand's chefs.",
      "Implemented the food market: category browsing, meal listings, orders and customer management.",
      "Delivered the admin dashboards for managing users, coaches, reports and workflows.",
    ],
    screenshots: [
      {
        src: "/work/wellness-food-platform/01.png",
        alt: "Food market with six photographed categories, from breakfast to artisan coffee",
        caption: "Category-led food market over the brand's watermark artwork.",
      },
      {
        src: "/work/wellness-food-platform/02.png",
        alt: "Cooking session booking with video previews and a chef's guide",
      },
      {
        src: "/work/wellness-food-platform/03.png",
        alt: "Food photo gallery, Instagram link and site footer",
      },
      {
        src: "/work/wellness-food-platform/04.png",
        alt: "About page introducing the chefs",
      },
      {
        src: "/work/wellness-food-platform/05.png",
        alt: "Meal plans matched to blood type, with the upcoming cookbook",
      },
    ],
    featured: true,
    confidential: true,
  },

  {
    slug: "home-services-booking",
    title: "Home Services Booking",
    clientGeneric: "Vancouver-based cleaning company",
    tagline:
      "Appointment booking with bilingual support for a local services business.",
    role: "Frontend Developer",
    stack: [
      "React.js",
      "Internationalisation (i18n)",
      "REST APIs",
      "Responsive Design",
    ],
    problem:
      "A cleaning company serving a bilingual customer base was booking jobs by phone. They needed online scheduling, and the site had to work in both English and Chinese because a substantial share of their customers read Chinese first.",
    contribution: [
      "Built the marketing site and the date/time appointment booking flow, including the inline scheduling widget on the landing page.",
      "Implemented the language switcher and internationalised the interface, keeping layout stable across two scripts with very different text lengths.",
      "Built supporting surfaces — services, rates, FAQ, blog, careers and gift-card purchase.",
      "Delivered a customer account area for viewing and managing existing appointments.",
    ],
    screenshots: [
      {
        src: "/work/home-services-booking/01.png",
        alt: "Cleaning service landing page with an inline date and time appointment widget and a language selector",
        caption:
          "Booking widget placed above the fold; language switcher in the primary nav.",
      },
      {
        src: "/work/home-services-booking/02.png",
        alt: "Service highlights alongside a promotional video",
      },
      {
        src: "/work/home-services-booking/03.png",
        alt: "Company stats and partner logos",
      },
      {
        src: "/work/home-services-booking/04.png",
        alt: "Call-to-action with photo gallery and newsletter sign-up",
      },
      {
        src: "/work/home-services-booking/05.png",
        alt: "FAQ accordion covering bookings, pricing and hours",
      },
    ],
    featured: true,
    confidential: true,
  },

  {
    slug: "counselling-practice",
    title: "Counselling Practice Platform",
    clientGeneric: "Private counselling practice",
    tagline: "Appointment booking and content hub for a therapy practice.",
    role: "Frontend Developer",
    stack: ["React.js", "REST APIs", "Responsive Design"],
    problem:
      "A counselling practice needed prospective clients to be able to read about services and book an initial appointment without a phone call — a lower-friction first step matters a great deal in this field.",
    contribution: [
      "Built the practice site with services, rates and practitioner background, and the appointment booking flow.",
      "Built the services carousel so each counselling type leads straight to booking.",
    ],
    screenshots: [
      {
        src: "/work/counselling-practice/01.png",
        alt: "Counselling practice homepage with a calm ocean hero image and a book-appointment call to action",
      },
      {
        src: "/work/counselling-practice/02.png",
        alt: "About section introducing the practice and its experience",
      },
      {
        src: "/work/counselling-practice/03.png",
        alt: "Services carousel for individual, family and marriage counselling with Book Now buttons",
      },
    ],
    featured: false,
    confidential: true,
  },

  {
    slug: "barber-booking",
    title: "On-Demand Barber Booking",
    clientGeneric: "Barber booking startup",
    tagline:
      "Customers request a time and service, and nearby barbers respond.",
    role: "Frontend Developer",
    stack: ["React.js", "Responsive Design", "REST APIs"],
    problem:
      "Customers wanted a haircut at a time that suited them without phoning round shops. The product flips the usual booking model: the customer posts a request, and local barbers respond with their photos, ratings and reviews.",
    contribution: [
      "Built the booking landing page that explains the request model.",
      "Built the request-a-barber flow: date, time, location and service, with the deposit notice shown before confirming.",
    ],
    screenshots: [
      {
        src: "/work/barber-booking/01.png",
        alt: "Booking landing page explaining how customers are matched with local barbers",
      },
      {
        src: "/work/barber-booking/02.png",
        alt: "Request-a-barber form with date, time, location and service fields",
      },
    ],
    featured: false,
    confidential: true,
  },

  {
    slug: "formula-quest",
    title: "Formula Quest",
    clientGeneric: "Education game",
    tagline:
      "Equation-building puzzle game with levels, scoring and a leaderboard.",
    role: "Frontend Developer",
    stack: ["React.js", "Vite", "State Management"],
    problem:
      "A maths practice game where players combine a set of numbers with operators to build valid equations, with levels and a leaderboard to keep them coming back.",
    contribution: [
      "Built the game screen: number tiles, operator keypad, equation input and the completed-formulas table.",
      "Built the landing page, score panel and level progression.",
    ],
    screenshots: [
      {
        src: "/work/formula-quest/01.png",
        alt: "Landing page inviting players to start the maths challenge",
      },
      {
        src: "/work/formula-quest/02.png",
        alt: "Level 1 game screen with number tiles, operator keypad and completed formulas",
      },
    ],
    featured: false,
    confidential: true,
  },

  {
    slug: "ice-cream-truck-booking",
    title: "Ice Cream Truck Event Booking",
    clientGeneric: "Ice cream truck franchise",
    tagline: "Menu, gallery and event booking for an ice cream truck business.",
    role: "Frontend Developer",
    stack: ["React.js", "Responsive Design", "Form Validation"],
    problem:
      "An ice cream truck business took event bookings by phone. It needed a site that showed the menu and past events, and let customers request a truck for a date with a price estimate.",
    contribution: [
      "Built the gallery and the truck menu.",
      "Built the multi-step event booking form with date, guest count, time, location and a live price estimate.",
    ],
    screenshots: [
      {
        src: "/work/ice-cream-truck-booking/01.png",
        alt: "Event photo gallery and the ice cream truck menu",
      },
      {
        src: "/work/ice-cream-truck-booking/02.png",
        alt: "Multi-step event booking form with a price estimate",
      },
    ],
    featured: false,
    confidential: true,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Client name if cleared, otherwise the generic descriptor. */
export function displayClient(p: Project): string {
  return p.confidential || !p.client ? p.clientGeneric : p.client;
}
