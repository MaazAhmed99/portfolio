"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/content/profile";

const links = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "Experience", href: "/#experience" },
  { label: "About", href: "/#about" },
];

/**
 * Anchor links only — no mobile drawer. A hamburger menu would cost client JS
 * in the critical path to solve a problem three links don't have.
 *
 * The bar is a transparent tint over a heavy blur, so the page shows through
 * instead of sitting behind an opaque strip. White-on-blur reads correctly over
 * both the bright gradient and the dark stage, so no theme swap on scroll.
 */
export function Nav() {
  const pathname = usePathname();

  /**
   * On the homepage, <Link href="/"> triggers a route transition — which
   * remounts and jumps to the top instantly. That was the "jerk". Intercept it
   * and animate the scroll instead. Elsewhere it stays a normal navigation.
   */
  const onLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;

    event.preventDefault();

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });

    // Keep the URL clean without adding a history entry.
    window.history.replaceState(null, "", "/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-white/[0.06] backdrop-blur-xl backdrop-saturate-150">
      <nav
        aria-label="Main"
        className="container-page flex h-16 items-center justify-between"
      >
        <Link
          href="/"
          onClick={onLogoClick}
          className="font-mono text-sm font-semibold tracking-tight text-white transition-colors hover:text-accent"
        >
          {profile.name}
          <span className="text-accent">.</span>
        </Link>

        <ul className="flex items-center gap-6">
          {links.map((link) => (
            <li key={link.href} className="hidden sm:block">
              <Link
                href={link.href}
                className="font-mono text-xs tracking-wider text-white/80 uppercase transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/#contact"
              className="rounded border border-white/30 px-3 py-1.5 font-mono text-xs tracking-wider text-white uppercase transition-colors hover:border-white hover:bg-white/10"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
