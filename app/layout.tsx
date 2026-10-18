import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { profile } from "@/content/profile";
import { SITE_URL } from "@/content/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
});

const DESCRIPTION =
  "Senior React and Next.js developer building fast, secure web apps for startups and growing businesses: SaaS dashboards, booking platforms and business websites. Available for freelance projects.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} | ${profile.headline}`,
    template: `%s | ${profile.name}`,
  },
  description: DESCRIPTION,
  keywords: [
    "Freelance React Developer",
    "Next.js Developer for hire",
    "Senior Frontend Engineer",
    "React Native Developer",
    "Supabase security review",
    "Frontend Developer Pakistan",
    profile.name,
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: SITE_URL,
    title: `${profile.name} | ${profile.headline}`,
    description: DESCRIPTION,
    siteName: profile.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} | ${profile.headline}`,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

/** Structured data so search engines understand who this page is about. */
function PersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    email: profile.email,
    telephone: profile.phone,
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Karachi",
      addressCountry: "PK",
    },
    sameAs: [
      profile.linkedin,
      `https://github.com/${profile.githubUsername}`,
      profile.upwork,
    ],
    knowsAbout: [
      "React.js",
      "Next.js",
      "TypeScript",
      "React Native",
      "Node.js",
      "Frontend Architecture",
      "Web Performance",
    ],
  };
  return (
    <script
      type="application/ld+json"
      // Static, author-controlled object — no user input reaches this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        {/* Without JS: the reveal animation would leave content at opacity 0,
            and the loader could never dismiss itself. Both are neutralised
            here. Content is server-rendered, so this is purely visual state. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}#site-loader{display:none !important}`}</style>
        </noscript>
        <PersonSchema />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-base"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
