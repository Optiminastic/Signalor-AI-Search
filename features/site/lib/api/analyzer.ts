import axios from 'axios'
import { z } from 'zod'

import { apiClient, apiClientLong } from './client'

// ─── Shared enums ───────────────────────────────────────────────────────────

const engineSchema = z.enum(['chatgpt', 'claude', 'gemini', 'perplexity', 'google', 'bing'])
const sentimentSchema = z.enum(['positive', 'neutral', 'negative'])

// ─── Run shapes ─────────────────────────────────────────────────────────────

const startAnalysisResponseSchema = z.object({
  id: z.number(),
  slug: z.string(),
  url: z.string(),
  status: z.string(),
  message: z.string(),
})

const runStatusSchema = z.object({
  id: z.number(),
  status: z.string(),
  progress: z.number(),
  composite_score: z.number().nullable(),
})

const pageScoreSchema = z.object({
  id: z.number(),
  url: z.string(),
  content_score: z.number(),
  content_details: z.record(z.string(), z.unknown()),
  schema_score: z.number(),
  schema_details: z.record(z.string(), z.unknown()),
  eeat_score: z.number(),
  eeat_details: z.record(z.string(), z.unknown()),
  technical_score: z.number(),
  technical_details: z.record(z.string(), z.unknown()),
  entity_score: z.number(),
  entity_details: z.record(z.string(), z.unknown()),
  ai_visibility_score: z.number(),
  ai_visibility_details: z.record(z.string(), z.unknown()),
  composite_score: z.number(),
})

const competitorSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  industry: z.string(),
  tier: z.string().optional(),
  target_market: z.string().optional(),
  geography: z.string().optional(),
  pricing_model: z.string().optional(),
  positioning: z.string().optional(),
  composite_score: z.number().nullable(),
  scored: z.boolean(),
  page_score: pageScoreSchema.nullable(),
})

const platformStepInfoSchema = z.object({
  detail: z.string(),
  code: z.string().optional(),
})

const recommendationStepSchema = z.object({
  n: z.number(),
  title: z.string(),
  detail: z.string(),
  code: z.string().optional(),
  xp: z.number(),
  shopify: platformStepInfoSchema.optional(),
  wordpress: platformStepInfoSchema.optional(),
})

const recommendationSchema = z.object({
  id: z.number(),
  pillar: z.string(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  title: z.string(),
  description: z.string(),
  action: z.string(),
  impact_estimate: z.string().optional().default(''),
  category: z.string(),
  can_auto_fix: z.boolean(),
  code_fixable: z.boolean().optional().default(false),
  finding_code: z.string().optional().default(''),
  steps: z.array(recommendationStepSchema),
  xp_reward: z.number(),
  difficulty: z.string(),
  estimated_minutes: z.number(),
  source: z.enum(['analyzer', 'ai_insight']).optional().default('analyzer'),
})

const aiProbeSchema = z.object({
  id: z.number(),
  prompt_used: z.string(),
  llm_response: z.string(),
  brand_mentioned: z.boolean(),
  confidence: z.number(),
})

const analysisRunListSchema = z.object({
  id: z.number(),
  slug: z.string(),
  url: z.string(),
  country: z.string(),
  run_type: z.string(),
  status: z.string(),
  progress: z.number(),
  composite_score: z.number().nullable(),
  created_at: z.string(),
})

const llmLogSchema = z.object({
  model: z.string(),
  model_id: z.string(),
  purpose: z.string(),
  prompt: z.string(),
  response: z.string(),
  status: z.enum(['success', 'error']),
  duration_ms: z.number(),
})

const brandVisibilitySchema = z.object({
  google_score: z.number(),
  google_details: z.record(z.string(), z.unknown()),
  reddit_score: z.number(),
  reddit_details: z.record(z.string(), z.unknown()),
  web_mentions_score: z.number(),
  web_mentions_details: z.record(z.string(), z.unknown()),
  social_presence_details: z.record(z.string(), z.unknown()).optional(),
  ai_brand_facts: z
    .object({
      facts: z.array(z.string()).optional(),
      summary: z.string().optional(),
      caveat: z.string().optional(),
      method: z.string().optional(),
      error: z.string().optional(),
    })
    .optional(),
  overall_score: z.number(),
})

const analysisRunDetailSchema = z.object({
  id: z.number(),
  slug: z.string(),
  url: z.string(),
  brand_name: z.string(),
  display_brand_name: z.string().optional(),
  country: z.string(),
  email: z.string(),
  run_type: z.string(),
  status: z.string(),
  progress: z.number(),
  composite_score: z.number().nullable(),
  error_message: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  page_scores: z.array(pageScoreSchema),
  competitors: z.array(competitorSchema),
  recommendations: z.array(recommendationSchema),
  ai_probes: z.array(aiProbeSchema),
  brand_visibility: brandVisibilitySchema.nullable(),
  organization_id: z.number().nullish(),
})

// ─── Prompt tracking ────────────────────────────────────────────────────────

const promptSearchIntentSchema = z.enum(['brand', 'informational', 'transactional'])
const promptSurfaceTypeSchema = z.enum(['organic', 'branded', 'competitive'])

const promptCitationSchema = z.object({
  id: z.number(),
  url: z.string(),
  domain: z.string(),
  title: z.string(),
  snippet: z.string(),
  position: z.number(),
  is_brand: z.boolean(),
  is_competitor: z.boolean(),
})

const promptResultSchema = z.object({
  id: z.number(),
  engine: engineSchema,
  response_text: z.string(),
  brand_mentioned: z.boolean(),
  sentiment: sentimentSchema,
  confidence: z.number(),
  rank_position: z.number(),
  checked_at: z.string(),
  citations: z.array(promptCitationSchema).optional(),
})

const citationDomainSchema = z.object({
  domain: z.string(),
  total: z.number(),
  is_brand: z.boolean(),
  is_competitor: z.boolean(),
  by_engine: z.record(engineSchema, z.number()),
  sample_url: z.string(),
})

const citedPageSchema = z.object({
  url: z.string(),
  title: z.string(),
  mentions: z.number(),
  domain: z.string().optional(),
})

const citationSourcesResponseSchema = z.object({
  total_citations: z.number(),
  brand_citations: z.number(),
  competitor_citations: z.number(),
  domains: z.array(citationDomainSchema),
  your_pages: z.array(citedPageSchema),
  rival_pages: z.array(citedPageSchema),
})

const promptTrackSchema = z.object({
  id: z.number(),
  prompt_text: z.string(),
  is_custom: z.boolean(),
  intent: promptSearchIntentSchema.optional(),
  prompt_type: promptSurfaceTypeSchema.optional(),
  score: z.number(),
  created_at: z.string(),
  results: z.array(promptResultSchema),
  visibility_pct: z.number(),
  avg_position: z.number(),
  sentiment_label: z.string(),
  ranking_label: z.string(),
  total_runs: z.number(),
  mentions: z.number(),
  factor_authority: z.number(),
  factor_content_quality: z.number(),
  factor_structural: z.number(),
  factor_semantic: z.number(),
  factor_third_party: z.number(),
})

const competitorMentionSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
})

const competitorPromptSchema = promptTrackSchema.extend({
  mentioned_competitors_detail: z.array(competitorMentionSchema).optional().default([]),
})

const shareOfVoiceItemSchema = z.object({
  engine: engineSchema,
  total: z.number(),
  mentioned: z.number(),
  sov_pct: z.number(),
})

const citationTrendPointSchema = z.object({
  week_start: z.string(),
  engine: engineSchema,
  rate_pct: z.number(),
})

// ─── Dashboard v2 endpoints ──────────────────────────────────────────────────

const visibilitySeriesSchema = z.object({
  points: z.array(z.object({ date: z.string(), score: z.number() })).default([]),
  current: z.number().default(0),
  previous: z.number().default(0),
  delta_pct: z.number().default(0),
  direction: z.enum(['up', 'down']).default('up'),
})

const rankingRowSchema = z.object({
  rank: z.number(),
  company: z.string(),
  visibility: z.number(),
  sentiment: z.number().nullable().optional(),
  avg_position: z.string().default(''),
  is_you: z.boolean().default(false),
  color: z.string().default('#f97316'),
  domain: z.string().default(''),
  engines: z.array(z.string()).default([]),
})

const rankingsResponseSchema = z.object({
  your_rank: z.number().default(0),
  rows: z.array(rankingRowSchema).default([]),
})

const sovCompetitorsSchema = z.object({
  value: z.number().default(0),
  delta_pct: z.number().default(0),
  direction: z.enum(['up', 'down']).default('up'),
  competitors: z.array(z.object({ name: z.string(), value: z.number() })).default([]),
})

const topSourceRowSchema = z.object({
  name: z.string(),
  engine: z.string().default(''),
  mentions: z.number().default(0),
  sentiment: z.number().nullable().optional(),
  impact: z.enum(['high', 'medium', 'low']).default('medium'),
  spark: z.array(z.number()).default([]),
})

const topSourcesResponseSchema = z.object({
  sources: z.array(topSourceRowSchema).default([]),
})

const aiRecommendationEnginePointSchema = z.object({
  engine: engineSchema,
  total: z.number(),
  mentioned: z.number(),
  recommended: z.number(),
  cited: z.number(),
  recommendation_pct: z.number(),
})

const aiRecommendationSampleSchema = z.object({
  engine: engineSchema,
  prompt: z.string(),
  quote: z.string(),
  sentiment: sentimentSchema,
})

const aiRecommendationSummarySchema = z.object({
  total: z.number(),
  mentioned: z.number(),
  recommended: z.number(),
  cited: z.number(),
  mention_pct: z.number(),
  recommendation_pct: z.number(),
  citation_pct: z.number(),
  per_engine: z.array(aiRecommendationEnginePointSchema),
  samples: z.array(aiRecommendationSampleSchema),
})

// ─── Backlinks ──────────────────────────────────────────────────────────────

const backlinkRowSchema = z.object({
  domain: z.string(),
  is_brand: z.boolean(),
  is_competitor: z.boolean(),
  citation_count: z.number(),
  referring_domains: z.number(),
  backlinks: z.number(),
  rank: z.number(),
  has_data: z.boolean(),
})

const promptBacklinksResponseSchema = z.object({
  brand_domain: z.string(),
  rows: z.array(backlinkRowSchema),
  api_used: z.boolean(),
  api_error: z.string().nullable().optional(),
  fetched_at: z.string().optional(),
})

const opportunityCategorySchema = z.enum([
  'directory',
  'review',
  'press',
  'forum',
  'resource',
  'other',
])
const opportunityStatusSchema = z.enum(['suggested', 'submitted', 'live', 'dismissed'])

const backlinkOpportunitySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  rationale: z.string(),
  submit_url: z.string(),
  category: opportunityCategorySchema,
  priority: z.number(),
  status: opportunityStatusSchema,
  submitted_at: z.string().nullable(),
  live_url: z.string(),
  created_at: z.string().nullable(),
})

const opportunitiesResponseSchema = z.object({
  rows: z.array(backlinkOpportunitySchema),
  has_generated: z.boolean().optional(),
})

const siteOpportunitySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  rationale: z.string(),
  submit_url: z.string(),
  category: opportunityCategorySchema,
  priority: z.number(),
})

const siteOpportunitiesResponseSchema = z.object({
  rows: z.array(siteOpportunitySchema),
  has_generated: z.boolean(),
})

// ─── Brand kit / domain analytics ───────────────────────────────────────────

const brandKitSchema = z.object({
  name: z.string(),
  url: z.string(),
  tagline: z.string(),
  short_description: z.string(),
  long_description: z.string(),
  categories: z.array(z.string()),
  keywords: z.array(z.string()),
  location: z.string(),
  contact_email: z.string(),
})

const brandKitWrapSchema = z.object({ kit: brandKitSchema })

const domainAnalyticsOverviewSchema = z.object({
  organic_keywords: z.number(),
  organic_traffic: z.number(),
  organic_value_usd: z.number(),
  paid_keywords: z.number(),
  paid_traffic: z.number(),
  paid_value_usd: z.number(),
})

const domainAnalyticsKeywordSchema = z.object({
  keyword: z.string(),
  position: z.number(),
  search_volume: z.number(),
  etv: z.number(),
  url: z.string(),
})

const domainAnalyticsPageSchema = z.object({
  url: z.string(),
  organic_traffic: z.number(),
  organic_keywords: z.number(),
  value_usd: z.number(),
})

const domainAnalyticsCountrySchema = z.object({
  organic_traffic: z.number(),
  organic_keywords: z.number(),
  organic_value_usd: z.number(),
})

const domainAnalyticsSnapshotSchema = z.object({
  domain: z.string(),
  overview: domainAnalyticsOverviewSchema,
  top_keywords: z.array(domainAnalyticsKeywordSchema),
  top_pages: z.array(domainAnalyticsPageSchema),
  geo_distribution: z.record(z.string(), domainAnalyticsCountrySchema),
  synced_at: z.string().nullable(),
  cached: z.boolean(),
})

// ─── Misc ───────────────────────────────────────────────────────────────────

const recheckAllResponseSchema = z.object({
  status: z.string().optional(),
  count: z.number(),
})

const scoreHistoryPointSchema = z.object({
  date: z.string(),
  composite_score: z.number(),
  slug: z.string(),
  organization_id: z.number().nullish(),
})

const scheduleFrequencySchema = z.enum(['once', 'weekly', 'monthly'])

const scheduledAnalysisSchema = z.object({
  id: z.number(),
  email: z.string(),
  url: z.string(),
  brand_name: z.string(),
  frequency: scheduleFrequencySchema,
  next_run_at: z.string(),
  last_run_at: z.string().nullable(),
  last_run_slug: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
})

// ─── Auto-Fix ───────────────────────────────────────────────────────────────

const autoFixResultSchema = z.object({
  recommendation_id: z.number(),
  status: z.enum(['success', 'partial', 'failed', 'verified', 'manual']),
  message: z.string(),
  fix_type: z.string(),
  generated_content: z.string().nullable().optional(),
})

const fixPreviewSchema = z.object({
  status: z.enum(['preview', 'error', 'manual']),
  fix_type: z.string(),
  recommendation_id: z.number(),
  recommendation_title: z.string(),
  original: z.string(),
  preview: z.string(),
  full_content: z.string(),
  target_post_id: z.number().optional(),
  target_type: z.string().optional(),
  message: z.string().optional(),
})

// ─── Sitemap audit ──────────────────────────────────────────────────────────

const sitemapAuditStatusSchema = z.enum(['queued', 'running', 'complete', 'failed'])
const sitemapPageStateSchema = z.enum(['crawled', 'redirect', 'queued', 'failed'])
const sitemapPageSeveritySchema = z.enum(['ok', 'warn', 'fail'])

const sitemapAuditFindingSchema = z.object({
  code: z.string(),
  label: z.string(),
  severity: sitemapPageSeveritySchema,
})

const sitemapAuditSummarySchema = z.object({
  id: z.number(),
  status: sitemapAuditStatusSchema,
  progress: z.number(),
  sitemap_url: z.string(),
  crawl_limit: z.number(),
  total_urls: z.number(),
  indexed_count: z.number(),
  redirect_count: z.number(),
  queued_count: z.number(),
  failed_count: z.number(),
  avg_lcp_ms: z.number().nullable(),
  avg_fcp_ms: z.number().nullable(),
  avg_ttfb_ms: z.number().nullable(),
  avg_ai_score: z.number().nullable(),
  truncated: z.boolean(),
  discovered_url_count: z.number(),
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
  created_at: z.string(),
  error_message: z.string(),
})

const sitemapAuditPageSchema = z.object({
  id: z.number(),
  url: z.string(),
  path: z.string(),
  final_url: z.string(),
  state: sitemapPageStateSchema,
  status_code: z.number(),
  redirect_count: z.number(),
  title: z.string(),
  meta_description: z.string(),
  h1_count: z.number(),
  word_count: z.number(),
  text_ratio: z.number(),
  content_length: z.number(),
  lcp_ms: z.number().nullable(),
  fcp_ms: z.number().nullable(),
  ttfb_ms: z.number().nullable(),
  server_ms: z.number().nullable(),
  resource_count: z.number(),
  resource_bytes: z.number(),
  link_count_total: z.number(),
  link_count_internal: z.number(),
  link_count_external: z.number(),
  jsonld_count: z.number(),
  has_canonical: z.boolean(),
  has_og: z.boolean(),
  is_noindex: z.boolean(),
  robots_allows_gptbot: z.boolean(),
  robots_allows_claudebot: z.boolean(),
  robots_allows_perplexitybot: z.boolean(),
  ai_score: z.number(),
  severity: sitemapPageSeveritySchema,
  findings: z.array(sitemapAuditFindingSchema),
  error_message: z.string(),
  checked_at: z.string(),
})

const sitemapAuditResponseSchema = z.object({
  audit: sitemapAuditSummarySchema.nullable(),
  pages: z.array(sitemapAuditPageSchema),
  total: z.number(),
  page: z.number().optional(),
  page_size: z.number().optional(),
})

// ─── Agent log ──────────────────────────────────────────────────────────────

const agentLogEntrySchema = z.object({
  id: z.number(),
  bot_name: z.string(),
  path: z.string(),
  status_code: z.number(),
  ts: z.string(),
  source: z.enum(['cloudflare', 'vercel', 'manual']),
})

const agentLogIntegrationSchema = z.object({
  name: z.string(),
  key: z.enum(['cloudflare', 'vercel']),
  connected: z.boolean(),
  status: z.enum(['coming_soon', 'ready', 'error']),
})

const agentLogResponseSchema = z.object({
  entries: z.array(agentLogEntrySchema),
  integrations: z.array(agentLogIntegrationSchema),
})

// ─── Rank tracker ───────────────────────────────────────────────────────────

const rankAuditStatusSchema = z.enum(['queued', 'running', 'complete', 'failed'])
const rankSurfaceSchema = z.enum(['google', 'reddit', 'quora', 'ai'])
const rankQueryStatusSchema = z.enum(['queued', 'done', 'failed'])
const rankSentimentSchema = z.enum(['positive', 'neutral', 'negative'])

const rankAuditSummarySchema = z.object({
  id: z.number(),
  status: rankAuditStatusSchema,
  progress: z.number(),
  total_queries: z.number(),
  queries_done: z.number(),
  avg_brand_mentions: z.number(),
  avg_top3_brand_rate: z.number(),
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
  created_at: z.string(),
  error_message: z.string(),
})

const rankResultSchema = z.object({
  id: z.number(),
  surface: rankSurfaceSchema,
  position: z.number(),
  url: z.string(),
  domain: z.string(),
  title: z.string(),
  snippet: z.string(),
  engine: z.string(),
  response_text: z.string(),
  sentiment: rankSentimentSchema,
  is_brand_mentioned: z.boolean(),
  competitors_mentioned: z.array(z.string()),
  upvotes: z.number().nullable(),
  subreddit: z.string(),
  checked_at: z.string().nullable(),
})

const rankQuerySchema = z.object({
  id: z.number(),
  prompt_text: z.string(),
  rank: z.number(),
  brand_mention_count: z.number(),
  status: rankQueryStatusSchema,
  error_message: z.string(),
  results: z.array(rankResultSchema),
})

const rankAuditResponseSchema = z.object({
  audit: rankAuditSummarySchema.nullable(),
  queries: z.array(rankQuerySchema),
})

// ─── Backlink marketplace ───────────────────────────────────────────────────

const backlinkLinkTypeSchema = z.enum([
  'guest_post',
  'niche_edit',
  'sponsored',
  'citation',
  'other',
])

const backlinkOrderStatusSchema = z.enum([
  'draft',
  'pending_payment',
  'queued',
  'in_progress',
  'delivered',
  'rejected',
  'refunded',
  'cancelled',
])

const backlinkProductSchema = z.object({
  id: z.number(),
  provider: z.string(),
  provider_name: z.string(),
  sku: z.string(),
  domain: z.string(),
  title: z.string(),
  link_type: backlinkLinkTypeSchema,
  domain_authority: z.number().nullable(),
  domain_rank: z.number().nullable(),
  monthly_traffic: z.number().nullable(),
  niche_tags: z.array(z.string()),
  language: z.string(),
  country: z.string(),
  do_follow: z.boolean(),
  price_cents: z.number(),
  currency: z.string(),
  lead_time_days: z.number(),
  extras: z.record(z.string(), z.unknown()).optional(),
})

const backlinkProviderSummarySchema = z.object({
  slug: z.string(),
  display_name: z.string(),
})

const backlinkOrderSchema = z.object({
  id: z.number(),
  status: backlinkOrderStatusSchema,
  provider: z.string(),
  provider_name: z.string(),
  domain: z.string(),
  title: z.string(),
  target_url: z.string(),
  anchor_text: z.string(),
  price_cents: z.number(),
  currency: z.string(),
  proof_url: z.string(),
  error_message: z.string(),
  prompt_track_id: z.number().nullable(),
  created_at: z.string().nullable(),
  ordered_at: z.string().nullable(),
  delivered_at: z.string().nullable(),
})

const backlinkCatalogResponseSchema = z.object({
  providers: z.array(backlinkProviderSummarySchema),
  products: z.array(backlinkProductSchema),
})

const backlinkOrdersListResponseSchema = z.object({
  orders: z.array(backlinkOrderSchema),
})

// ─── Prompt schema generator ────────────────────────────────────────────────

const promptSchemaTypeSchema = z.enum(['faq', 'article', 'person', 'organization', 'answer'])

const promptSchemaResponseSchema = z.object({
  schema_type: promptSchemaTypeSchema,
  output: z.string(),
  explanation: z.string(),
  cached: z.boolean().optional(),
})

const promptSchemaArtifactSchema = z.object({
  schema_type: promptSchemaTypeSchema,
  output: z.string(),
  explanation: z.string(),
  updated_at: z.string().nullable(),
})

const promptSchemaArtifactsListSchema = z.object({
  artifacts: z.array(promptSchemaArtifactSchema),
})

// ─── Types (inferred from schemas) ──────────────────────────────────────────

export type Engine = z.infer<typeof engineSchema>
export type Sentiment = z.infer<typeof sentimentSchema>
export type PageScore = z.infer<typeof pageScoreSchema>
export type Competitor = z.infer<typeof competitorSchema>
export type PlatformStepInfo = z.infer<typeof platformStepInfoSchema>
export type RecommendationStep = z.infer<typeof recommendationStepSchema>
export type Recommendation = z.infer<typeof recommendationSchema>
export type AIProbe = z.infer<typeof aiProbeSchema>
export type AnalysisRunList = z.infer<typeof analysisRunListSchema>
export type LLMLog = z.infer<typeof llmLogSchema>
export type BrandVisibility = z.infer<typeof brandVisibilitySchema>
export type AnalysisRunDetail = z.infer<typeof analysisRunDetailSchema>
export type StartAnalysisResponse = z.infer<typeof startAnalysisResponseSchema>
export type RunStatus = z.infer<typeof runStatusSchema>
export type PromptCitation = z.infer<typeof promptCitationSchema>
export type PromptResult = z.infer<typeof promptResultSchema>
export type CitationDomain = z.infer<typeof citationDomainSchema>
export type CitedPage = z.infer<typeof citedPageSchema>
export type CitationSourcesResponse = z.infer<typeof citationSourcesResponseSchema>
export type PromptSearchIntent = z.infer<typeof promptSearchIntentSchema>
export type PromptSurfaceType = z.infer<typeof promptSurfaceTypeSchema>
export type PromptTrack = z.infer<typeof promptTrackSchema>
export type CompetitorMention = z.infer<typeof competitorMentionSchema>
export type CompetitorPrompt = z.infer<typeof competitorPromptSchema>
export type ShareOfVoiceItem = z.infer<typeof shareOfVoiceItemSchema>
export type CitationTrendPoint = z.infer<typeof citationTrendPointSchema>
export type VisibilitySeries = z.infer<typeof visibilitySeriesSchema>
export type RankingRow = z.infer<typeof rankingRowSchema>
export type RankingsResponse = z.infer<typeof rankingsResponseSchema>
export type SovCompetitors = z.infer<typeof sovCompetitorsSchema>
export type TopSourceRow = z.infer<typeof topSourceRowSchema>
export type TopSourcesResponse = z.infer<typeof topSourcesResponseSchema>
export type AiRecommendationEnginePoint = z.infer<typeof aiRecommendationEnginePointSchema>
export type AiRecommendationSample = z.infer<typeof aiRecommendationSampleSchema>
export type AiRecommendationSummary = z.infer<typeof aiRecommendationSummarySchema>
export type BacklinkRow = z.infer<typeof backlinkRowSchema>
export type PromptBacklinksResponse = z.infer<typeof promptBacklinksResponseSchema>
export type OpportunityCategory = z.infer<typeof opportunityCategorySchema>
export type OpportunityStatus = z.infer<typeof opportunityStatusSchema>
export type BacklinkOpportunity = z.infer<typeof backlinkOpportunitySchema>
export type OpportunitiesResponse = z.infer<typeof opportunitiesResponseSchema>
export type SiteOpportunity = z.infer<typeof siteOpportunitySchema>
export type SiteOpportunitiesResponse = z.infer<typeof siteOpportunitiesResponseSchema>
export type BrandKit = z.infer<typeof brandKitSchema>
export type DomainAnalyticsOverview = z.infer<typeof domainAnalyticsOverviewSchema>
export type DomainAnalyticsKeyword = z.infer<typeof domainAnalyticsKeywordSchema>
export type DomainAnalyticsPage = z.infer<typeof domainAnalyticsPageSchema>
export type DomainAnalyticsCountry = z.infer<typeof domainAnalyticsCountrySchema>
export type DomainAnalyticsSnapshot = z.infer<typeof domainAnalyticsSnapshotSchema>
export type ScoreHistoryPoint = z.infer<typeof scoreHistoryPointSchema>
export type ScheduleFrequency = z.infer<typeof scheduleFrequencySchema>
export type ScheduledAnalysis = z.infer<typeof scheduledAnalysisSchema>
export type AutoFixResult = z.infer<typeof autoFixResultSchema>
export type FixPreview = z.infer<typeof fixPreviewSchema>
export type SitemapAuditStatus = z.infer<typeof sitemapAuditStatusSchema>
export type SitemapPageState = z.infer<typeof sitemapPageStateSchema>
export type SitemapPageSeverity = z.infer<typeof sitemapPageSeveritySchema>
export type SitemapAuditFinding = z.infer<typeof sitemapAuditFindingSchema>
export type SitemapAuditSummary = z.infer<typeof sitemapAuditSummarySchema>
export type SitemapAuditPage = z.infer<typeof sitemapAuditPageSchema>
export type SitemapAuditResponse = z.infer<typeof sitemapAuditResponseSchema>
export type AgentLogEntry = z.infer<typeof agentLogEntrySchema>
export type AgentLogIntegration = z.infer<typeof agentLogIntegrationSchema>
export type AgentLogResponse = z.infer<typeof agentLogResponseSchema>
export type RankAuditStatus = z.infer<typeof rankAuditStatusSchema>
export type RankSurface = z.infer<typeof rankSurfaceSchema>
export type RankQueryStatus = z.infer<typeof rankQueryStatusSchema>
export type RankSentiment = z.infer<typeof rankSentimentSchema>
export type RankAuditSummary = z.infer<typeof rankAuditSummarySchema>
export type RankResult = z.infer<typeof rankResultSchema>
export type RankQuery = z.infer<typeof rankQuerySchema>
export type RankAuditResponse = z.infer<typeof rankAuditResponseSchema>
export type BacklinkLinkType = z.infer<typeof backlinkLinkTypeSchema>
export type BacklinkOrderStatus = z.infer<typeof backlinkOrderStatusSchema>
export type BacklinkProduct = z.infer<typeof backlinkProductSchema>
export type BacklinkProviderSummary = z.infer<typeof backlinkProviderSummarySchema>
export type BacklinkOrder = z.infer<typeof backlinkOrderSchema>
export type PromptSchemaType = z.infer<typeof promptSchemaTypeSchema>
export type PromptSchemaResponse = z.infer<typeof promptSchemaResponseSchema>
export type PromptSchemaArtifact = z.infer<typeof promptSchemaArtifactSchema>

// Display label maps — used by UI components.
export const PROMPT_INTENT_LABEL: Record<PromptSearchIntent, string> = {
  brand: 'Brand',
  informational: 'Information',
  transactional: 'Transactional',
}

export const PROMPT_SURFACE_TYPE_LABEL: Record<PromptSurfaceType, string> = {
  organic: 'Organic',
  branded: 'Brand',
  competitive: 'Competition',
}

// AiEngineKey is referenced by some Rank UI components — kept as a literal
// union since it has no backend schema attached.
export type AiEngineKey = 'gpt' | 'claude' | 'gemini' | 'perplexity'

// Request payload types — not part of any response, so they remain
// hand-written interfaces (the BE accepts/discards fields, no validation needed).

export interface StartAnalysisPayload {
  url: string
  run_type: 'single_page' | 'full_site'
  email?: string
  brand_name?: string
  country?: string
  org_id?: number
  /** Backend enforces org ownership, URL match, brand, and non-empty prompts (onboarding / post-checkout). */
  verify_org_workspace?: boolean
  prompts?: string[]
}

export interface SitemapAuditQuery {
  state?: SitemapPageState
  severity?: SitemapPageSeverity
  q?: string
  sort?: string
  page?: number
  page_size?: number
}

export interface RankAuditQuery {
  surface?: RankSurface
  query_id?: number
  q?: string
  only_brand?: boolean
}

// ─── Runs ───────────────────────────────────────────────────────────────────

export async function startAnalysis(
  payload: StartAnalysisPayload,
  onboardingToken?: string,
): Promise<StartAnalysisResponse> {
  const headers = onboardingToken ? { 'X-Onboarding-Token': onboardingToken } : undefined
  const { data } = await apiClient.post('/api/analyzer/analyze/', payload, { headers })
  return startAnalysisResponseSchema.parse(data)
}

export async function getRunStatus(runId: number): Promise<RunStatus> {
  const { data } = await apiClient.get(`/api/analyzer/runs/${runId}/status/`)
  return runStatusSchema.parse(data)
}

export async function getRunDetail(runId: number): Promise<AnalysisRunDetail> {
  const { data } = await apiClientLong.get(`/api/analyzer/runs/${runId}/`)
  return analysisRunDetailSchema.parse(data)
}

export async function getRunBySlug(slug: string): Promise<AnalysisRunDetail> {
  const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/`)
  return analysisRunDetailSchema.parse(data)
}

export async function getRunList(email: string, orgId?: number): Promise<AnalysisRunList[]> {
  const params: Record<string, string | number> = orgId ? { org_id: orgId } : { email }
  const { data } = await apiClient.get('/api/analyzer/runs/', { params })
  return z.array(analysisRunListSchema).parse(data)
}

export function getExportPDFUrl(runId: number): string {
  return `/api/analyzer/runs/${runId}/export-pdf/`
}

// ─── Prompt tracking ────────────────────────────────────────────────────────

export async function getPromptTracks(slug: string): Promise<PromptTrack[]> {
  const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/prompts/`)
  return z.array(promptTrackSchema).parse(data)
}

export async function addPromptTrack(slug: string, prompt_text: string): Promise<PromptTrack> {
  const { data } = await apiClient.post(`/api/analyzer/runs/s/${slug}/prompts/`, { prompt_text })
  return promptTrackSchema.parse(data)
}

export async function getShareOfVoice(slug: string): Promise<ShareOfVoiceItem[]> {
  const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/share-of-voice/`)
  return z.array(shareOfVoiceItemSchema).parse(data)
}

export async function getCitationTrend(slug: string): Promise<CitationTrendPoint[]> {
  const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/citation-trend/`)
  return z.array(citationTrendPointSchema).parse(data)
}

export async function getCitationSources(slug: string): Promise<CitationSourcesResponse> {
  const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/citations/`)
  return citationSourcesResponseSchema.parse(data)
}

export async function getAiRecommendationSummary(slug: string): Promise<AiRecommendationSummary> {
  const { data } = await apiClientLong.get(
    `/api/analyzer/runs/s/${slug}/ai-recommendation-summary/`,
  )
  return aiRecommendationSummarySchema.parse(data)
}

// ─── Dashboard v2 endpoints ──────────────────────────────────────────────────

export async function getVisibilitySeries(slug: string, days = 30): Promise<VisibilitySeries> {
  const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/visibility-series/`, {
    params: { days },
  })
  return visibilitySeriesSchema.parse(data)
}

export async function getRankings(slug: string): Promise<RankingsResponse> {
  const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/rankings/`)
  return rankingsResponseSchema.parse(data)
}

export async function getShareOfVoiceCompetitors(slug: string): Promise<SovCompetitors> {
  const { data } = await apiClientLong.get(
    `/api/analyzer/runs/s/${slug}/share-of-voice-competitors/`,
  )
  return sovCompetitorsSchema.parse(data)
}

export async function getTopSources(slug: string): Promise<TopSourcesResponse> {
  const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/top-sources/`)
  return topSourcesResponseSchema.parse(data)
}

// ─── Overview AI insights (analyzer + GA4 + GSC) ──────────────────────────────

const overviewInsightSchema = z.object({
  title: z.string(),
  detail: z.string().default(''),
  severity: z.enum(['high', 'medium', 'low']).default('medium'),
  evidence: z.string().default(''),
})

const overviewTaskSchema = z.object({
  title: z.string(),
  description: z.string().default(''),
  action: z.string().default(''),
  pillar: z.string().default('technical'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  impact_estimate: z.string().default(''),
  why: z.string().default(''),
  steps: z.array(z.string()).default([]),
})

const overviewReportSchema = z.object({
  summary: z.object({
    headline: z.string().default(''),
    key_points: z.array(z.string()).default([]),
  }),
  insights: z.array(overviewInsightSchema).default([]),
  tasks: z.array(overviewTaskSchema).default([]),
  has_ga: z.boolean().default(false),
  has_gsc: z.boolean().default(false),
})

// Compact signal tiles for the Overview card (subset of build_overview_signals).
const overviewSignalsSchema = z.object({
  geo: z
    .object({ composite_score: z.number().nullable().default(null) })
    .passthrough()
    .default({ composite_score: null }),
  ga: z
    .object({
      sessions: z.number().default(0),
      organic_pct: z.number().default(0),
      sessions_trend: z.string().default('flat'),
    })
    .passthrough()
    .nullable()
    .default(null),
  gsc: z
    .object({
      clicks: z.number().default(0),
      impressions: z.number().default(0),
      ctr: z.number().default(0),
      position: z.number().default(0),
      indexed_count: z.number().optional(),
      not_indexed_count: z.number().optional(),
    })
    .passthrough()
    .nullable()
    .default(null),
  flags: z.object({ has_ga: z.boolean().default(false), has_gsc: z.boolean().default(false) }),
})

const overviewInsightsResponseSchema = z.object({
  report: overviewReportSchema.nullable(),
  generated_at: z.string().nullable().default(null),
  generating: z.boolean().default(false),
  signals_summary: overviewSignalsSchema,
})

export type OverviewInsight = z.infer<typeof overviewInsightSchema>
export type OverviewTask = z.infer<typeof overviewTaskSchema>
export type OverviewReport = z.infer<typeof overviewReportSchema>
export type OverviewSignals = z.infer<typeof overviewSignalsSchema>
export type OverviewInsightsResponse = z.infer<typeof overviewInsightsResponseSchema>

export async function getOverviewInsights(slug: string): Promise<OverviewInsightsResponse> {
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/overview-insights/`)
  return overviewInsightsResponseSchema.parse(data)
}

export async function regenerateOverviewInsights(slug: string): Promise<void> {
  await apiClient.post(`/api/analyzer/runs/s/${slug}/overview-insights/`)
}

export async function recheckPrompt(slug: string, trackId: number): Promise<void> {
  await apiClient.post(`/api/analyzer/runs/s/${slug}/prompts/${trackId}/recheck/`)
}

export async function deletePromptTrack(slug: string, trackId: number): Promise<void> {
  await apiClient.delete(`/api/analyzer/runs/s/${slug}/prompts/${trackId}/`)
}

export async function getPromptResultFull(
  slug: string,
  trackId: number,
  resultId: number,
): Promise<PromptResult> {
  const { data } = await apiClient.get(
    `/api/analyzer/runs/s/${slug}/prompts/${trackId}/results/${resultId}/`,
  )
  return promptResultSchema.parse(data)
}

// ─── Backlinks ──────────────────────────────────────────────────────────────

export async function getPromptBacklinks(
  slug: string,
  trackId: number,
): Promise<PromptBacklinksResponse> {
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/prompts/${trackId}/backlinks/`)
  return promptBacklinksResponseSchema.parse(data)
}

export async function getPromptOpportunities(
  slug: string,
  trackId: number,
): Promise<OpportunitiesResponse> {
  const { data } = await apiClient.get(
    `/api/analyzer/runs/s/${slug}/prompts/${trackId}/opportunities/`,
  )
  return opportunitiesResponseSchema.parse(data)
}

export async function regeneratePromptOpportunities(
  slug: string,
  trackId: number,
): Promise<OpportunitiesResponse> {
  const { data } = await apiClient.post(
    `/api/analyzer/runs/s/${slug}/prompts/${trackId}/opportunities/`,
    {},
    { timeout: 90_000 },
  )
  return opportunitiesResponseSchema.parse(data)
}

export async function getSiteBacklinkOpportunities(
  slug: string,
): Promise<SiteOpportunitiesResponse> {
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/backlinks/free/`, {
    timeout: 90_000,
  })
  return siteOpportunitiesResponseSchema.parse(data)
}

export async function regenerateSiteBacklinkOpportunities(
  slug: string,
): Promise<SiteOpportunitiesResponse> {
  const { data } = await apiClient.post(
    `/api/analyzer/runs/s/${slug}/backlinks/free/`,
    {},
    { timeout: 90_000 },
  )
  return siteOpportunitiesResponseSchema.parse(data)
}

export async function updateOpportunityStatus(
  slug: string,
  trackId: number,
  oppId: number,
  patch: { status?: OpportunityStatus; live_url?: string },
): Promise<BacklinkOpportunity> {
  const { data } = await apiClient.patch(
    `/api/analyzer/runs/s/${slug}/prompts/${trackId}/opportunities/${oppId}/`,
    patch,
  )
  return backlinkOpportunitySchema.parse(data)
}

export async function deleteOpportunity(
  slug: string,
  trackId: number,
  oppId: number,
): Promise<void> {
  await apiClient.delete(`/api/analyzer/runs/s/${slug}/prompts/${trackId}/opportunities/${oppId}/`)
}

// ─── Brand kit ──────────────────────────────────────────────────────────────

export async function getBrandKit(slug: string): Promise<{ kit: BrandKit }> {
  const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/brand-kit/`)
  return brandKitWrapSchema.parse(data)
}

export async function regenerateBrandKit(slug: string): Promise<{ kit: BrandKit }> {
  const { data } = await apiClientLong.post(
    `/api/analyzer/runs/s/${slug}/brand-kit/`,
    {},
    { timeout: 90_000 },
  )
  return brandKitWrapSchema.parse(data)
}

// ─── Domain analytics ───────────────────────────────────────────────────────

export async function getDomainAnalytics(slug: string): Promise<DomainAnalyticsSnapshot> {
  const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/domain-analytics/`)
  return domainAnalyticsSnapshotSchema.parse(data)
}

export async function refreshDomainAnalytics(slug: string): Promise<DomainAnalyticsSnapshot> {
  const { data } = await apiClientLong.post(
    `/api/analyzer/runs/s/${slug}/domain-analytics/`,
    {},
    { timeout: 90_000 },
  )
  return domainAnalyticsSnapshotSchema.parse(data)
}

export async function recheckAllPrompts(slug: string): Promise<{ count: number }> {
  const { data } = await apiClient.post(`/api/analyzer/runs/s/${slug}/recheck-all/`)
  const parsed = recheckAllResponseSchema.parse(data)
  return { count: parsed.count }
}

// ─── Competitor CRUD ────────────────────────────────────────────────────────

export async function addCompetitor(slug: string, name: string, url: string): Promise<Competitor> {
  const { data } = await apiClient.post(`/api/analyzer/runs/s/${slug}/competitors/`, { name, url })
  return competitorSchema.parse(data)
}

export async function updateCompetitor(
  slug: string,
  id: number,
  payload: { name?: string; url?: string },
): Promise<Competitor> {
  const { data } = await apiClient.patch(`/api/analyzer/runs/s/${slug}/competitors/${id}/`, payload)
  return competitorSchema.parse(data)
}

export async function deleteCompetitor(slug: string, id: number): Promise<void> {
  await apiClient.delete(`/api/analyzer/runs/s/${slug}/competitors/${id}/`)
}

// ─── Competitor Prompts ──────────────────────────────────────────────────────

export async function getCompetitorPrompts(slug: string): Promise<CompetitorPrompt[]> {
  try {
    const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/competitor-prompts/`)
    return z.array(competitorPromptSchema).parse(data)
  } catch (err) {
    // A 404 means competitor prompts haven't been generated yet — treat it as a
    // not-yet-ready empty state rather than a hard error (see issue #20).
    if (axios.isAxiosError(err) && err.response?.status === 404) return []
    throw err
  }
}

export async function generateCompetitorPrompts(slug: string): Promise<CompetitorPrompt[]> {
  const { data } = await apiClientLong.post(
    `/api/analyzer/runs/s/${slug}/competitor-prompts/generate/`,
    {},
  )
  return z.array(competitorPromptSchema).parse(data)
}

// ─── Score history + scheduling ─────────────────────────────────────────────

export async function getScoreHistory(email: string, orgId?: number): Promise<ScoreHistoryPoint[]> {
  const params: Record<string, string | number> = orgId ? { org_id: orgId } : { email }
  const { data } = await apiClient.get('/api/analyzer/runs/history/', { params })
  return z.array(scoreHistoryPointSchema).parse(data)
}

export async function getSchedule(email: string, orgId: number): Promise<ScheduledAnalysis | null> {
  const { data } = await apiClient.get('/api/analyzer/schedule/', {
    params: { email, org_id: orgId },
  })
  return scheduledAnalysisSchema.nullable().parse(data)
}

export async function toggleSchedule(payload: {
  email: string
  org_id: number
  url: string
  brand_name?: string
  frequency: ScheduleFrequency
  is_active: boolean
  /** ISO datetime, required when frequency="once", optional otherwise. */
  run_at?: string
}): Promise<ScheduledAnalysis> {
  const { data } = await apiClient.post('/api/analyzer/schedule/', payload)
  return scheduledAnalysisSchema.parse(data)
}

// ─── Auto-Fix ───────────────────────────────────────────────────────────────

export async function applyAutoFix(
  slug: string,
  recommendationIds: number[],
  email: string,
  orgId?: number,
): Promise<AutoFixResult[]> {
  const { data } = await apiClient.post(
    `/api/analyzer/runs/s/${slug}/auto-fix/`,
    { recommendation_ids: recommendationIds, email, org_id: orgId },
    { timeout: 120_000 },
  )
  return z.array(autoFixResultSchema).parse(data)
}

export async function getAutoFixStatus(slug: string): Promise<AutoFixResult[]> {
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/auto-fix/`)
  return z.array(autoFixResultSchema).parse(data)
}

export async function previewFix(
  slug: string,
  recommendationId: number,
  email: string,
): Promise<FixPreview> {
  const { data } = await apiClient.post(
    `/api/analyzer/runs/s/${slug}/auto-fix/preview/`,
    { recommendation_id: recommendationId, email },
    { timeout: 120_000 },
  )
  return fixPreviewSchema.parse(data)
}

export async function approveFix(
  slug: string,
  recommendationId: number,
  content: string,
  fixType: string,
): Promise<AutoFixResult> {
  const { data } = await apiClient.post(
    `/api/analyzer/runs/s/${slug}/auto-fix/approve/`,
    { recommendation_id: recommendationId, content, fix_type: fixType },
    { timeout: 30_000 },
  )
  return autoFixResultSchema.parse(data)
}

export async function verifyFix(slug: string, recommendationId: number): Promise<AutoFixResult> {
  const { data } = await apiClient.post(
    `/api/analyzer/runs/s/${slug}/auto-fix/verify/`,
    { recommendation_id: recommendationId },
    { timeout: 45_000 },
  )
  return autoFixResultSchema.parse(data)
}

// ─── Sitemap audit ──────────────────────────────────────────────────────────

export async function startSitemapAudit(slug: string): Promise<SitemapAuditSummary> {
  const { data } = await apiClient.post(
    `/api/analyzer/runs/s/${slug}/sitemap/start/`,
    {},
    { timeout: 30_000 },
  )
  return sitemapAuditSummarySchema.parse(data)
}

export async function getSitemapAudit(
  slug: string,
  query: SitemapAuditQuery = {},
): Promise<SitemapAuditResponse> {
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/sitemap/`, {
    params: query,
    timeout: 30_000,
  })
  return sitemapAuditResponseSchema.parse(data)
}

// ─── Agent log ──────────────────────────────────────────────────────────────

export async function getAgentLog(slug: string): Promise<AgentLogResponse> {
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/agent-log/`, {
    timeout: 15_000,
  })
  return agentLogResponseSchema.parse(data)
}

// ─── Rank tracker ───────────────────────────────────────────────────────────

export async function startRankAudit(slug: string): Promise<RankAuditSummary> {
  const { data } = await apiClient.post(
    `/api/analyzer/runs/s/${slug}/rank/start/`,
    {},
    { timeout: 30_000 },
  )
  return rankAuditSummarySchema.parse(data)
}

export async function getRankAudit(
  slug: string,
  query: RankAuditQuery = {},
): Promise<RankAuditResponse> {
  const params: Record<string, string | number | boolean> = {}
  if (query.surface) params.surface = query.surface
  if (query.query_id != null) params.query_id = query.query_id
  if (query.q) params.q = query.q
  if (query.only_brand) params.only_brand = '1'
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/rank/`, {
    params,
    timeout: 30_000,
  })
  return rankAuditResponseSchema.parse(data)
}

export async function refreshRankQuery(slug: string, queryId: number): Promise<RankQuery> {
  const { data } = await apiClient.post(
    `/api/analyzer/runs/s/${slug}/rank/query/${queryId}/refresh/`,
    {},
    { timeout: 30_000 },
  )
  return rankQuerySchema.parse(data)
}

export async function getPromptRank(
  slug: string,
  trackId: number,
  opts?: { refresh?: boolean },
): Promise<RankQuery> {
  // Fetches top-3 Google/Reddit/Quora ranking for the tracked prompt's exact
  // text. Backend runs the fetch synchronously the first time and caches it.
  const { data } = await apiClientLong.post(
    `/api/analyzer/runs/s/${slug}/prompts/${trackId}/rank/`,
    { refresh: opts?.refresh ? 1 : 0 },
    { timeout: 60_000 },
  )
  return rankQuerySchema.parse(data)
}

// ─── Backlink marketplace ───────────────────────────────────────────────────

export async function getBacklinkCatalog(
  slug: string,
  filters?: { link_type?: BacklinkLinkType; min_da?: number; niche?: string },
): Promise<{ providers: BacklinkProviderSummary[]; products: BacklinkProduct[] }> {
  const params: Record<string, string | number> = {}
  if (filters?.link_type) params.link_type = filters.link_type
  if (filters?.min_da) params.min_da = filters.min_da
  if (filters?.niche) params.niche = filters.niche
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/backlinks/catalog/`, {
    params,
    timeout: 30_000,
  })
  return backlinkCatalogResponseSchema.parse(data)
}

export async function listBacklinkOrders(
  slug: string,
  userEmail?: string,
): Promise<{ orders: BacklinkOrder[] }> {
  const params: Record<string, string> = {}
  if (userEmail) params.user_email = userEmail
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/backlinks/orders/`, {
    params,
  })
  return backlinkOrdersListResponseSchema.parse(data)
}

export async function placeBacklinkOrder(
  slug: string,
  body: {
    product_id: number
    target_url: string
    anchor_text: string
    user_email: string
    track_id?: number | null
    notes?: string
  },
): Promise<BacklinkOrder> {
  const { data } = await apiClient.post(`/api/analyzer/runs/s/${slug}/backlinks/orders/`, body, {
    timeout: 30_000,
  })
  return backlinkOrderSchema.parse(data)
}

export async function getBacklinkOrder(slug: string, orderId: number): Promise<BacklinkOrder> {
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/backlinks/orders/${orderId}/`)
  return backlinkOrderSchema.parse(data)
}

export async function deleteBacklinkOrder(slug: string, orderId: number): Promise<void> {
  await apiClient.delete(`/api/analyzer/runs/s/${slug}/backlinks/orders/${orderId}/`)
}

export async function confirmBacklinkOrderPayment(
  slug: string,
  orderId: number,
  paymentIntentId?: string,
): Promise<BacklinkOrder> {
  const { data } = await apiClient.post(
    `/api/analyzer/runs/s/${slug}/backlinks/orders/${orderId}/confirm-payment/`,
    { payment_intent_id: paymentIntentId ?? '' },
    { timeout: 30_000 },
  )
  return backlinkOrderSchema.parse(data)
}

// ─── Prompt schema generator ────────────────────────────────────────────────

export async function generatePromptSchema(
  slug: string,
  trackId: number,
  schemaType: PromptSchemaType,
  opts?: { force?: boolean },
): Promise<PromptSchemaResponse> {
  const { data } = await apiClientLong.post(
    `/api/analyzer/runs/s/${slug}/prompts/${trackId}/schema/`,
    { schema_type: schemaType, force: opts?.force ? true : false },
    { timeout: 60_000 },
  )
  return promptSchemaResponseSchema.parse(data)
}

export async function listPromptSchemaArtifacts(
  slug: string,
  trackId: number,
): Promise<{ artifacts: PromptSchemaArtifact[] }> {
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/prompts/${trackId}/schema/`)
  return promptSchemaArtifactsListSchema.parse(data)
}
