import { describe, it, expect, beforeEach } from "vitest";
import { login, logout, isAuthed, getEmail } from "@/lib/session";

beforeEach(() => localStorage.clear());

describe("session", () => {
  it("starts logged out", () => {
    expect(isAuthed()).toBe(false);
    expect(getEmail()).toBeNull();
  });

  it("login persists auth + email", () => {
    expect(login("elijah@example.com")).toBe(true);
    expect(isAuthed()).toBe(true);
    expect(getEmail()).toBe("elijah@example.com");
  });

  it("logout clears auth + email", () => {
    login("elijah@example.com");
    logout();
    expect(isAuthed()).toBe(false);
    expect(getEmail()).toBeNull();
  });

  it("isAuthed is true only for the exact sentinel value", () => {
    localStorage.setItem("cs_auth", "yes");
    expect(isAuthed()).toBe(false);
    localStorage.setItem("cs_auth", "1");
    expect(isAuthed()).toBe(true);
  });
});
