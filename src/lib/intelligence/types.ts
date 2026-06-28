export type TimeRange = "today" | "week" | "month" | "quarter" | "year";

export type TrendPoint = {
  date: string;
  value: number;
  label?: string;
};

export type KpiMetric = {
  key: string;
  label: string;
  value: number | string;
  delta?: number | null;
  deltaLabel?: string;
  format?: "number" | "percent" | "score" | "duration";
  tone?: "neutral" | "good" | "warn" | "bad";
};

export type SourceRow = {
  id: string;
  sourceName: string;
  companyName: string;
  category: string;
  status: string;
  activeJobs: number;
  jobsDiscovered: number;
  lastCrawlAt: string | null;
  nextCrawlAt: string | null;
  intelligenceScore: number | null;
  freshnessScore: number | null;
  avgDescriptionLength: number | null;
  failureRate: number | null;
  duplicateRate: number | null;
  priorityScore: number | null;
  atsPlatform: string | null;
  crawlStrategy: string | null;
  errorCount: number;
};

export type AtsRow = {
  id: string;
  companyName: string;
  sourceName: string | null;
  atsPlatform: string;
  confidence: number;
  crawlStrategy: string;
  apiEndpoints: string[];
  jsRenderingRequired: boolean;
  onboardingStatus: string;
  probedAt: string;
  priority: number | null;
  health: "ready" | "investigate" | "unknown";
  robotsAllowed: boolean;
  authRequired: boolean;
};

export type CrawlActivityRow = {
  id: string;
  source: string;
  category: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  jobsFound: number;
  jobsInserted: number;
  jobsUpdated: number;
  duplicates: number;
  errorMessage: string | null;
};

export type CompanyIntelligenceRow = {
  id: string;
  name: string;
  slug: string;
  activeJobs: number;
  historicalJobs: number;
  qualityScore: number | null;
  lastCrawlAt: string | null;
  avgDescriptionLength: number | null;
  skillDensity: number | null;
  experienceDensity: number | null;
  hiringTrend: number | null;
  headquartersCity: string | null;
  industry: string | null;
  sector: string | null;
  careerPageUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
};

export type ValidationIssue = {
  id: string;
  type: string;
  severity: "error" | "warning";
  source: string | null;
  company: string | null;
  title: string | null;
  message: string;
  count: number;
};

export type CoverageSegment = {
  key: string;
  label: string;
  captured: number;
  estimated?: number | null;
  coveragePct: number;
};

export type QualityDimension = {
  key: string;
  label: string;
  score: number;
  coverage: number;
  trend: TrendPoint[];
  status: "healthy" | "attention" | "critical";
};

export type ReportPeriod = {
  range: TimeRange;
  start: Date;
  end: Date;
};
