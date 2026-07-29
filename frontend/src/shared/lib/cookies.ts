const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export function setCookie(name: string, value: string): void {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function removeCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}
