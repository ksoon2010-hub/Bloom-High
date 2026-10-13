export class ApiResponseError extends Error {
  requiresSignIn: boolean;
  constructor(message: string, requiresSignIn = false) { super(message); this.requiresSignIn = requiresSignIn; }
}
export async function readApiResponse<T>(response: Response): Promise<T> {
  const isJson = /application\/(?:[\w.+-]*\+)?json\b/i.test(response.headers.get('content-type') || '');
  const needsLogin = response.status === 401 || response.status === 403 || (response.redirected && !isJson);
  if (needsLogin) throw new ApiResponseError('로그인 연결이 만료되었어요. 다시 로그인한 뒤 시도해 주세요.', true);
  if (!isJson) throw new ApiResponseError('회원 데이터를 받지 못했어요. 잠시 후 다시 불러오거나 앱을 다시 열어 주세요.');
  let value: T & {error?: string};
  try { value = await response.json() as T & {error?: string}; }
  catch { throw new ApiResponseError('서버 응답을 읽지 못했어요. 잠시 후 다시 시도해 주세요.'); }
  if (!response.ok) throw new ApiResponseError(typeof value?.error === 'string' ? value.error : '요청을 처리하지 못했어요. 다시 시도해 주세요.');
  return value;
}
