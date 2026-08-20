/**
 * SEO.tsx — Componente de meta tags dinâmicas para SEO e AI Search
 * Suporta: meta tags, Open Graph, Twitter Cards, JSON-LD structured data
 */
import { Helmet } from "react-helmet-async";

const SITE_NAME = "TEAM 24";
const SITE_URL = "https://www.team24.pt";
const DEFAULT_OG_IMAGE = "https://www.team24.pt/media/og-image-team24_7c121de7_2c475101.jpg";
const TWITTER_HANDLE = "@team24pt";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  canonicalPath?: string;
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  canonicalPath,
  publishedAt,
  modifiedAt,
  author,
  noIndex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — EAP Portugal | Saúde Mental nas Empresas`;
  const metaDescription = description || "A plataforma EAP líder em Portugal. Apoio psicológico, jurídico, financeiro e nutricional para colaboradores. Disponível 24h, confidencial, a partir de €4/mês.";
  const metaKeywords = keywords || "EAP Portugal, Employee Assistance Program, saúde mental empresas, burnout prevenção, bem-estar colaboradores, apoio psicológico empresas, psicologia empresarial, TEAM 24";
  const ogImageUrl = ogImage || DEFAULT_OG_IMAGE;
  const canonicalUrl = canonicalPath ? `${SITE_URL}${canonicalPath}` : undefined;

  return (
    <Helmet>
      {/* ── Básico ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* ── Open Graph ── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || SITE_NAME} />
      <meta property="og:locale" content="pt_PT" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* ── Twitter Cards ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* ── Artigo (se aplicável) ── */}
      {ogType === "article" && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {ogType === "article" && modifiedAt && (
        <meta property="article:modified_time" content={modifiedAt} />
      )}
      {ogType === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {ogType === "article" && (
        <meta property="article:publisher" content={`${SITE_URL}`} />
      )}

      {/* ── JSON-LD Structured Data ── */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  );
}

/* ─── Helpers para JSON-LD ─────────────────────────────────── */

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "TEAM 24",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: "/media/logo-team24_dfcec5b7_5da8eed5.svg",
  },
  description: "Plataforma EAP líder em Portugal. Apoio psicológico, jurídico, financeiro, nutricional e social para colaboradores de empresas.",
  foundingDate: "2020",
  areaServed: "PT",
  knowsAbout: [
    "Employee Assistance Program",
    "Saúde Mental nas Empresas",
    "Burnout",
    "Bem-estar Corporativo",
    "Apoio Psicológico",
    "Apoio Jurídico",
    "Apoio Financeiro",
    "Nutrição",
    "Work-Life Balance",
  ],
  sameAs: [
    "https://www.linkedin.com/company/team24pt",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Portuguese",
    areaServed: "PT",
  },
};

export const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "TEAM 24",
  description: "Plataforma EAP líder em Portugal",
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export function blogPostLD(post: {
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  publishedAt: string;
  author: { name: string; role: string };
  tags: string[];
  readTime: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${post.slug}`,
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
      worksFor: { "@id": `${SITE_URL}/#organization` },
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    keywords: post.tags.join(", "),
    timeRequired: `PT${post.readTime}M`,
    inLanguage: "pt-PT",
    isPartOf: {
      "@type": "Blog",
      "@id": `${SITE_URL}/blog`,
      name: "Blog TEAM 24",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    about: {
      "@type": "Thing",
      name: "Saúde Mental nas Empresas",
    },
  };
}

export function breadcrumbLD(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqLD(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function serviceLD(service: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: `${SITE_URL}${service.url}`,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: "PT",
    availableLanguage: "Portuguese",
  };
}

export function jobPostingLD(job: {
  title: string;
  description: string;
  slug: string;
  department?: string;
  location?: string;
  tipo?: string;
  salarioMin?: number | null;
  salarioMax?: number | null;
  publishedAt: string;
}) {
  const employmentTypeMap: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    "freelance": "CONTRACTOR",
    "estagio": "INTERN",
  };
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: "TEAM 24",
      value: job.slug,
    },
    datePosted: job.publishedAt,
    hiringOrganization: {
      "@type": "Organization",
      name: "TEAM 24",
      sameAs: SITE_URL,
      logo: "/media/logo-team24_dfcec5b7_5da8eed5.svg",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Portugal",
        addressCountry: "PT",
      },
    },
    employmentType: employmentTypeMap[job.tipo || "full-time"] || "FULL_TIME",
    url: `${SITE_URL}/carreiras/${job.slug}`,
  };
  if (job.salarioMin || job.salarioMax) {
    ld.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: {
        "@type": "QuantitativeValue",
        ...(job.salarioMin ? { minValue: job.salarioMin } : {}),
        ...(job.salarioMax ? { maxValue: job.salarioMax } : {}),
        unitText: "MONTH",
      },
    };
  }
  return ld;
}
