import { DEFAULT_JOB_VALID_DAYS } from "./constants";
import { resolveJobPostingSalary } from "./job-salary-schema";
import { getCompanyLogoUrl, getCompanyWebsiteUrl } from "./company-logos";
import { mapContractType } from "./utils";
import { buildCanonical } from "./seo";

export type GoogleJobsField =
  | "identifier"
  | "title"
  | "description"
  | "hiringOrganization"
  | "hiringOrganization.logo"
  | "hiringOrganization.sameAs"
  | "employmentType"
  | "jobLocation"
  | "applicantLocationRequirements"
  | "datePosted"
  | "validThrough"
  | "directApply"
  | "baseSalary"
  | "estimatedSalary"
  | "currency"
  | "occupationLocation"
  | "url";

export type FieldIssue = {
  field: GoogleJobsField;
  status: "ok" | "missing" | "weak" | "auto_fixed";
  impact: "high" | "medium" | "low";
  message: string;
};

export interface JobForCompliance {
  id?: string;
  slug: string;
  title: string;
  description: string;
  company: string;
  city: string;
  country: string;
  contractType: string | null;
  remote: boolean;
  applicationUrl: string;
  publishedAt: Date | null;
  expiresAt: Date | null;
  salary?: string | null;
  citySlug?: string | null;
  companySlug?: string | null;
  tags?: { slug: string }[];
}

export function defaultValidThrough(publishedAt: Date | null, expiresAt: Date | null): string {
  if (expiresAt) return expiresAt.toISOString();
  const base = publishedAt ?? new Date();
  const fallback = new Date(base);
  fallback.setDate(fallback.getDate() + DEFAULT_JOB_VALID_DAYS);
  return fallback.toISOString();
}

export function auditJobPostingFields(job: JobForCompliance): FieldIssue[] {
  const issues: FieldIssue[] = [];
  const salary = resolveJobPostingSalary({
    salary: job.salary ?? null,
    title: job.title,
    city: job.city,
    citySlug: job.citySlug,
    companySlug: job.companySlug,
    tags: job.tags,
    description: job.description,
  });

  issues.push({
    field: "identifier",
    status: job.slug ? "ok" : "missing",
    impact: "medium",
    message: job.slug ? "Identifiant stable via slug" : "Slug manquant",
  });

  issues.push({
    field: "title",
    status: job.title?.trim() ? "ok" : "missing",
    impact: "high",
    message: job.title ? "Titre présent" : "Titre manquant — critique Google Jobs",
  });

  const descLen = job.description?.trim().length ?? 0;
  issues.push({
    field: "description",
    status: descLen >= 100 ? "ok" : descLen > 0 ? "weak" : "missing",
    impact: "high",
    message:
      descLen >= 100
        ? `Description complète (${descLen} car.)`
        : descLen > 0
          ? `Description courte (${descLen} car.) — risque qualité`
          : "Description vide — critique",
  });

  issues.push({
    field: "hiringOrganization",
    status: job.company?.trim() ? "ok" : "missing",
    impact: "high",
    message: job.company ? `Organisation : ${job.company}` : "Nom entreprise manquant",
  });

  const logo = getCompanyLogoUrl(job.companySlug);
  issues.push({
    field: "hiringOrganization.logo",
    status: logo ? "ok" : "missing",
    impact: "low",
    message: logo ? "Logo entreprise disponible" : "Pas de logo — enrichissement possible",
  });

  const sameAs = getCompanyWebsiteUrl(job.companySlug);
  issues.push({
    field: "hiringOrganization.sameAs",
    status: sameAs ? "ok" : "missing",
    impact: "low",
    message: sameAs ? "Site officiel lié" : "sameAs non disponible",
  });

  issues.push({
    field: "employmentType",
    status: job.contractType ? "ok" : "weak",
    impact: "medium",
    message: job.contractType
      ? `Type : ${mapContractType(job.contractType)}`
      : "Type de contrat non spécifié — défaut OTHER",
  });

  issues.push({
    field: "jobLocation",
    status: job.city?.trim() ? "ok" : "missing",
    impact: "high",
    message: job.city ? `Localité : ${job.city}, MA` : "Ville manquante",
  });

  issues.push({
    field: "applicantLocationRequirements",
    status: job.remote ? (job.country === "Morocco" || !job.country ? "auto_fixed" : "ok") : "ok",
    impact: job.remote ? "medium" : "low",
    message: job.remote
      ? "Télétravail — exigence Maroc ajoutée au schéma"
      : "Sur site — non requis",
  });

  issues.push({
    field: "datePosted",
    status: job.publishedAt ? "ok" : "missing",
    impact: "high",
    message: job.publishedAt
      ? `Publié le ${job.publishedAt.toISOString().slice(0, 10)}`
      : "datePosted manquant — utilise fallback createdAt",
  });

  issues.push({
    field: "validThrough",
    status: job.expiresAt ? "ok" : "auto_fixed",
    impact: "medium",
    message: job.expiresAt
      ? `Expire le ${job.expiresAt.toISOString().slice(0, 10)}`
      : `Fallback +${DEFAULT_JOB_VALID_DAYS}j depuis publication`,
  });

  issues.push({
    field: "directApply",
    status: job.applicationUrl ? "ok" : "missing",
    impact: "high",
    message: job.applicationUrl ? "Candidature directe activée" : "URL candidature manquante",
  });

  if (salary.source === "scraped") {
    issues.push({
      field: "baseSalary",
      status: "ok",
      impact: "high",
      message: "Salaire réel (MAD) dans baseSalary",
    });
    issues.push({
      field: "estimatedSalary",
      status: "ok",
      impact: "low",
      message: "Non utilisé — baseSalary prioritaire",
    });
  } else if (salary.source === "estimated") {
    issues.push({
      field: "baseSalary",
      status: "missing",
      impact: "high",
      message: "Pas de salaire scrapé — baseSalary absent",
    });
    issues.push({
      field: "estimatedSalary",
      status: "auto_fixed",
      impact: "medium",
      message: "Estimation marché marocain dans estimatedSalary",
    });
  } else {
    issues.push({
      field: "baseSalary",
      status: "missing",
      impact: "high",
      message: "Aucun salaire — impact fort sur visibilité Google Jobs",
    });
    issues.push({
      field: "estimatedSalary",
      status: "missing",
      impact: "medium",
      message: "Aucune estimation disponible",
    });
  }

  issues.push({
    field: "currency",
    status: salary.amount ? "ok" : "missing",
    impact: "high",
    message: salary.amount ? "Devise MAD" : "Pas de montant salarial",
  });

  issues.push({
    field: "occupationLocation",
    status: "ok",
    impact: "medium",
    message: "Maroc (MA) spécifié dans occupationLocation",
  });

  issues.push({
    field: "url",
    status: job.slug ? "ok" : "missing",
    impact: "high",
    message: job.slug ? buildCanonical(`/emploi/${job.slug}`) : "URL canonique manquante",
  });

  return issues;
}

export function complianceScore(issues: FieldIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.status === "ok" || issue.status === "auto_fixed") continue;
    if (issue.impact === "high") score -= 8;
    else if (issue.impact === "medium") score -= 4;
    else score -= 2;
  }
  return Math.max(0, score);
}

export type GoogleJobsComplianceReport = {
  totalJobs: number;
  avgComplianceScore: number;
  fullyCompliant: number;
  fieldBreakdown: {
    field: GoogleJobsField;
    ok: number;
    missing: number;
    weak: number;
    autoFixed: number;
    impact: "high" | "medium" | "low";
  }[];
  topIssues: { field: GoogleJobsField; count: number; impact: string }[];
  generatedAt: string;
};

export function aggregateComplianceReport(
  audits: { slug: string; issues: FieldIssue[]; score: number }[]
): GoogleJobsComplianceReport {
  const fieldMap = new Map<
    GoogleJobsField,
    { ok: number; missing: number; weak: number; autoFixed: number; impact: "high" | "medium" | "low" }
  >();

  for (const audit of audits) {
    for (const issue of audit.issues) {
      const entry = fieldMap.get(issue.field) ?? {
        ok: 0,
        missing: 0,
        weak: 0,
        autoFixed: 0,
        impact: issue.impact,
      };
      if (issue.status === "ok") entry.ok++;
      else if (issue.status === "missing") entry.missing++;
      else if (issue.status === "weak") entry.weak++;
      else entry.autoFixed++;
      fieldMap.set(issue.field, entry);
    }
  }

  const issueCounts = new Map<GoogleJobsField, number>();
  for (const audit of audits) {
    for (const issue of audit.issues) {
      if (issue.status === "ok") continue;
      issueCounts.set(issue.field, (issueCounts.get(issue.field) ?? 0) + 1);
    }
  }

  const topIssues = Array.from(issueCounts.entries())
    .map(([field, count]) => ({
      field,
      count,
      impact: fieldMap.get(field)?.impact ?? "medium",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const avgScore =
    audits.length > 0
      ? Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length)
      : 0;

  return {
    totalJobs: audits.length,
    avgComplianceScore: avgScore,
    fullyCompliant: audits.filter((a) => a.score >= 95).length,
    fieldBreakdown: Array.from(fieldMap.entries()).map(([field, stats]) => ({
      field,
      ...stats,
    })),
    topIssues,
    generatedAt: new Date().toISOString(),
  };
}
