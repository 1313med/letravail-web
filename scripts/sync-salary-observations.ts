/**
 * Sync salary observations from scraped jobs into the data moat table.
 * Run: npx tsx scripts/sync-salary-observations.ts
 */
import { syncSalaryObservations } from "../src/lib/data-moat";

async function main() {
  const result = await syncSalaryObservations(2000);
  console.log(`Processed ${result.processed} jobs, inserted ${result.inserted} observations.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
