export type {
  GoogleJobsHealth,
  GrowthEngineBundle,
  GrowthForecastItem,
  GrowthOrchestratorReport,
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
  CompetitorSerpLayer,
  ContentGenerationReport,
  GeneratedPageContent,
  ContentBlock,
  SeoIntelligenceBundle,
  SeoAutopilotReport,
  SeoHealthScore,
  QuickWinItem,
  AutopilotActionItem,
  AutopilotActionType,
  DemandIntelligenceReport,
  OrchestratorPriorityItem,
  GraphEntityType,
  PageGraphContext,
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
  executeAutopilotAction,
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
  buildGrowthOrchestrator,
} from "./growth";

export {
  computePageScore,
  computeSeoHealthScore,
  computePagePerformanceScore,
  expectedCtrForPosition,
  estimateTrafficGainFromGsc,
  confidenceFromSignals,
} from "./page-scoring";

export {
  buildJobInternalLinks,
  detectMissingLinkTypes,
  matchSalaryRole,
  estimateTrafficGain,
  discoverCityPageLinks,
  buildInternalLinkAutopilotBatch,
  getPageGraphContext,
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

export {
  getCompetitorIntelligenceReport,
  getCompetitorSerpLayer,
  ingestSerpProviderRecords,
} from "./competitor-intelligence";

export {
  getContentGenerationReport,
  generateCityPageContent,
  generateSalaryPageContent,
  generateCompanyPageContent,
} from "./content-generation-engine";

export { getSeoAutopilotReport } from "./autopilot";

export { getDemandIntelligenceReport } from "./demand-intelligence";
