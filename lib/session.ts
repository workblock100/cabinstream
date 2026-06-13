"use client";

/**
 * Lightweight client-side session backed by localStorage (personal use — no real
 * backend, no payments). Persists so sign-in is a one-time thing in the car.
 */

const KEY_AUTH = "cs_auth";
const KEY_EMAIL = "cs_email";

export function login(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_AUTH, "1");
  localStorage.setItem(KEY_EMAIL, email);
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_AUTH);
  localStorage.removeItem(KEY_EMAIL);
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY_AUTH) === "1";
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY_EMAIL);
}
