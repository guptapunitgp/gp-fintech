import { env } from '../config/env.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';

export class OpenAiQuotaError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OpenAiQuotaError';
    this.code = 'insufficient_quota';
  }
}

function extractOutputText(payload) {
  if (payload.output_text) {
    return payload.output_text.trim();
  }

  if (!Array.isArray(payload.output)) {
    return '';
  }

  return payload.output
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text)
    .join('\n')
    .trim();
}

export function isOpenAiConfigured() {
  return Boolean(env.openAiApiKey);
}

export async function createAiTextResponse({ systemPrompt, userPrompt }) {
  if (!env.openAiApiKey) {
    throw new Error('OpenAI is not configured on the server.');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openAiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openAiModel,
      reasoning: { effort: 'minimal' },
      max_output_tokens: 450,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemPrompt }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: userPrompt }],
        },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorCode = payload.error?.code || '';
    const errorMessage = payload.error?.message || 'OpenAI request failed.';

    if (
      response.status === 429 &&
      (errorCode === 'insufficient_quota' ||
        /exceeded your current quota/i.test(errorMessage))
    ) {
      throw new OpenAiQuotaError(
        'OpenAI API quota is exhausted. Add billing or increase the project spend limit to re-enable live AI responses.',
      );
    }

    throw new Error(errorMessage);
  }

  const text = extractOutputText(payload);

  if (!text) {
    throw new Error('OpenAI returned an empty response.');
  }

  return {
    text,
    model: payload.model || env.openAiModel,
  };
}
