import { describe, it, expect, beforeEach } from "vitest";
import { getCabinUrl, setCabinUrl } from "@/lib/settings";

beforeEach(() => localStorage.clear());

describe("setCabinUrl / getCabinUrl", () => {
  it("saves a full https URL", () => {
    expect(setCabinUrl("https://my-tunnel.trycloudflare.com")).toBe(true);
    expect(getCabinUrl()).toBe("https://my-tunnel.trycloudflare.com/");
  });

  // Regression (cycle 13): a scheme-less host typed on the car keyboard must be
  // normalized to https://, not rejected.
  it("prepends https:// to a scheme-less host", () => {
    expect(setCabinUrl("my-tunnel.trycloudflare.com")).toBe(true);
    expect(getCabinUrl()).toBe("https://my-tunnel.trycloudflare.com/");
  });

  it("allows http:// (e.g. a LAN address)", () => {
    expect(setCabinUrl("http://localhost:8080")).toBe(true);
    expect(getCabinUrl()).toBe("http://localhost:8080/");
  });

  it("trims surrounding whitespace", () => {
    expect(setCabinUrl("  https://x.trycloudflare.com  ")).toBe(true);
    expect(getCabinUrl()).toBe("https://x.trycloudflare.com/");
  });

  it("empty input clears the stored value and reports success", () => {
    setCabinUrl("https://x.trycloudflare.com");
    expect(setCabinUrl("   ")).toBe(true);
    expect(getCabinUrl()).toBe("");
  });

  // Security: a javascript:/data: scheme must NEVER become a stored href.
  it("never stores a dangerous scheme as an href", () => {
    for (const bad of ["javascript:alert(1)", "data:text/html,<script>", "vbscript:msgbox(1)"]) {
      localStorage.clear();
      const ok = setCabinUrl(bad);
      const stored = getCabinUrl();
      expect(stored.startsWith("javascript:")).toBe(false);
      expect(stored.startsWith("data:")).toBe(false);
      expect(stored.startsWith("vbscript:")).toBe(false);
      // either rejected outright, or coerced to an http(s) URL by the https:// prepend
      if (ok) expect(/^https?:\/\//.test(stored)).toBe(true);
    }
  });

  it("getCabinUrl returns empty string when nothing is stored", () => {
    expect(getCabinUrl()).toBe("");
  });
});
