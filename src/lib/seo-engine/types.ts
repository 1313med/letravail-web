export type PageType = "city" | "landing" | "salary" | "company" | "job";

export type IndexStatus = "index" | "noindex";

export type RiskLevel = "low" | "medium" | "high";

export type RiskLabel = "SAFE" | "WARNING" | "DANGEROUS";

export interface IndexationRow {
  pageType: PageType;
  label: string;
  url: string;
  indexStatus: IndexStatus;
  jobCount: number;
  hasSalaryData: boolean;
  qualityScore: number;
  riskLevel: RiskLevel;
  isThin: boolean;
}

export interface IndexationReport {
  rows: IndexationRow[];
  summary: {
    total: number;
    indexed: number;
    noindexed: number;
    thin: number;
    highRisk: number;
  };
  generatedAt: string;
}

export interface GoogleJobsHealth {
  totalJobPages: number;
  validSchemaPct: number;
  missingBaseSalaryPct: number;
  estimatedSalaryPct: number;
  expiredStillIndexed: number;
  errorsByCategory: {
    category: string;
    severity: "critical" | "warning" | "healthy";
    count: number;
    pct: number;
  }[];
  sampledJobs: number;
}

export interface SalaryRoleCoverage {
  roleSlug: string;
  roleTitle: string;
  observationCount: number;
  indexStatus: IndexStatus;
  readiness: "READY FOR INDEX" | "NOT READY (needs ≥5 observations)";
  trend: "up" | "down" | "stable";
  trendDelta: number;
  url: string;
}

export interface SalaryCityCoverage {
  citySlug: string;
  observationCount: number;
  roleCount: number;
}

export interface SalaryCoverageMatrix {
  byRole: SalaryRoleCoverage[];
  byCity: SalaryCityCoverage[];
  indexableCount: number;
  nonIndexableCount: number;
  totalObservations: number;
}

export interface SeoRiskItem {
  pageType: PageType;
  label: string;
  url: string;
  riskScore: number;
  label_: RiskLabel;
  signals: {
    duplicateContent: number;
    thinContent: number;
    missingSchema: number;
    lowJobCount: number;
    missingSalary: number;
    orphanPage: number;
  };
}

export interface SeoRiskReport {
  items: SeoRiskItem[];
  summary: {
    safe: number;
    warning: number;
    dangerous: number;
    avgRiskScore: number;
  };
  generatedAt: string;
}

export interface PageQualityBreakdown {
  pageType: PageType | "landing";
  totalPages: number;
  indexedPages: number;
  noindexedPages: number;
  avgQualityScore: number;
}

export interface PageQualityStats {
  breakdown: PageQualityBreakdown[];
  generatedAt: string;
}

export interface SeoActionResult {
  ok: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export type OpportunityType =
  | "CITY_PAGE"
  | "SALARY_PAGE"
  | "PROFESSION_PAGE"
  | "LINKING"
  | "RANKING";

export type OpportunityPriority = "HIGH" | "MEDIUM" | "LOW";

export interface SeoOpportunity {
  type: OpportunityType;
  priority: OpportunityPriority;
  reason: string;
  estimatedTrafficGain: number;
  requiredAction: string;
  targetPath?: string;
  targetLabel?: string;
  metadata?: Record<string, unknown>;
}

export interface OpportunitiesReport {
  opportunities: SeoOpportunity[];
  quickWins: SeoOpportunity[];
  highPotential: SeoOpportunity[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    totalEstimatedGain: number;
  };
  generatedAt: string;
}

export interface PageScoreBreakdown {
  pagePath: string;
  pageType: PageType;
  label: string;
  pageScore: number;
  indexationScore: number;
  internalLinksScore: number;
  schemaScore: number;
  contentDepthScore: number;
  trafficScore: number;
}

export interface GscPageInsight {
  pagePath: string;
  pageType: PageType;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  performanceScore: number;
  insight: "underperforming" | "high_potential" | "metadata_gap" | "healthy";
}

export interface GscInsightsReport {
  configured: boolean;
  lastIngestedAt: string | null;
  topQueries: {
    query: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }[];
  underperforming: GscPageInsight[];
  highPotential: GscPageInsight[];
  metadataGaps: GscPageInsight[];
  ctrGaps: { query: string; impressions: number; ctr: number; expectedCtr: number }[];
  generatedAt: string;
}

export interface GrowthForecastItem {
  action: string;
  priority: OpportunityPriority;
  estimatedTrafficGain: number;
  effort: "low" | "medium" | "high";
}

export interface GrowthEngineBundle {
  opportunities: OpportunitiesReport;
  pageScores: PageScoreBreakdown[];
  gsc: GscInsightsReport;
  forecast: GrowthForecastItem[];
  recentActionLogs: {
    action: string;
    status: string;
    message: string;
    createdAt: string;
  }[];
  intelligence: SeoIntelligenceBundle;
  generatedAt: string;
}

export type KeywordIntent =
  | "CITY"
  | "SALARY"
  | "COMPANY"
  | "PROFESSION"
  | "GENERAL";

export interface KeywordOpportunity {
  keyword: string;
  intent: KeywordIntent;
  mappedPage: string | null;
  impressions: number;
  position: number;
  opportunityScore: number;
  recommendedAction: string;
  source: "gsc" | "db";
}

export interface KeywordCluster {
  intent: KeywordIntent;
  count: number;
  unmapped: number;
  opportunityZone: number;
  topKeywords: KeywordOpportunity[];
}

export interface KeywordIntelligenceReport {
  opportunities: KeywordOpportunity[];
  clusters: KeywordCluster[];
  missingLandingPages: KeywordOpportunity[];
  seoOpportunityZone: KeywordOpportunity[];
  pageIndexCount: number;
  summary: {
    totalKeywords: number;
    mapped: number;
    unmapped: number;
    highOpportunity: number;
  };
  generatedAt: string;
}

export type RankingIssue =
  | "LOW_CTR"
  | "LOW_POSITION"
  | "HIGH_IMPRESSIONS_LOW_CLICKS"
  | "RANKING_DECLINE";

export interface RankingRecommendation {
  page: string;
  pageType: PageType;
  issue: RankingIssue;
  recommendation: string;
  estimatedGain: number;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  actions: ("metadata" | "internal_links" | "content" | "revalidate")[];
}

export interface RankingFeedbackReport {
  pagePerformance: {
    pagePath: string;
    pageType: PageType;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
    performanceScore: number;
  }[];
  underperforming: RankingRecommendation[];
  quickWins: RankingRecommendation[];
  recommendations: RankingRecommendation[];
  metadataUpdates: { page: string; suggestedTitle: string; suggestedDescription: string }[];
  summary: {
    totalPages: number;
    underperforming: number;
    quickWins: number;
    totalEstimatedGain: number;
  };
  generatedAt: string;
}

export type CompetitorName = "ReKrute" | "Emploi.ma" | "Indeed Morocco";

export type CompetitorGapType =
  | "MISSING_PAGE"
  | "RANKING_LOSS"
  | "CONTENT_WEAKNESS";

export type SerpOpportunityClass = "EASY_WIN" | "HIGH_VALUE" | "STRATEGIC";

export interface CompetitorGap {
  keyword: string;
  competitor: CompetitorName;
  theirPosition: number | null;
  ourPosition: number | null;
  gapType: CompetitorGapType;
  priority: OpportunityPriority;
  serpClass: SerpOpportunityClass;
  recommendedPage: string | null;
  reason: string;
}

export interface CompetitorStructureGap {
  pageType: "city" | "salary" | "profession" | "company";
  ourCount: number;
  competitorStrength: CompetitorName;
  gapDescription: string;
  priority: OpportunityPriority;
}

export interface CompetitorIntelligenceReport {
  gaps: CompetitorGap[];
  structureGaps: CompetitorStructureGap[];
  summary: {
    totalGaps: number;
    highPriority: number;
    missingPages: number;
    rankingLosses: number;
  };
  dataNote: string;
  generatedAt: string;
}

export type ContentPageType = "CITY" | "SALARY" | "COMPANY" | "PROFESSION";

export type ContentBlockType = "SUMMARY" | "STATS" | "TRENDS" | "FAQ";

export interface ContentBlock {
  type: ContentBlockType;
  title: string;
  data: Record<string, unknown>;
}

export interface GeneratedPageContent {
  pageType: ContentPageType;
  pagePath: string;
  label: string;
  blocks: ContentBlock[];
  dataSource: string;
  generatedAt: string;
}

export interface ContentGenerationReport {
  samples: GeneratedPageContent[];
  availablePages: { pageType: ContentPageType; count: number }[];
  generatedAt: string;
}

export interface SeoIntelligenceBundle {
  keywords: KeywordIntelligenceReport;
  ranking: RankingFeedbackReport;
  competitors: CompetitorIntelligenceReport;
  content: ContentGenerationReport;
  generatedAt: string;
}
