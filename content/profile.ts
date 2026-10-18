/**
 * Personal details. Kept in one place so the site and the CV never drift.
 * Source of truth for the CV copy: ../maaz-cv/Maaz-Ahmed-CV-ATS-PlainText.txt
 */

export const profile = {
  name: "Maaz Ahmed",
  /** Job title, as on the CV and in the experience timeline. */
  title: "Senior Frontend Engineer",
  /** What a client sees first: the work on offer, not the job title. */
  headline: "Senior React & Next.js Developer",
  location: "Karachi, Pakistan",
  availability: "Available for freelance projects",
  // Karachi is UTC+5 all year with no daylight saving, so this never drifts.
  hours: "Karachi, UTC+5. My hours overlap US mornings and UK afternoons.",
  responseTime: "I reply within 24 hours",

  githubUsername: "MaazAhmed99",

  email: "maazahmed03400@gmail.com",
  phone: "+92 340 037 7689",
  phoneHref: "+923400377689",
  whatsapp: "https://wa.me/923400377689",
  linkedin: "https://www.linkedin.com/in/maaz-ahmed-15b7aa1b3",
  upwork: "https://www.upwork.com/freelancers/maazahmedengineer",

  // Drop the exported PDF into /public as this filename to enable the CV link.
  cvPath: "/Maaz-Ahmed-Senior-Frontend-Engineer.pdf",

  stack: ["React.js", "Next.js", "TypeScript", "React Native", "Node.js"],

  intro:
    "I build fast, reliable web apps for startups and growing businesses: SaaS dashboards, booking platforms and business websites in React and Next.js.",

  /** Each figure is backed by a case study or the experience section. */
  stats: [
    { value: "6 yrs", label: "shipping production React" },
    { value: "10", label: "client products in this portfolio" },
    { value: "~30%", label: "faster load times on a live ERP" },
  ],

  bio: [
    "I lead the frontend of a multi-portal yacht club management ERP, where I own the architecture decisions, drove the performance work that cut load times by around 30%, and review code for the frontend team.",
    "Before that I spent five years across product and agency teams, building booking marketplaces, SaaS platforms and real-time social products. Most of it was React, with React Native for mobile and Node/Express when a job needed the backend too.",
    "What I care about most: an interface that stays fast on a mid-range phone, and code the next developer can pick up without calling me.",
  ],
} as const;

export const socials = [
  { label: "LinkedIn", href: profile.linkedin },
  {
    label: "GitHub",
    href: `https://github.com/${profile.githubUsername}`,
  },
  { label: "Upwork", href: profile.upwork },
  { label: "Email", href: `mailto:${profile.email}` },
] as const;

/** Prefilled so the first email already says what it is about. */
export const projectEmailHref = `mailto:${profile.email}?subject=${encodeURIComponent(
  "Project enquiry",
)}`;

/** Career history, mirroring the CV exactly. */
export const experience = [
  {
    role: "Senior Frontend Developer",
    company: "Sibisoft (Pvt.) Ltd.",
    period: "Jul 2026 — Present",
    note: "Promoted from Frontend Developer",
    points: [
      "Lead frontend development of a yacht club management ERP spanning member/sailor and administrative portals, a super-admin console, and a configurable penalties module.",
      "Drive architecture R&D for a mobile-first platform, defining component structure, state-management patterns and a reusable UI standard adopted across the team.",
      "Own the performance, security and stability workstreams — profiling render bottlenecks, trimming bundle size, hardening authentication and role-based access control.",
      "Review code and mentor frontend developers, improving delivery consistency through shared conventions and a shared component library.",
    ],
  },
  {
    role: "Frontend Developer",
    company: "Sibisoft (Pvt.) Ltd.",
    period: "Jul 2023 — Jul 2026",
    points: [
      "Built and shipped features for Sibisoft's ERP web platform and its hybrid mobile app using React.js and React Native.",
      "Cut application load times by ~30% through code splitting, lazy loading, render memoization and asset optimization.",
      "Delivered features across both monolithic and microservices architectures, consolidating multiple REST services into one consistent user interface.",
    ],
  },
  {
    role: "Full Stack Developer",
    company: "PNC Solutions (Appiskey)",
    period: "Apr 2023 — Jun 2023",
    points: [
      "Developed scalable web applications end to end with React.js, Vue.js, Node.js, Express.js and MongoDB.",
      "Owned the full development lifecycle from architecture to deployment using Firebase, GitLab CI/CD pipelines and Jest test suites.",
    ],
  },
  {
    role: "Front End Developer",
    company: "InovioTech (Pvt.) Ltd.",
    period: "Jan 2022 — Mar 2023",
    points: [
      "Developed scalable single-page applications with React.js and Vue.js for client-facing products.",
      "Integrated REST APIs, WebSocket real-time features, Stripe payments, Google/Facebook social login and media streaming services.",
    ],
  },
  {
    role: "Front End Developer",
    company: "Jetnetix Solutions",
    period: "Aug 2020 — Jan 2022",
    points: [
      "Converted Figma and Adobe XD designs into pixel-accurate, responsive interfaces using React, Redux, Bootstrap, Material UI and SCSS.",
      "Implemented UI animations and interactive components, and wired front ends to REST APIs and third-party services.",
    ],
  },
] as const;

/** Skill groups, mirroring the CV. */
export const skillGroups = [
  {
    label: "Languages",
    items: ["JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3", "SCSS/Sass", "SQL"],
  },
  {
    label: "Frontend",
    items: [
      "React.js",
      "Next.js",
      "Vue.js",
      "Redux & Redux Toolkit",
      "RTK Query",
      "React Hooks",
      "Context API",
      "Material UI",
      "Bootstrap",
    ],
  },
  {
    label: "Mobile",
    items: ["React Native", "Ionic Framework", "Mobile-First Development"],
  },
  {
    label: "Backend & Data",
    items: [
      "Node.js",
      "Express.js",
      "MongoDB",
      "SQL",
      "REST API Design",
      "WebSockets",
      "Firebase",
    ],
  },
  {
    label: "Testing & Quality",
    items: [
      "Jest",
      "React Testing Library",
      "Code Review",
      "Performance Profiling",
      "Clean Architecture",
    ],
  },
  {
    label: "Tools & Process",
    items: [
      "Git",
      "GitHub",
      "GitLab",
      "GitLab CI/CD",
      "Webpack",
      "Vite",
      "Agile / Scrum",
      "Figma & Adobe XD",
    ],
  },
] as const;
