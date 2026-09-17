/**
 * 로그인이 없으므로 브라우저마다 익명 ID(번호표)를 하나 만들어 대화를 구분한다.
 * localStorage 에 저장되므로 같은 브라우저에서는 계속 같은 값이 나온다.
 * 브라우저에서만 호출할 것 (서버에는 localStorage 가 없다).
 */
export const USER_KEY_STORAGE = "melting.userKey";

export function getUserKey(): string {
  try {
    const saved = localStorage.getItem(USER_KEY_STORAGE);
    if (saved) return saved;
    const fresh = crypto.randomUUID();
    localStorage.setItem(USER_KEY_STORAGE, fresh);
    return fresh;
  } catch {
    return "anonymous";
  }
}
