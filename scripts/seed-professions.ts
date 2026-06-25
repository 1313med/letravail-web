import { PrismaClient } from "@prisma/client";
import { PROFESSION_SEEDS } from "../src/lib/profession-taxonomy";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${PROFESSION_SEEDS.length} professions…`);

  for (const seed of PROFESSION_SEEDS) {
    await prisma.profession.upsert({
      where: { slug: seed.slug },
      create: {
        slug: seed.slug,
        name: seed.name,
        aliases: seed.aliases,
        sectorSlug: seed.sectorSlug,
        skills: seed.skills,
        salarySlug: seed.salarySlug ?? null,
        relatedSlugs: seed.relatedSlugs,
        keywords: seed.keywords,
      },
      update: {
        name: seed.name,
        aliases: seed.aliases,
        sectorSlug: seed.sectorSlug,
        skills: seed.skills,
        salarySlug: seed.salarySlug ?? null,
        relatedSlugs: seed.relatedSlugs,
        keywords: seed.keywords,
      },
    });
  }

  const skillNames = new Set<string>();
  for (const seed of PROFESSION_SEEDS) {
    for (const skill of seed.skills) skillNames.add(skill);
  }

  for (const name of Array.from(skillNames)) {
    const slug = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    await prisma.skill.upsert({
      where: { slug },
      create: { slug, name },
      update: { name },
    });
  }

  console.log(`Done — ${PROFESSION_SEEDS.length} professions, ${skillNames.size} skills.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
