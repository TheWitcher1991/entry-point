import { createStore, createEvent, createEffect, sample } from "effector";
import { api } from "@shared/api/axios";
import { setCookie, removeCookie } from "@shared/lib/cookies";
import type { User } from "@entities/user";

/* ── State ── */

export const $user = createStore<User | null>(null);
export const $token = createStore<string | null>(null);
export const $isAuthenticated = $user.map((u) => u !== null);
export const $isHydrated = createStore(false);
export const $authError = createStore<string | null>(null);

/* ── Events ── */

export const logout = createEvent();
export const resetAuthError = createEvent();
export const tokenHydrated = createEvent<string | null>();

$authError.reset([resetAuthError, logout]);

// Hydration tracking
$isHydrated.on(tokenHydrated, () => true);

/* ── Effects ── */

export const loginFx = createEffect(
  async (params: { email: string; password: string }) => {
    const { data } = await api.post("/auth/login", params);
    localStorage.setItem("access_token", data.access_token);
    setCookie("access_token", data.access_token);
    return data as { access_token: string };
  },
);

export const registerFx = createEffect(
  async (params: {
    email: string;
    password: string;
    role: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const { data } = await api.post("/auth/register", params);
    localStorage.setItem("access_token", data.access_token);
    setCookie("access_token", data.access_token);
    return data as { access_token: string };
  },
);

export const getMeFx = createEffect(async () => {
  const { data } = await api.get<User>("/users/me");
  return data;
});

// On getMe failure after login/register — clear token + stale role cookie
sample({
  clock: getMeFx.fail,
  fn: () => {
    localStorage.removeItem("access_token");
    removeCookie("access_token");
    removeCookie("user_role");
    return null;
  },
  target: [$token, $user, $authError] as any,
});

/* ── Token ── */

$token.on(loginFx.doneData, (_, p) => p.access_token);
$token.on(registerFx.doneData, (_, p) => p.access_token);
$token.on(tokenHydrated, (_, token) => token);
$token.reset(logout);

/* ── User ── */

$user.on(getMeFx.doneData, (_, user) => {
  setCookie("user_role", user.role);
  return user;
});

// On login/register success — fetch user
sample({
  clock: [loginFx.done, registerFx.done],
  target: getMeFx,
});

// Save token → fetch user on init
sample({
  clock: tokenHydrated,
  filter: (token): token is string => token !== null,
  target: getMeFx,
});

// On login/register failure — store error
sample({
  clock: [loginFx.fail, registerFx.fail],
  fn: ({ error }) => {
    const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join("; ") || "Ошибка сервера";
    }
    if (typeof detail === "string") return detail;
    return "Ошибка соединения";
  },
  target: $authError,
});

/* ── Logout ── */

logout.watch(() => {
  localStorage.removeItem("access_token");
  removeCookie("access_token");
  removeCookie("user_role");
  $user.reinit!();
  $token.reinit!();
  $authError.reinit!();
});
