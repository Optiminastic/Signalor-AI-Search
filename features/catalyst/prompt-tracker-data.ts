/** A source cited in an engine's answer. */
export interface Citation {
  url: string
  domain: string
  isBrand: boolean
  isCompetitor: boolean
  /** Page title, when the engine returned one. */
  title: string
  /** Excerpt of the cited page, when available. */
  snippet: string
  /** Rank within the answer's citation list; 0 when unknown. */
  position: number
}

/** One engine's answer, adapted for the expandable result panel. */
export interface PromptEngineResult {
  id: number
  /** Raw engine key (chatgpt, gemini, …) — feeds the logo lookup. */
  engine: string
  engineLabel: string
  mentioned: boolean
  /** positive | neutral | negative | '' when unknown. */
  sentiment: string
  position: number | null
  snippet: string
  checkedAt: string
  /** Model's confidence in the mention/sentiment call, 0-1; null when unscored. */
  confidence: number | null
  citations: Citation[]
  /** True when the brand's own domain was cited as a source (real citation, not
   *  just a name-mention). Drives the "Cited" state. */
  brandCited: boolean
}

/** UI shape a PromptRow renders — adapted from the API by `usePrompts`. */
export interface TrackedPrompt {
  id: number
  prompt: string
  /** True when the user added it (vs auto-generated during onboarding). */
  isCustom: boolean
  intent: string
  promptType: string
  score: number
  /** Share of runs that mentioned the brand, 0-100. */
  visibility: number
  avgPosition: number | null
  cited: boolean
  mentions: number
  runs: number
  /** Aggregate tone across engine answers: positive | neutral | negative. */
  sentiment: string
  /** When the prompt was first tracked; '' when the API omits it. */
  createdAt: string
  /** The weighted inputs behind `score`, 0-100 each. Drives the factor radar. */
  factors: PromptScoreFactors
  results: PromptEngineResult[]
}

/** The five weighted components of a prompt's score, each 0-100. */
export interface PromptScoreFactors {
  authority: number
  contentQuality: number
  structural: number
  semantic: number
  thirdParty: number
}
