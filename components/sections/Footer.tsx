import Link from "next/link";
import { profile, projectEmailHref, socials } from "@/content/profile";

const nav = [
  { label: "Selected work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "Experience", href: "/#experience" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

/**
 * Deliberately a solid dark band, not more gradient.
 *
 * When the footer shared the Contact section's background it read as the
 * bottom of that section rather than the end of the page. A hard tonal break
 * plus its own three-column structure gives it a clear identity.
 */
export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-base">
      <div className="container-page py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="font-mono text-sm font-semibold tracking-tight text-white">
              {profile.name}
              <span className="text-accent">.</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
              {profile.headline} in {profile.location}. Building fast, secure
              web apps for clients worldwide.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <p className="font-mono text-[11px] tracking-[0.18em] text-white/60 uppercase">
              Navigate
            </p>
            <ul className="mt-4 space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="font-mono text-[11px] tracking-[0.18em] text-white/60 uppercase">
              Get in touch
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href={projectEmailHref}
                  className="text-sm break-all text-white/70 transition-colors hover:text-accent"
                >
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={profile.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 transition-colors hover:text-accent"
                >
                  WhatsApp {profile.phone}
                </a>
              </li>
              {socials
                .filter((s) => !s.href.startsWith("mailto:"))
                .map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/70 transition-colors hover:text-accent"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 font-mono text-xs text-white/55">
          <p>
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
          <p>Next.js · TypeScript · React Three Fiber</p>
        </div>
      </div>
    </footer>
  );
}
