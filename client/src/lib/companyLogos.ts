/**
 * Centralized company logos registry.
 * Uses CDN URLs for logos that were successfully downloaded,
 * and inline SVG data URIs for logos that could not be fetched externally.
 */

export interface CompanyLogo {
  name: string;
  logo: string; // CDN URL or data URI
  type: "img" | "svg-inline";
  /** Optional: custom filter to apply on dark backgrounds */
  darkFilter?: string;
}

// Inline SVG text logos for companies without real logos
function textLogo(text: string, color: string, bg = "transparent"): string {
  const width = Math.max(120, text.length * 10 + 20);
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="40" viewBox="0 0 ${width} 40"><rect width="${width}" height="40" fill="${encodeURIComponent(bg)}" rx="4"/><text x="${width / 2}" y="27" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="${encodeURIComponent(color)}" text-anchor="middle">${text}</text></svg>`;
}

export const COMPANY_LOGOS: Record<string, CompanyLogo> = {
  // === Real logos provided by TEAM 24 (uploaded to CDN) ===
  adecco: {
    name: "Adecco",
    logo: "/media/adecco-logo-site-1_d9b28d18_be7452a5.webp",
    type: "img",
  },
  aguasdeportugal: {
    name: "Águas de Portugal",
    logo: "/media/aguasdeportugal-logo_3191f5d3_860f4b84.jpg",
    type: "img",
  },
  bancobni: {
    name: "Banco BNI Europa",
    logo: "/media/bancobni_442b96d7_5d79c319.jpg",
    type: "img",
  },
  casais: {
    name: "Casais",
    logo: "/media/casais2024_60b931ef_a75bfc46.jpg",
    type: "img",
  },
  grupo_casais: {
    name: "Grupo Casais",
    logo: "/media/casais2024_60b931ef_a75bfc46.jpg",
    type: "img",
  },
  doutor_financas: {
    name: "Doutor Finanças",
    logo: "/media/doutor-financas-logo-1_6faad454_5530863d.webp",
    type: "img",
  },
  galp: {
    name: "Galp",
    logo: "/media/galp-web_b9356f13_02d3937f.jpg",
    type: "img",
  },
  ikea: {
    name: "IKEA",
    logo: "/media/ikea-web_c8be785e_8c5bdc69.jpg",
    type: "img",
  },
  mercedes: {
    name: "Mercedes-Benz .io",
    logo: "/media/mercedes-1_aca2a0cd_ec3f8c03.webp",
    type: "img",
  },
  mds: {
    name: "MDS",
    logo: "/media/mds2024_92f71f15_f6a11a4f.jpg",
    type: "img",
  },
  nova: {
    name: "Universidade Nova de Lisboa",
    logo: "/media/nova_110d6900_21d22c26.jpg",
    type: "img",
  },
  rtp: {
    name: "RTP",
    logo: "/media/RTP-logo_3a708cc6_04e32974.jpg",
    type: "img",
  },
  salvador_caetano: {
    name: "Salvador Caetano",
    logo: "/media/salvador-caetano-logo_db9504dc_ff6891a7.jpg",
    type: "img",
  },
  stcp: {
    name: "STCP",
    logo: "/media/stcp_ef400a74_9db4bb72.jpg",
    type: "img",
  },
  norauto: {
    name: "Norauto",
    logo: "/media/norauto_323378eb_33f43fb0.jpg",
    type: "img",
  },
  mcdonalds: {
    name: "McDonald's",
    logo: "/media/mcdonalds_dbfcb527_ae6bde79.png",
    type: "img",
  },
  // === Previously uploaded SVG logos ===
  edp: {
    name: "EDP",
    logo: "/media/edp_a7c7930d_8b7c8b89.svg",
    type: "img",
  },
  nos: {
    name: "NOS",
    logo: "/media/nos_1a81a417_9e509298.svg",
    type: "img",
  },
  sonae: {
    name: "Sonae",
    logo: "/media/sonae_9f63e4c0_548519c6.svg",
    type: "img",
  },
  santander: {
    name: "Santander",
    logo: "/media/santander_105e3862_bc2292e2.svg",
    type: "img",
  },
  randstad: {
    name: "Randstad",
    logo: "/media/randstad_796e64d9_f5c26e27.svg",
    type: "img",
  },
  millennium_bcp: {
    name: "Millennium bcp",
    logo: "/media/millennium_bcp_d5b85ba8_cfadfc3d.webp",
    type: "img",
  },
  jeronimo_martins: {
    name: "Jerónimo Martins",
    logo: "/media/jeronimo_martins_53253fc8_0c7e51d0.svg",
    type: "img",
  },
  altice: {
    name: "Altice Portugal",
    logo: "/media/altice_e48247ef_4ae0bee5.svg",
    type: "img",
  },
  fidelidade: {
    name: "Fidelidade",
    logo: "/media/fidelidade_b70ff001_12eca3d2.svg",
    type: "img",
  },
  bpi: {
    name: "Banco BPI",
    logo: "/media/bpi_1a6aaf9a_1fe3eb60.svg",
    type: "img",
  },
  eurotux: {
    name: "Eurotux",
    logo: "/media/eurotux_1218995a_f98c31ec.svg",
    type: "img",
  },
  grupo_bel: {
    name: "Grupo BEL",
    logo: textLogo("Grupo BEL", "#004B9B"),
    type: "img",
  },
  // === Novos logos adicionados em Mar 2026 ===
  kuanto_kusta: {
    name: "Kuanto Kusta",
    logo: "/media/kuanto-kusta-logo-1_cc3ce19d.png",
    type: "img",
  },
  express_glass: {
    name: "Express Glass",
    logo: "/media/express-glass-logo-1_ada0257c.png",
    type: "img",
  },
  stcp_new: {
    name: "STCP",
    logo: "/media/stcp_5cb8854a_652a9200_d98e6690.webp",
    type: "img",
  },
  sporting: {
    name: "Sporting CP",
    logo: "/media/sporting-logo-1_6679f069.png",
    type: "img",
  },
  weezie: {
    name: "Weezie",
    logo: "/media/weezie-logo-site_da16b4b4.png",
    type: "img",
  },
  xpandit: {
    name: "Xpandit",
    logo: "/media/xpandit-1_6d632853.png",
    type: "img",
  },
  voltalia: {
    name: "Voltalia",
    logo: "/media/voltalia_9af6e039_f4afca03_b285b731.webp",
    type: "img",
  },
  tangivel: {
    name: "Tangível",
    logo: "/media/tangivel_df2de48b_ab88b11d_41620274.webp",
    type: "img",
  },
  smartconsulting: {
    name: "Smart Consulting",
    logo: "/media/smartconsulting-web_acceb19c_e55808e8_211e51b3.webp",
    type: "img",
  },
  servier: {
    name: "Servier",
    logo: "/media/servier_11b84baa_551a6a8b_b676d3f5.webp",
    type: "img",
  },
  seines: {
    name: "Seines",
    logo: "/media/seines-web_78099f9e_472fd071_045871d4.webp",
    type: "img",
  },
  sanitop: {
    name: "Sanitop",
    logo: "/media/sanitop_eb4b59b4_d1b38940_8af3a716.webp",
    type: "img",
  },
  samsys: {
    name: "Samsys",
    logo: "/media/samsys-logo-site_b8c1df19.png",
    type: "img",
  },
  readiness: {
    name: "Readiness",
    logo: "/media/readiness_318e5eae_e4e2df86_2477046d.webp",
    type: "img",
  },
  ptisp: {
    name: "PTISP",
    logo: "/media/ptisp_da2a4f15_0b33fc48_13ea17d4.webp",
    type: "img",
  },
  politermicaweb: {
    name: "Politérmica",
    logo: "/media/politermicaweb_bb4b4b2c_03371802_291c043f.webp",
    type: "img",
  },
  penguin: {
    name: "Penguin",
    logo: "/media/penguin-web_46768725_6840eeac_62e959d1.webp",
    type: "img",
  },
  nutrium: {
    name: "Nutrium",
    logo: "/media/nutrium_e33a516e_00b74307_eee68dd6.webp",
    type: "img",
  },
  nowo: {
    name: "NOS Nowo",
    logo: "/media/nowo_7398be29_6ec01b5c_92da7f34.webp",
    type: "img",
  },
  miele: {
    name: "Miele",
    logo: "/media/miele-web_8ee072f0_e23fe942_a50380dd.webp",
    type: "img",
  },
  manpower: {
    name: "ManpowerGroup",
    logo: "/media/manpower-1_b258accd.png",
    type: "img",
  },
  mahrla: {
    name: "Mahrla",
    logo: "/media/mahrla-web_20796a8a_c74b4914_446001e7.webp",
    type: "img",
  },
  ldauto: {
    name: "LD Auto",
    logo: "/media/ldauto-web_e1e2c634_f81448c8_672c3a12.webp",
    type: "img",
  },
  latitudde: {
    name: "Latitudde",
    logo: "/media/latitudde-logo-site_1679f605.jpg",
    type: "img",
  },
  ramos_ferreira: {
    name: "Ramos Ferreira",
    logo: "/media/ramos-ferreira_f8b1693f.png",
    type: "img",
  },
  hanon: {
    name: "Hanon Systems",
    logo: "/media/hanon_a87f09af_a3f83c54_6f84746a.webp",
    type: "img",
  },
  hbk: {
    name: "HBK",
    logo: "/media/hbk-logo-site_964eaba2.png",
    type: "img",
  },
  eurotux_new: {
    name: "Eurotux",
    logo: "/media/eurotux-web_d6b20a7e_7c792109_4d775450.webp",
    type: "img",
  },
  diaverum: {
    name: "Diaverum",
    logo: "/media/diaverum_de712fe2_4f3f18cd_ec134d3c.webp",
    type: "img",
  },
  diatosta: {
    name: "Diatosta",
    logo: "/media/diatosta_e5242b8f_60c4c08e_43910f6a.webp",
    type: "img",
  },
  davita: {
    name: "DaVita",
    logo: "/media/davita-1_9488f714.png",
    type: "img",
  },
  corksupply: {
    name: "Corksupply",
    logo: "/media/corksupply-web_3d6a4808_3b31e2c6_abfb0302.webp",
    type: "img",
  },
  cepac: {
    name: "CEPAC",
    logo: "/media/cepac-logo-site_3724a931.webp",
    type: "img",
  },
  capricciosa: {
    name: "Capricciosa",
    logo: "/media/capricciosa-web_d5205e42_229b2469_c68511f4.webp",
    type: "img",
  },
  ccalaw: {
    name: "CCA Law",
    logo: "/media/ccalaw_df795732_9febb90e_396536c0.webp",
    type: "img",
  },
  boost: {
    name: "Boost",
    logo: "/media/boost_6fd6fed9_f0ff6904_585a1b54.webp",
    type: "img",
  },
  // === Logos adicionados em Abr 2026 (fornecidos pelo TEAM 24) ===
  act: {
    name: "ACT — Autoridade para as Condições do Trabalho",
    logo: "/media/act-logo_7b2e9039_033a422a_8c322139.webp",
    type: "img",
  },
  primeit: {
    name: "PrimeIT",
    logo: "/media/primeit-logo_b28cb0df.png",
    type: "img",
  },
  critical_techworks: {
    name: "Critical TechWorks",
    logo: "/media/critical-techworks-logo_b98d805d_f23acc1d_d2787375.webp",
    type: "img",
  },
  verisure: {
    name: "Verisure",
    logo: "/media/verisure-logo_ab719cd3_0cc9c749_45b90a96.webp",
    type: "img",
  },
  dominios_pt: {
    name: "domínios.pt",
    logo: "/media/dominios-pt-logo_33fc0bdd.png",
    type: "img",
  },
  setic_fp: {
    name: "SETIC-FP",
    logo: "/media/setic-fp-logo_16536843_a4628a5a_e2e6cc74.webp",
    type: "img",
  },
  amen_pt: {
    name: "aMEN.PT",
    logo: textLogo("aMEN.PT", "#8B00FF"),
    type: "img",
  },
};

/** Get logo by company name (case-insensitive fuzzy match) */
export function getLogoByName(name: string): CompanyLogo | null {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, logo] of Object.entries(COMPANY_LOGOS)) {
    const keyNorm = key.replace(/_/g, "");
    const nameNorm = logo.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (keyNorm === normalized || nameNorm === normalized) {
      return logo;
    }
  }
  return null;
}

/**
 * Lista de logos para a barra marquee (homepage + landing page)
 * 21 clientes principais selecionados pelo TEAM 24 (Abr 2026)
 */
export const CLIENT_LOGOS_MARQUEE = [
  COMPANY_LOGOS.act,
  COMPANY_LOGOS.galp,
  COMPANY_LOGOS.sporting,
  COMPANY_LOGOS.rtp,
  COMPANY_LOGOS.ikea,
  COMPANY_LOGOS.adecco,
  COMPANY_LOGOS.nova,
  COMPANY_LOGOS.bancobni,
  COMPANY_LOGOS.primeit,
  COMPANY_LOGOS.critical_techworks,
  COMPANY_LOGOS.aguasdeportugal,
  COMPANY_LOGOS.casais,
  COMPANY_LOGOS.salvador_caetano,
  COMPANY_LOGOS.verisure,
  COMPANY_LOGOS.mds,
  COMPANY_LOGOS.amen_pt,
  COMPANY_LOGOS.dominios_pt,
  COMPANY_LOGOS.doutor_financas,
  COMPANY_LOGOS.stcp_new,
  COMPANY_LOGOS.setic_fp,
  COMPANY_LOGOS.express_glass,
];
