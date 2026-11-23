// 서버 오류 코드·상태·문구·다시 시도 여부 정의 (09-error-handling.md 정본)
export const ERRORS = {
  METHOD_NOT_ALLOWED: { status: 405, retryable: false, message: '지원하지 않는 요청 방식이에요.' },
  INVALID_REQUEST: { status: 400, retryable: false, message: '요청 형식이 올바르지 않아요. 페이지를 새로고침한 뒤 다시 시도해 주세요.' },
  INVALID_ANSWERS: { status: 400, retryable: false, message: '답하지 않은 질문이 있어요. 처음부터 다시 답해 주세요.' },
  NOTE_TOO_LONG: { status: 400, retryable: false, message: '자유 입력은 300자까지 쓸 수 있어요.' },
  RATE_LIMITED: { status: 429, retryable: true, message: '요청이 많아 잠시 처리할 수 없어요. 잠시 후 다시 시도해 주세요.' },
  SERVER_CONFIG_ERROR: { status: 500, retryable: false, message: '서비스 설정에 문제가 있어요. 관리자에게 문의해 주세요.' },
  INTERNAL_ERROR: { status: 500, retryable: true, message: '알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해 주세요.' },
  AI_RESPONSE_INVALID: { status: 502, retryable: true, message: '추천을 제대로 만들지 못했어요. 다시 시도해 주세요.' },
  AI_SERVICE_UNAVAILABLE: { status: 503, retryable: true, message: 'AI 서비스에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.' },
  AI_QUOTA_EXCEEDED: { status: 503, retryable: false, message: '서비스 사용 한도를 초과했어요. 관리자에게 문의해 주세요.' },
  AI_TIMEOUT: { status: 504, retryable: true, message: 'AI 응답이 너무 오래 걸려요. 다시 시도해 주세요.' },
};

// detail 은 서버 로그용 짧은 설명. 사용자 답변을 절대 넣지 않음 (AGENTS.md X-07)
export class AppError extends Error {
  constructor(code, detail = '') {
    super(code);
    this.name = 'AppError';
    this.code = ERRORS[code] ? code : 'INTERNAL_ERROR';
    this.detail = detail;
  }
}

export function jsonResponse(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

export function errorResponse(code) {
  const finalCode = ERRORS[code] ? code : 'INTERNAL_ERROR';
  const { status, message, retryable } = ERRORS[finalCode];
  const extra = finalCode === 'METHOD_NOT_ALLOWED' ? { Allow: 'POST' } : {};
  return jsonResponse(status, { ok: false, error: { code: finalCode, message, retryable } }, extra);
}
