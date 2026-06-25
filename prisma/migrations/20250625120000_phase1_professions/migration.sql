-- Phase 1: Company enrichment + profession taxonomy
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT;

CREATE TABLE IF NOT EXISTS "professions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sectorSlug" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "salarySlug" TEXT,
    "relatedSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "professions_slug_key" ON "professions"("slug");
CREATE INDEX IF NOT EXISTS "professions_sectorSlug_idx" ON "professions"("sectorSlug");
CREATE INDEX IF NOT EXISTS "professions_salarySlug_idx" ON "professions"("salarySlug");

CREATE TABLE IF NOT EXISTS "skills" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "skills_slug_key" ON "skills"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "skills_name_key" ON "skills"("name");
