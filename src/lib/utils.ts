import { NEW_JOB_DAYS } from "./constants";

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? "s" : ""}`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return d.toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" });
}

export function isNewJob(createdAt: Date | string): boolean {
  const d = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NEW_JOB_DAYS);
  return d >= cutoff;
}

export function isJobExpired(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return false;
  const d = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return d < new Date();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function excerpt(text: string, maxLength = 160): string {
  return truncate(stripHtml(text), maxLength);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

export function mapContractType(contractType: string | null): string {
  if (!contractType) return "OTHER";
  const map: Record<string, string> = {
    CDI: "FULL_TIME",
    CDD: "TEMPORARY",
    Stage: "INTERN",
    Alternance: "INTERN",
    Freelance: "CONTRACTOR",
    "Temps partiel": "PART_TIME",
  };
  return map[contractType] || "OTHER";
}
