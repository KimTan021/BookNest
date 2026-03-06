const TOKEN_KEY = "bookstore_access_token";
const TOKEN_EXP_KEY = "bookstore_access_token_exp";

export function saveToken(token: string, expiresInSeconds: number): void {
  const expiresAtMs = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXP_KEY, String(expiresAtMs));
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiryRaw = localStorage.getItem(TOKEN_EXP_KEY);
  if (!token || !expiryRaw) {
    return null;
  }

  const expiry = Number(expiryRaw);
  if (Number.isNaN(expiry) || Date.now() > expiry) {
    clearToken();
    return null;
  }

  return token;
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXP_KEY);
}
