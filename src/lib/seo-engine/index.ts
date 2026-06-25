export type {
  GoogleJobsHealth,
  GrowthEngineBundle,
  GrowthForecastItem,
  GscInsightsReport,
  GscPageInsight,
  IndexationReport,
  IndexationRow,
  IndexStatus,
  OpportunitiesReport,
  PageQualityBreakdown,
  PageQualityStats,
  PageScoreBreakdown,
  PageType,
  RiskLabel,
  RiskLevel,
  SalaryCityCoverage,
  SalaryCoverageMatrix,
  SalaryRoleCoverage,
  SeoActionResult,
  SeoOpportunity,
  SeoRiskItem,
  SeoRiskReport,
  KeywordIntent,
  KeywordOpportunity,
  KeywordCluster,
  KeywordIntelligenceReport,
  RankingFeedbackReport,
  RankingRecommendation,
  RankingIssue,
  CompetitorIntelligenceReport,
  CompetitorGap,
  CompetitorStructureGap,
  ContentGenerationReport,
  GeneratedPageContent,
  ContentBlock,
  SeoIntelligenceBundle,
} from "./types";

export {
  getDashboardBundle,
  getGoogleJobsHealth,
  getIndexationReport,
  getPageQualityStats,
  getSalaryCoverageMatrix,
  getSeoRiskReport,
} from "./reports";

export {
  recomputeIndexationRules,
  rebuildSitemap,
  recalculateSalaryObservations,
  runSeoRiskScan,
  validateJobPostingSchema,
} from "./actions";

export {
  generateMissingCityPages,
  generateMissingProfessionPages,
  generateSalaryPages,
  fixInternalLinks,
  rebuildSitemaps,
  enrichJobPostingSchema,
  fixThinPages,
  runFullGrowthPipeline,
} from "./actions-engine";

export { getOpportunitiesReport, buildGrowthForecast } from "./opportunities";

export {
  isGscConfigured,
  ingestGscData,
  syncGscFromApi,
  fetchGscAnalytics,
  getGscInsightsReport,
  getPagePerformanceMap,
  classifyPagePath,
} from "./gsc-engine";

export {
  getGrowthEngineBundle,
  getSeoIntelligenceBundle,
  computePageScores,
} from "./growth";

export {
  computePageScore,
  computePagePerformanceScore,
  expectedCtrForPosition,
} from "./page-scoring";

export {
  buildJobInternalLinks,
  detectMissingLinkTypes,
  matchSalaryRole,
  estimateTrafficGain,
} from "./internal-links";

export {
  getKeywordIntelligenceReport,
  buildPageIndex,
  mapKeywordToPage,
  classifyKeywordIntent,
} from "./keyword-intelligence";

export {
  getRankingFeedbackReport,
  getRankingFeedbackActions,
  getInternalLinkRecommendationsForPage,
} from "./ranking-feedback-engine";

export { getCompetitorIntelligenceReport } from "./competitor-intelligence";

export {
  getContentGenerationReport,
  generateCityPageContent,
  generateSalaryPageContent,
  generateCompanyPageContent,
} from "./content-generation-engine";
