/**
 * Client-safe Fuzzy Matching Service
 * Uses API routes instead of direct database access
 */

// Export types from shared types file
export type {
  MatchingOptions,
  MatchResult,
  FuzzyMatchResponse,
  MatchCandidate,
  MatchingAlgorithm
} from '../types/fuzzyMatching.types';

import type { FuzzyMatchResponse, MatchingOptions } from '../types/fuzzyMatching.types';

// API Base URL - EC2 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

export class FuzzyMatchingClientService {
  /**
   * Match SKU with fuzzy logic via API route
   */
  static async matchSKU(
    query: string,
    options?: MatchingOptions
  ): Promise<FuzzyMatchResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/fuzzy-match/sku`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        threshold: options?.threshold || 0.7,
        limit: options?.limit || options?.maxResults || 10,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'SKU matching failed');
    }

    return response.json();
  }

  /**
   * Match shop with fuzzy logic via API route
   */
  static async matchShop(
    query: string,
    options?: MatchingOptions
  ): Promise<FuzzyMatchResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/fuzzy-match/shop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        threshold: options?.threshold || 0.7,
        limit: options?.limit || options?.maxResults || 10,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Shop matching failed');
    }

    return response.json();
  }

  /**
   * Match brand with fuzzy logic via API route
   */
  static async matchBrand(
    query: string,
    options?: MatchingOptions
  ): Promise<FuzzyMatchResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/fuzzy-match/brand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        threshold: options?.threshold || 0.8,
        limit: options?.limit || options?.maxResults || 10,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Brand matching failed');
    }

    return response.json();
  }

  /**
   * Batch match multiple queries against entity type
   */
  static async batchMatch(
    queries: string[],
    entityType: 'sku' | 'shop' | 'brand',
    options?: MatchingOptions
  ): Promise<FuzzyMatchResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/ai/fuzzy-match/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queries,
        entityType,
        threshold: options?.threshold,
        limit: options?.limit || options?.maxResults || 10,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Batch matching failed');
    }

    return response.json();
  }

  /**
   * Get matching statistics
   */
  static async getMatchingStats(entityType?: string): Promise<{
    totalMatches: number;
    averageConfidence: number;
    topAlgorithms: Record<string, number>;
  }> {
    const url = entityType
      ? `${API_BASE_URL}/api/ai/fuzzy-match/stats?entityType=${entityType}`
      : `${API_BASE_URL}/api/ai/fuzzy-match/stats`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get matching stats');
    }

    return response.json();
  }
}
