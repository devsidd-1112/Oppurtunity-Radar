import { geminiResponseSchema, type GeminiResponse } from '@opportunity-radar/shared';

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

export class GeminiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

/**
 * Make a Phase 0 test request to Gemini API
 * Returns a simple structured response for integration testing
 */
export async function makeGeminiTestRequest(
  config: GeminiConfig
): Promise<GeminiResponse> {
  const { apiKey, model } = config;

  if (!apiKey) {
    throw new GeminiError('GEMINI_API_KEY is not configured');
  }

  if (!model) {
    throw new GeminiError('GEMINI_MODEL is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: 'Please respond with a JSON object containing: status="ok" and message="Phase 0 integration test successful"',
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new GeminiError(
        `Gemini API request failed: ${response.status} ${response.statusText}`,
        response.status,
        errorText
      );
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    // Extract text from Gemini response structure
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new GeminiError('No candidates in Gemini response');
    }

    const content = candidates[0].content;
    if (!content || !content.parts || content.parts.length === 0) {
      throw new GeminiError('No content parts in Gemini response');
    }

    const textContent = content.parts[0].text;
    if (!textContent) {
      throw new GeminiError('No text content in Gemini response');
    }

    // Parse JSON response
    let parsed: unknown;
    try {
      parsed = JSON.parse(textContent);
    } catch (error) {
      throw new GeminiError('Failed to parse Gemini JSON response', undefined, error);
    }

    // Validate with Zod
    const validationResult = geminiResponseSchema.safeParse(parsed);
    if (!validationResult.success) {
      throw new GeminiError(
        'Gemini response does not match expected schema',
        undefined,
        validationResult.error
      );
    }

    return validationResult.data;
  } catch (error) {
    if (error instanceof GeminiError) {
      throw error;
    }

    // Handle network errors and other fetch failures
    throw new GeminiError('Failed to connect to Gemini API', undefined, error);
  }
}
