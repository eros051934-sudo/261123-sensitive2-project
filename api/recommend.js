import { AppError, errorResponse, jsonResponse } from '../lib/errors.js';
import { validateRequest } from '../lib/validate.js';
import { recommendActivities } from '../lib/recommend-activities.js';
import { mockRecommend } from '../lib/mock.js';

export function isMockMode() {
  return process.env.MOCK_AI === 'true' && process.env.VERCEL_ENV !== 'production';
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return errorResponse('METHOD_NOT_ALLOWED');
    if (!(request.headers.get('content-type') ?? '').includes('application/json')) return errorResponse('INVALID_REQUEST');

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('INVALID_REQUEST');
    }

    const check = validateRequest(body);
    if (!check.ok) return errorResponse(check.code);

    const mock = isMockMode();
    try {
      const result = mock ? await mockRecommend(check.input) : await recommendActivities(check.input);
      return jsonResponse(200, { ok: true, result, meta: { generatedAt: new Date().toISOString(), mock } });
    } catch (error) {
      const code = error instanceof AppError ? error.code : 'INTERNAL_ERROR';
      const detail = error instanceof AppError ? error.detail : (error?.name ?? 'UnknownError');
      console.error(`[recommend] ${code} ${detail}`); // 답변 내용 기록 금지
      return errorResponse(code);
    }
  },
};
