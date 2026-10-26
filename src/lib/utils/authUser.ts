export interface AuthUserCookie {
  id?: string;
  [key: string]: unknown;
}

export const getAuthUserIdFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|; )auth_user=([^;]+)/);
  if (!match) return null;

  try {
    const decoded = decodeURIComponent(match[1]);
    const parsed = JSON.parse(decoded) as AuthUserCookie;
    return typeof parsed.id === "string" && parsed.id.length > 0
      ? parsed.id
      : null;
  } catch {
    return null;
  }
};

