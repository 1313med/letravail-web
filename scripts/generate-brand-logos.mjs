import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as si from "simple-icons";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/logos");

function siSvg(key, width = 120, height = 40) {
  const icon = si[key];
  if (!icon) return null;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${width}" height="${height}" role="img" aria-label="${icon.title}">
  <path fill="#${icon.hex}" d="${icon.path}"/>
</svg>`;
}

/** Custom SVG wordmarks / marks — brand colors, simplified official styling */
const CUSTOM = {
  "attijariwafa-bank": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 48" role="img" aria-label="Attijariwafa Bank">
    <circle cx="22" cy="24" r="14" fill="none" stroke="#F39200" stroke-width="3"/>
    <path d="M22 10 A14 14 0 0 1 22 38" fill="none" stroke="#F39200" stroke-width="3"/>
    <text x="44" y="22" fill="#F39200" font-family="system-ui,sans-serif" font-size="11" font-weight="700">Attijariwafa</text>
    <text x="44" y="36" fill="#FFFFFF" font-family="system-ui,sans-serif" font-size="10" font-weight="500">bank</text>
  </svg>`,
  "cih-bank": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" role="img" aria-label="CIH Bank">
    <rect x="4" y="10" width="28" height="28" rx="4" fill="#008542"/>
    <text x="18" y="30" text-anchor="middle" fill="#FFF" font-family="system-ui,sans-serif" font-size="11" font-weight="800">CIH</text>
    <text x="40" y="30" fill="#008542" font-family="system-ui,sans-serif" font-size="14" font-weight="700">BANK</text>
  </svg>`,
  "bank-of-africa": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" role="img" aria-label="Bank of Africa">
    <path d="M8 36 Q20 8 32 36" fill="none" stroke="#00549F" stroke-width="4"/>
    <path d="M18 36 Q30 8 42 36" fill="none" stroke="#00549F" stroke-width="4" opacity="0.5"/>
    <text x="50" y="30" fill="#00549F" font-family="system-ui,sans-serif" font-size="12" font-weight="700">Bank of Africa</text>
  </svg>`,
  "banque-populaire": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" role="img" aria-label="Banque Populaire">
    <rect x="6" y="12" width="10" height="24" fill="#E30613"/>
    <rect x="18" y="12" width="10" height="24" fill="#003DA5"/>
    <text x="36" y="22" fill="#003DA5" font-family="system-ui,sans-serif" font-size="10" font-weight="700">Banque</text>
    <text x="36" y="34" fill="#E30613" font-family="system-ui,sans-serif" font-size="10" font-weight="700">Populaire</text>
  </svg>`,
  "bmci": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 48" role="img" aria-label="BMCI">
    <circle cx="20" cy="24" r="14" fill="#00965E"/>
    <text x="20" y="28" text-anchor="middle" fill="#FFF" font-family="system-ui,sans-serif" font-size="9" font-weight="800">BMCI</text>
    <text x="42" y="28" fill="#00965E" font-family="system-ui,sans-serif" font-size="16" font-weight="700">bmci</text>
  </svg>`,
  "credit-agricole": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 48" role="img" aria-label="Crédit Agricole">
    <rect x="4" y="10" width="28" height="28" rx="14" fill="#009597"/>
    <text x="18" y="29" text-anchor="middle" fill="#FFF" font-family="system-ui,sans-serif" font-size="14" font-weight="800">CA</text>
    <text x="40" y="30" fill="#009597" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Crédit Agricole</text>
  </svg>`,
  "societe-generale": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 48" role="img" aria-label="Société Générale">
    <rect x="4" y="10" width="28" height="28" fill="#E60028"/>
    <text x="18" y="29" text-anchor="middle" fill="#FFF" font-family="system-ui,sans-serif" font-size="11" font-weight="800">SG</text>
    <text x="40" y="30" fill="#E60028" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Société Générale</text>
  </svg>`,
  "cdm": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" role="img" aria-label="CDM">
    <rect x="4" y="10" width="28" height="28" rx="4" fill="#003B7A"/>
    <text x="18" y="29" text-anchor="middle" fill="#FFF" font-family="system-ui,sans-serif" font-size="11" font-weight="800">CDM</text>
    <text x="40" y="30" fill="#003B7A" font-family="system-ui,sans-serif" font-size="12" font-weight="600">Crédit du Maroc</text>
  </svg>`,
  "bank-al-maghrib": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" role="img" aria-label="Bank Al-Maghrib">
    <circle cx="20" cy="24" r="14" fill="#1B5E3B"/>
    <text x="20" y="28" text-anchor="middle" fill="#C5A572" font-family="system-ui,sans-serif" font-size="8" font-weight="800">BAM</text>
    <text x="40" y="30" fill="#1B5E3B" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Bank Al-Maghrib</text>
  </svg>`,
  "maroc-telecom": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 48" role="img" aria-label="Maroc Telecom">
    <text x="4" y="34" fill="#003087" font-family="system-ui,sans-serif" font-size="28" font-weight="800">iam</text>
    <circle cx="68" cy="30" r="4" fill="#F39200"/>
  </svg>`,
  "inwi": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 48" role="img" aria-label="inwi">
    <text x="4" y="34" fill="#5C2D91" font-family="system-ui,sans-serif" font-size="28" font-weight="800">inwi</text>
  </svg>`,
  "ocp": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" role="img" aria-label="OCP Group">
    <polygon points="20,10 32,38 8,38" fill="#006644"/>
    <text x="40" y="30" fill="#006644" font-family="system-ui,sans-serif" font-size="16" font-weight="800">OCP</text>
    <text x="72" y="30" fill="#006644" font-family="system-ui,sans-serif" font-size="10" font-weight="500">Group</text>
  </svg>`,
  "royal-air-maroc": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" role="img" aria-label="Royal Air Maroc">
    <polygon points="20,8 28,38 12,38" fill="#C8102E"/>
    <polygon points="20,8 28,38 12,38" fill="#006233" opacity="0.6" transform="translate(6,0)"/>
    <text x="38" y="22" fill="#C8102E" font-family="system-ui,sans-serif" font-size="9" font-weight="700">Royal Air</text>
    <text x="38" y="34" fill="#006233" font-family="system-ui,sans-serif" font-size="11" font-weight="800">Maroc</text>
  </svg>`,
  "oncf": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 48" role="img" aria-label="ONCF">
    <rect x="4" y="14" width="32" height="20" rx="4" fill="#E30613"/>
    <text x="20" y="28" text-anchor="middle" fill="#FFF" font-family="system-ui,sans-serif" font-size="10" font-weight="800">ONCF</text>
    <text x="44" y="28" fill="#E30613" font-family="system-ui,sans-serif" font-size="12" font-weight="700">ONCF</text>
  </svg>`,
  "managem": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" role="img" aria-label="Managem">
    <circle cx="20" cy="24" r="14" fill="#003DA5"/>
    <text x="20" y="28" text-anchor="middle" fill="#FFF" font-family="system-ui,sans-serif" font-size="8" font-weight="800">M</text>
    <text x="40" y="30" fill="#003DA5" font-family="system-ui,sans-serif" font-size="14" font-weight="700">Managem</text>
  </svg>`,
  "lafargeholcim": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 48" role="img" aria-label="LafargeHolcim">
    <rect x="4" y="10" width="28" height="28" fill="#0072CE"/>
    <text x="40" y="30" fill="#0072CE" font-family="system-ui,sans-serif" font-size="12" font-weight="700">LafargeHolcim</text>
  </svg>`,
  "stellantis": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 48" role="img" aria-label="Stellantis">
    <text x="4" y="32" fill="#243882" font-family="system-ui,sans-serif" font-size="18" font-weight="700" letter-spacing="2">STELLANTIS</text>
  </svg>`,
  "marjane": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 48" role="img" aria-label="Marjane">
    <text x="4" y="32" fill="#E30613" font-family="system-ui,sans-serif" font-size="22" font-weight="800">Marjane</text>
  </svg>`,
  "labelvie": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 48" role="img" aria-label="Label'Vie">
    <text x="4" y="22" fill="#008542" font-family="system-ui,sans-serif" font-size="12" font-weight="700">Label</text>
    <text x="4" y="36" fill="#E30613" font-family="system-ui,sans-serif" font-size="14" font-weight="800">'Vie</text>
  </svg>`,
  "aswak-assalam": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 48" role="img" aria-label="Aswak Assalam">
    <text x="4" y="22" fill="#008542" font-family="system-ui,sans-serif" font-size="11" font-weight="700">Aswak</text>
    <text x="4" y="36" fill="#008542" font-family="system-ui,sans-serif" font-size="11" font-weight="700">Assalam</text>
  </svg>`,
  "bim": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 48" role="img" aria-label="BIM">
    <rect x="4" y="10" width="28" height="28" rx="4" fill="#E30613"/>
    <text x="18" y="29" text-anchor="middle" fill="#FFF" font-family="system-ui,sans-serif" font-size="12" font-weight="800">BIM</text>
    <text x="40" y="30" fill="#E30613" font-family="system-ui,sans-serif" font-size="16" font-weight="800">BIM</text>
  </svg>`,
  "auto-hall": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" role="img" aria-label="Auto Hall">
    <text x="4" y="30" fill="#003DA5" font-family="system-ui,sans-serif" font-size="14" font-weight="700">Auto Hall</text>
  </svg>`,
  "capgemini": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 48" role="img" aria-label="Capgemini">
    <ellipse cx="18" cy="24" rx="10" ry="14" fill="#0070AD"/>
    <text x="34" y="30" fill="#0070AD" font-family="system-ui,sans-serif" font-size="14" font-weight="600">Capgemini</text>
  </svg>`,
  "cgi": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 48" role="img" aria-label="CGI">
    <rect x="4" y="10" width="28" height="28" fill="#E31937"/>
    <text x="18" y="29" text-anchor="middle" fill="#FFF" font-family="system-ui,sans-serif" font-size="11" font-weight="800">CGI</text>
    <text x="40" y="30" fill="#E31937" font-family="system-ui,sans-serif" font-size="16" font-weight="800">CGI</text>
  </svg>`,
  "dxc-technology": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 48" role="img" aria-label="DXC Technology">
    <text x="4" y="30" fill="#5F259F" font-family="system-ui,sans-serif" font-size="20" font-weight="800">DXC</text>
    <text x="52" y="30" fill="#5F259F" font-family="system-ui,sans-serif" font-size="10" font-weight="500">Technology</text>
  </svg>`,
  "wafa-assurance": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 48" role="img" aria-label="Wafa Assurance">
    <text x="4" y="22" fill="#F39200" font-family="system-ui,sans-serif" font-size="12" font-weight="800">WAFA</text>
    <text x="4" y="36" fill="#003DA5" font-family="system-ui,sans-serif" font-size="10" font-weight="600">Assurance</text>
  </svg>`,
  "rma-watanya": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 48" role="img" aria-label="RMA Watanya">
    <text x="4" y="22" fill="#003DA5" font-family="system-ui,sans-serif" font-size="14" font-weight="800">RMA</text>
    <text x="4" y="36" fill="#E30613" font-family="system-ui,sans-serif" font-size="11" font-weight="600">Watanya</text>
  </svg>`,
  "saham-assurance": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 48" role="img" aria-label="Saham Assurance">
    <text x="4" y="30" fill="#008542" font-family="system-ui,sans-serif" font-size="14" font-weight="700">Saham Assurance</text>
  </svg>`,
  "axa-maroc": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 48" role="img" aria-label="AXA">
    <rect x="4" y="10" width="28" height="28" fill="#00008F"/>
    <text x="18" y="29" text-anchor="middle" fill="#FFF" font-family="system-ui,sans-serif" font-size="11" font-weight="800">AXA</text>
    <text x="40" y="30" fill="#00008F" font-family="system-ui,sans-serif" font-size="16" font-weight="800">AXA</text>
  </svg>`,
  "cdg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 48" role="img" aria-label="CDG">
    <rect x="4" y="10" width="28" height="28" rx="4" fill="#1B5E3B"/>
    <text x="18" y="29" text-anchor="middle" fill="#C5A572" font-family="system-ui,sans-serif" font-size="10" font-weight="800">CDG</text>
    <text x="40" y="30" fill="#1B5E3B" font-family="system-ui,sans-serif" font-size="14" font-weight="800">CDG</text>
  </svg>`,
  "anapec": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 48" role="img" aria-label="ANAPEC">
    <text x="4" y="30" fill="#003DA5" font-family="system-ui,sans-serif" font-size="18" font-weight="800">ANAPEC</text>
  </svg>`,
  "emploi-public": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 48" role="img" aria-label="Emploi Public">
    <text x="4" y="22" fill="#1B5E3B" font-family="system-ui,sans-serif" font-size="11" font-weight="700">Emploi</text>
    <text x="4" y="36" fill="#C8102E" font-family="system-ui,sans-serif" font-size="11" font-weight="700">Public</text>
  </svg>`,
  "onee": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 48" role="img" aria-label="ONEE">
    <text x="4" y="30" fill="#0072CE" font-family="system-ui,sans-serif" font-size="20" font-weight="800">ONEE</text>
  </svg>`,
  "masen": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 48" role="img" aria-label="MASEN">
    <circle cx="20" cy="24" r="14" fill="#F39200"/>
    <text x="20" y="28" text-anchor="middle" fill="#FFF" font-family="system-ui,sans-serif" font-size="8" font-weight="800">☀</text>
    <text x="40" y="30" fill="#F39200" font-family="system-ui,sans-serif" font-size="14" font-weight="800">MASEN</text>
  </svg>`,
};

const SIMPLE_ICON_MAP = {
  "orange-maroc": "siOrange",
  "renault-maroc": "siRenault",
};

fs.mkdirSync(outDir, { recursive: true });

for (const [file, svg] of Object.entries(CUSTOM)) {
  fs.writeFileSync(path.join(outDir, `${file}.svg`), svg);
}

for (const [file, key] of Object.entries(SIMPLE_ICON_MAP)) {
  const svg = siSvg(key, 80, 40);
  if (svg) fs.writeFileSync(path.join(outDir, `${file}.svg`), svg);
}

console.log(`Generated ${Object.keys(CUSTOM).length + Object.keys(SIMPLE_ICON_MAP).length} brand SVG logos`);
