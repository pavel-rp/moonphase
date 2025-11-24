/**
 * Frontend data fetching wrapper for AI analysis.
 * Provides a clean interface for UI components to request AI analysis
 * with proper typing and error handling.
 */

const DEFAULT_TIMEOUT_MS = 30_000; // 30 seconds for AI analysis
const API_BASE_URL = '/api/analysis';

/**
 * Error class for AI analysis API errors.
 */
export class AiAnalysisError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AiAnalysisError';
  }
}

/**
 * Response shape for AI analysis API.
 */
export interface AiAnalysisResponse {
  analysis: string;
}

/**
 * Validates that a symbol is a non-empty string.
 * @param symbol - The symbol to validate.
 * @throws {AiAnalysisError} If the symbol is invalid.
 */
function validateSymbol(symbol: string): void {
  if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
    throw new AiAnalysisError('Symbol is required and must be a non-empty string');
  }
}

/**
 * Builds the API URL for analysis requests.
 * @param symbol - The cryptocurrency symbol.
 * @param stream - Whether to request streaming response.
 * @returns The complete URL.
 */
function buildAnalysisUrl(symbol: string, stream = false): URL {
  const url = new URL(
    API_BASE_URL,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  );
  url.searchParams.set('symbol', symbol.trim().toUpperCase());
  if (stream) {
    url.searchParams.set('stream', 'true');
  }
  return url;
}

/**
 * Creates an AbortController with a timeout.
 * @param timeoutMs - Timeout in milliseconds.
 * @returns Object containing the controller and timeout ID.
 */
function createTimeoutController(timeoutMs: number): {
  controller: AbortController;
  timeoutId: NodeJS.Timeout;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
}

/**
 * Extracts a user-friendly error message from an error response.
 * @param response - The fetch response.
 * @param symbol - The symbol being analyzed (for context).
 * @param defaultMessage - Default error message if parsing fails.
 * @returns Promise resolving to the error message.
 */
async function extractErrorMessage(
  response: Response,
  symbol: string,
  defaultMessage: string,
): Promise<string> {
  try {
    const errorData = await response.json().catch(() => null);
    if (errorData?.error) {
      return errorData.error;
    }
  } catch {
    // Use status-based messages if JSON parsing fails
  }

  if (response.status === 502) {
    return 'AI analysis service is temporarily unavailable. Please try again later.';
  }
  if (response.status === 404) {
    return `Analysis not found for symbol "${symbol}".`;
  }
  if (response.status >= 500) {
    return 'AI analysis service encountered an error. Please try again later.';
  }
  if (response.status === 429) {
    return 'Too many requests. Please wait a moment before trying again.';
  }

  return defaultMessage;
}

/**
 * Handles non-OK HTTP responses by extracting error messages.
 * @param response - The fetch response.
 * @param symbol - The symbol being analyzed.
 * @param defaultMessage - Default error message.
 * @throws {AiAnalysisError} Always throws with appropriate error message.
 */
async function handleErrorResponse(
  response: Response,
  symbol: string,
  defaultMessage: string,
): Promise<never> {
  const errorMessage = await extractErrorMessage(response, symbol, defaultMessage);
  throw new AiAnalysisError(errorMessage, response.status);
}

/**
 * Handles fetch errors and converts them to AiAnalysisError.
 * @param error - The caught error.
 * @param context - Context message for unexpected errors.
 * @throws {AiAnalysisError} Always throws with appropriate error message.
 */
function handleFetchError(error: unknown, context: string): never {
  if (error instanceof AiAnalysisError) {
    throw error;
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      throw new AiAnalysisError(
        'Request timed out. The analysis is taking longer than expected. Please try again.',
        408,
        error,
      );
    }

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new AiAnalysisError(
        'Network error. Please check your connection and try again.',
        0,
        error,
      );
    }
  }

  throw new AiAnalysisError(`An unexpected error occurred while ${context}.`, undefined, error);
}

/**
 * Fetch AI analysis for a given symbol.
 * @param symbol - The cryptocurrency symbol to analyze (e.g., 'BTC', 'ETH').
 * @returns Promise resolving to the analysis text.
 * @throws {AiAnalysisError} If the request fails or times out.
 */
export async function fetchAiAnalysis(symbol: string): Promise<string> {
  validateSymbol(symbol);

  const url = buildAnalysisUrl(symbol);
  const { controller, timeoutId } = createTimeoutController(DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await handleErrorResponse(response, symbol, 'Failed to fetch AI analysis');
    }

    const data: AiAnalysisResponse = await response.json();

    if (!data.analysis || typeof data.analysis !== 'string') {
      throw new AiAnalysisError(
        'Invalid response format: missing or invalid analysis field',
        response.status,
      );
    }

    return data.analysis;
  } catch (error) {
    clearTimeout(timeoutId);
    handleFetchError(error, 'fetching AI analysis');
  }
}

/**
 * Fetch AI analysis stream for a given symbol.
 * @param symbol - The cryptocurrency symbol to analyze (e.g., 'BTC', 'ETH').
 * @returns Promise resolving to a ReadableStream of analysis chunks.
 * @throws {AiAnalysisError} If the request fails or times out.
 */
export async function fetchAiAnalysisStream(symbol: string): Promise<ReadableStream> {
  validateSymbol(symbol);

  const url = buildAnalysisUrl(symbol, true);
  const { controller, timeoutId } = createTimeoutController(DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await handleErrorResponse(response, symbol, 'Failed to fetch AI analysis stream');
    }

    if (!response.body) {
      throw new AiAnalysisError('Response body is null', response.status);
    }

    return response.body;
  } catch (error) {
    clearTimeout(timeoutId);
    handleFetchError(error, 'fetching AI analysis stream');
  }
}

