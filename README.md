# Letravail.ma — Job Board Web

SEO-first Moroccan job board that reads job data from the shared PostgreSQL database populated by the [letravail scraper](https://github.com/1313med/letravail). Every scraped job is published automatically — zero manual data entry.

## Architecture

```
letravail-scraper  →  WRITES to PostgreSQL
letravail-web      →  READS from PostgreSQL (this project)
```

## Tech Stack

- **Next.js 14** (App Router) with SSR/ISR
- **TypeScript**
- **Prisma** (read-only client)
- **Tailwind CSS**
- **PostgreSQL** (shared with scraper)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database `letravail` (populated by the scraper)

### Setup

```bash
# Clone and install
cd letravail-web
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string to the `letravail` database |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (e.g. `https://letravail.ma`) |
| `REVALIDATE_SECONDS` | ISR revalidation interval (default: `3600`) |
| `REVALIDATE_SECRET` | Optional secret for on-demand revalidation webhook |

## URL Structure

| Path | Description |
|------|-------------|
| `/` | Home — hero search, top cities, latest jobs |
| `/emplois` | All jobs (paginated, filterable) |
| `/emplois/{city-slug}` | Jobs in a city (e.g. `/emplois/casablanca`) |
| `/emploi/{job-slug}` | Single job detail with JSON-LD |
| `/entreprise/{company-slug}` | All jobs from one employer |

## ISR & Freshness

Pages use `revalidate = 3600` (1 hour). New jobs from the scraper appear within 1 hour without a full rebuild.

### On-demand revalidation (optional)

After a scrape run, trigger instant cache refresh:

```bash
curl -X POST https://letravail.ma/api/revalidate \
  -H "Authorization: Bearer YOUR_REVALIDATE_SECRET"
```

## SEO Features

- Server-rendered HTML (SSR/ISR)
- `sitemap.xml` — all jobs, cities (≥5 jobs), companies
- `robots.txt`
- Canonical URLs on every page
- Unique metadata (title, description, Open Graph, Twitter)
- `hreflang="fr-MA"`
- JobPosting JSON-LD on every job page
- BreadcrumbList JSON-LD
- City pages with `noindex` when < 5 jobs

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`)
4. Deploy

### Railway / Docker

```bash
npm run build
npm start
```

Use a read-only PostgreSQL user for production:

```sql
CREATE USER letravail_read WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE letravail TO letravail_read;
GRANT USAGE ON SCHEMA public TO letravail_read;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO letravail_read;
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── emplois/              # Job listings
│   ├── emploi/[slug]/        # Job detail
│   ├── entreprise/[slug]/    # Company page
│   ├── sitemap.ts            # Dynamic sitemap
│   ├── robots.ts             # robots.txt
│   └── api/revalidate/       # On-demand ISR
├── components/               # UI components
└── lib/
    ├── db.ts                 # Prisma client
    ├── queries.ts            # Database queries
    ├── seo.ts                # Metadata & JSON-LD helpers
    ├── cities.ts             # City intro content
    └── utils.ts              # Formatting utilities
```

## Related

- **Scraper**: [github.com/1313med/letravail](https://github.com/1313med/letravail)
- **Domain**: [letravail.ma](https://letravail.ma)

## License

Private — All rights reserved.
