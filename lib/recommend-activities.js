import OpenAI from 'openai';
import { AppError } from './errors.js';
import { normalizeAiResult } from './validate.js';
import { INSTRUCTIONS, RESPONSE_SCHEMA, buildInput } from './prompt.js';

export const DEFAULT_MODEL = 'gpt-6-luna';
const OPENAI_TIMEOUT_MS = 25000;
let client = null;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new AppError('SERVER_CONFIG_ERROR', 'OPENAI_API_KEY missing');
  if (!client) client = new OpenAI({ apiKey, timeout: OPENAI_TIMEOUT_MS, maxRetries: 0 });
  return client;
}

export async function recommendActivities(input) {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  let response;
  try {
    response = await openai.responses.create({
      model,
      instructions: INSTRUCTIONS,
      input: buildInput(input),
      reasoning: { effort: 'low' },
      text: { format: { type: 'json_schema', name: 'activity_recommendation', strict: true, schema: RESPONSE_SCHEMA } },
      store: false,
    });
  } catch (error) {
    throw toAppError(error);
  }

  if (response.status !== 'completed') throw new AppError('AI_RESPONSE_INVALID', `status=${response.status}`);
  if (!response.output_text) throw new AppError('AI_RESPONSE_INVALID', 'empty output');

  let parsed;
  try { parsed = JSON.parse(response.output_text); } catch { throw new AppError('AI_RESPONSE_INVALID', 'json parse failed'); }

  const result = normalizeAiResult(parsed, input.previous);
  if (!result) throw new AppError('AI_RESPONSE_INVALID', 'normalize failed');
  return result;
}

function toAppError(error) {
  if (error instanceof OpenAI.APIConnectionTimeoutError) return new AppError('AI_TIMEOUT', 'openai timeout');
  if (error instanceof OpenAI.APIConnectionError) return new AppError('AI_SERVICE_UNAVAILABLE', 'openai connection');
  if (error instanceof OpenAI.APIError) {
    const s = error.status;
    const detail = `openai status=${s} code=${error.code ?? '-'}`;
    if (s === 401 || s === 403 || s === 404) return new AppError('SERVER_CONFIG_ERROR', detail);
    if (s === 429) return new AppError(error.code === 'insufficient_quota' ? 'AI_QUOTA_EXCEEDED' : 'RATE_LIMITED', detail);
    if (typeof s === 'number' && s >= 500) return new AppError('AI_SERVICE_UNAVAILABLE', detail);
    return new AppError('INTERNAL_ERROR', detail);
  }
  return new AppError('INTERNAL_ERROR', error?.name ?? 'UnknownError');
}
