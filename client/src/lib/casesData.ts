/* ============================================================
   TEAM 24 — Cases Data
   Apenas tipos/interfaces. Os dados são geridos pelo backoffice.
   ============================================================ */

export interface CaseStudy {
  id: string;
  slug: string;
  company: string;
  sector: string;
  size: string;
  location: string;
  logo: string;
  coverImage: string;
  tagline: string;
  challenge: string;
  solution: string;
  results: string;
  quote: string;
  quoteName: string;
  quoteRole: string;
  quoteAvatar: string;
  metrics: { value: string; label: string; description: string }[];
  timeline: string;
  featured?: boolean;
}
