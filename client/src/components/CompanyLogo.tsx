import { COMPANY_LOGOS, getLogoByName } from "@/lib/companyLogos";

interface CompanyLogoProps {
  /** Key from COMPANY_LOGOS or company name string */
  company: string;
  /** Height in pixels (default 32) */
  height?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether the background is dark (applies brightness filter for dark logos) */
  dark?: boolean;
}

export function CompanyLogo({ company, height = 48, className = "", dark = false }: CompanyLogoProps) {
  // Try direct key lookup first, then fuzzy name match
  const entry =
    COMPANY_LOGOS[company.toLowerCase().replace(/[^a-z0-9]/g, "_")] ||
    COMPANY_LOGOS[company.toLowerCase().replace(/\s+/g, "_")] ||
    getLogoByName(company);

  if (!entry) {
    // Fallback: render company name as text
    return (
      <span
        className={`inline-flex items-center font-semibold text-sm ${className}`}
        style={{ height }}
      >
        {company}
      </span>
    );
  }

  return (
    <img
      src={entry.logo}
      alt={entry.name}
      title={entry.name}
      className={`object-contain ${dark ? "brightness-0 invert" : ""} ${className}`}
      style={{
        height,
        width: "auto",
        maxWidth: height * 4,
        background: "#FFFFFF",
        padding: "6px 10px",
        borderRadius: "6px",
      }}
      loading="lazy"
    />
  );
}

/** Render a row/grid of company logos */
export function CompanyLogosRow({
  companies,
  height = 48,
  dark = false,
  className = "",
}: {
  companies: string[];
  height?: number;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-6 ${className}`}>
      {companies.map((c) => (
        <CompanyLogo key={c} company={c} height={height} dark={dark} />
      ))}
    </div>
  );
}
