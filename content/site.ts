/**
 * Canonical origin for metadata, the sitemap and social previews.
 *
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every deployment, so links and
 * link previews are correct before a custom domain exists. Once one is bought,
 * set NEXT_PUBLIC_SITE_URL (e.g. https://maazahmed.dev) in the Vercel project.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
