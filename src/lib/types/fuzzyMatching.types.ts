/**
 * Fuzzy Matching Type Definitions
 * Shared types for fuzzy matching operations
 * Safe for both client and server imports
 */

export type MatchingAlgorithm = 'exact' | 'levenshtein' | 'phonetic' | 'token-based' | 'ngram' | 'jaro-winkler';

export interface MatchingOptions {
  algorithms?: MatchingAlgorithm[];
  weights?: Partial<Record<MatchingAlgorithm, number>>;
  threshold?: number;
  maxResults?: number;
  limit?: number; // Alias for maxResults
  entityType?: 'sku' | 'shop' | 'brand' | 'category';
  contextHints?: string[];
  preprocessText?: boolean;
  includePartialMatches?: boolean;
}

export interface AlgorithmWeight {
  algorithm: MatchingAlgorithm;
  weight: number;
}

export interface MatchingStrategy {
  entity: 'sku' | 'shop' | 'brand' | 'category';
  algorithms: AlgorithmWeight[];
  threshold: number;
  preprocessing: PreprocessingRule[];
  contextWeights: Record<string, number>;
}

export interface PreprocessingRule {
  type: 'normalize_case' | 'remove_special_chars' | 'expand_abbreviations' | 'handle_plurals' | 'remove_stop_words';
  config?: any;
}

export interface MatchCandidate {
  id: string;
  text: string;
  entityType: 'sku' | 'shop' | 'brand' | 'category';
  metadata?: Record<string, any>;
  popularity?: number; // For weighting popular items higher
  aliases?: string[]; // Alternative names/spellings
}

export interface MatchResult {
  candidate: MatchCandidate;
  score: number;
  algorithm: MatchingAlgorithm;
  confidence: number;
  explanation?: string;
  breakdown?: Record<MatchingAlgorithm, number>;
}

export interface FuzzyMatchResponse {
  query: string;
  results: MatchResult[];
  processingTime: number;
  strategy: MatchingStrategy;
  totalCandidates: number;
}

export interface ConfidenceFactors {
  matchScore: number;         // 0-1 from fuzzy matching
  contextualClues: number;    // 0-1 from surrounding text
  popularityBoost: number;    // 0-1 based on item popularity
  algorithmConsensus: number; // 0-1 based on algorithm agreement
  editDistance: number;       // 0-1 normalized edit distance
  lengthSimilarity: number;   // 0-1 based on length similarity
}
