import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/logos");

/** file base → download sources (tried in order) */
const LOGOS = {
  "attijariwafa-bank": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Attijariwafa_Bank_logo.svg/512px-Attijariwafa_Bank_logo.svg.png",
    "https://logo.clearbit.com/attijariwafabank.com",
  ],
  "cih-bank": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/CIH_Bank_logo.svg/512px-CIH_Bank_logo.svg.png",
    "https://logo.clearbit.com/cihbank.ma",
  ],
  "bank-of-africa": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Bank_of_Africa_logo.svg/512px-Bank_of_Africa_logo.svg.png",
    "https://logo.clearbit.com/bankofafrica.ma",
  ],
  "banque-populaire": [
    "https://logo.clearbit.com/gp.ma",
    "https://logo.clearbit.com/banquepopulaire.ma",
  ],
  "bmci": [
    "https://logo.clearbit.com/bmci.ma",
  ],
  "credit-agricole": [
    "https://logo.clearbit.com/credit-agricole.ma",
    "https://logo.clearbit.com/credit-agricole.com",
  ],
  "societe-generale": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Soci%C3%A9t%C3%A9_G%C3%A9n%C3%A9rale.svg/512px-Soci%C3%A9t%C3%A9_G%C3%A9n%C3%A9rale.svg.png",
    "https://logo.clearbit.com/societegenerale.ma",
  ],
  "cdm": [
    "https://logo.clearbit.com/creditdumaroc.ma",
  ],
  "bank-al-maghrib": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Bank_Al-Maghrib_logo.svg/512px-Bank_Al-Maghrib_logo.svg.png",
    "https://logo.clearbit.com/bkam.ma",
  ],
  "maroc-telecom": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Maroc_Telecom_logo.svg/512px-Maroc_Telecom_logo.svg.png",
    "https://logo.clearbit.com/iam.ma",
  ],
  "orange-maroc": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/512px-Orange_logo.svg.png",
    "https://logo.clearbit.com/orange.ma",
  ],
  "inwi": [
    "https://logo.clearbit.com/inwi.ma",
    "https://logo.clearbit.com/inwi.ma",
  ],
  "ocp": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/OCP_Group_logo.svg/512px-OCP_Group_logo.svg.png",
    "https://logo.clearbit.com/ocpgroup.ma",
  ],
  "royal-air-maroc": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Royal_Air_Maroc_logo.svg/512px-Royal_Air_Maroc_logo.svg.png",
    "https://logo.clearbit.com/royalairmaroc.com",
  ],
  "oncf": [
    "https://logo.clearbit.com/oncf.ma",
  ],
  "managem": [
    "https://logo.clearbit.com/managemgroup.com",
  ],
  "lafargeholcim": [
    "https://logo.clearbit.com/lafargeholcim.ma",
    "https://logo.clearbit.com/holcim.com",
  ],
  "renault-maroc": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Renault_2021.svg/512px-Renault_2021.svg.png",
    "https://logo.clearbit.com/renault.ma",
  ],
  "stellantis": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Stellantis.svg/512px-Stellantis.svg.png",
    "https://logo.clearbit.com/stellantis.com",
  ],
  "marjane": [
    "https://logo.clearbit.com/marjane.ma",
  ],
  "labelvie": [
    "https://logo.clearbit.com/labelvie.ma",
  ],
  "aswak-assalam": [
    "https://logo.clearbit.com/aswakassalam.com",
  ],
  "bim": [
    "https://logo.clearbit.com/bim.ma",
  ],
  "auto-hall": [
    "https://logo.clearbit.com/autohall.ma",
  ],
  "capgemini": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Capgemini_201x_logo.svg/512px-Capgemini_201x_logo.svg.png",
    "https://logo.clearbit.com/capgemini.com",
  ],
  "cgi": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/CGI_logo.svg/512px-CGI_logo.svg.png",
    "https://logo.clearbit.com/cgi.com",
  ],
  "dxc-technology": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/DXC_Technology_logo.svg/512px-DXC_Technology_logo.svg.png",
    "https://logo.clearbit.com/dxc.com",
  ],
  "wafa-assurance": [
    "https://logo.clearbit.com/wafabank.com",
  ],
  "rma-watanya": [
    "https://logo.clearbit.com/rmawatanya.ma",
  ],
  "saham-assurance": [
    "https://logo.clearbit.com/sahamassurance.ma",
  ],
  "axa-maroc": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/AXA_Logo.svg/512px-AXA_Logo.svg.png",
    "https://logo.clearbit.com/axa.ma",
  ],
  "cdg": [
    "https://logo.clearbit.com/cdg.ma",
  ],
  "anapec": [
    "https://logo.clearbit.com/anapec.org",
  ],
  "emploi-public": [
    "https://logo.clearbit.com/emploipublic.ma",
  ],
  "onee": [
    "https://logo.clearbit.com/onee.ma",
  ],
  "masen": [
    "https://logo.clearbit.com/masen.ma",
  ],
};

async function download(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "LetravailWeb/1.0 (logo fetch)" },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) return null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("text/html")) return null;
  return { buf, ext: ct.includes("svg") ? "svg" : "png" };
}

fs.mkdirSync(outDir, { recursive: true });

const results = { ok: [], fail: [] };

for (const [name, urls] of Object.entries(LOGOS)) {
  let saved = false;
  for (const url of urls) {
    try {
      const data = await download(url);
      if (!data) continue;
      const file = path.join(outDir, `${name}.${data.ext}`);
      fs.writeFileSync(file, data.buf);
      results.ok.push(`${name}.${data.ext}`);
      saved = true;
      console.log(`✓ ${name} ← ${url}`);
      break;
    } catch (e) {
      /* try next */
    }
  }
  if (!saved) {
    results.fail.push(name);
    console.log(`✗ ${name}`);
  }
}

console.log(`\nDone: ${results.ok.length} ok, ${results.fail.length} failed`);
if (results.fail.length) console.log("Failed:", results.fail.join(", "));
