import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/logos");

const companies = [
  ["attijariwafa-bank.svg", "Attijariwafa Bank"],
  ["cih-bank.svg", "CIH Bank"],
  ["bank-of-africa.svg", "Bank of Africa"],
  ["banque-populaire.svg", "Banque Populaire"],
  ["bmci.svg", "BMCI"],
  ["credit-agricole.svg", "Crédit Agricole"],
  ["societe-generale.svg", "Société Générale"],
  ["cdm.svg", "CDM"],
  ["bank-al-maghrib.svg", "Bank Al-Maghrib"],
  ["maroc-telecom.svg", "Maroc Telecom"],
  ["orange-maroc.svg", "Orange Maroc"],
  ["inwi.svg", "inwi"],
  ["ocp.svg", "OCP Group"],
  ["royal-air-maroc.svg", "Royal Air Maroc"],
  ["oncf.svg", "ONCF"],
  ["managem.svg", "Managem"],
  ["lafargeholcim.svg", "LafargeHolcim"],
  ["renault-maroc.svg", "Renault Maroc"],
  ["stellantis.svg", "Stellantis"],
  ["marjane.svg", "Marjane"],
  ["labelvie.svg", "Label'Vie"],
  ["aswak-assalam.svg", "Aswak Assalam"],
  ["bim.svg", "BIM"],
  ["auto-hall.svg", "Auto Hall"],
  ["capgemini.svg", "Capgemini"],
  ["cgi.svg", "CGI"],
  ["dxc-technology.svg", "DXC Technology"],
  ["wafa-assurance.svg", "Wafa Assurance"],
  ["rma-watanya.svg", "RMA Watanya"],
  ["saham-assurance.svg", "Saham Assurance"],
  ["axa-maroc.svg", "AXA Assurance"],
  ["cdg.svg", "CDG"],
  ["anapec.svg", "ANAPEC"],
  ["emploi-public.svg", "Emploi Public"],
  ["onee.svg", "ONEE"],
  ["masen.svg", "MASEN"],
];

function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function makeSvg(name) {
  const width = Math.max(100, Math.round(name.length * 7.2 + 24));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 40" role="img" aria-label="${escapeXml(name)}">
  <text x="${width / 2}" y="26" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="13" font-weight="600" letter-spacing="0.02em">${escapeXml(name)}</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });
for (const [file, name] of companies) {
  fs.writeFileSync(path.join(outDir, file), makeSvg(name));
}
console.log(`Generated ${companies.length} logos`);
