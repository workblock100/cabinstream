import { describe, it, expect } from "vitest";
import { parseTwitchChannel } from "@/lib/twitch";

describe("parseTwitchChannel", () => {
  it("extracts the channel from a real channel URL", () => {
    expect(parseTwitchChannel("https://www.twitch.tv/pokimane")).toBe("pokimane");
    expect(parseTwitchChannel("twitch.tv/pokimane")).toBe("pokimane");
    expect(parseTwitchChannel("http://twitch.tv/Ninja")).toBe("ninja");
  });

  it("accepts bare handles (with optional @) and lowercases them", () => {
    expect(parseTwitchChannel("pokimane")).toBe("pokimane");
    expect(parseTwitchChannel("@xqc")).toBe("xqc");
    expect(parseTwitchChannel("xQc")).toBe("xqc");
    expect(parseTwitchChannel("  pokimane  ")).toBe("pokimane");
  });

  // Regression (cycle 11): reserved Twitch paths must not become channels.
  it("rejects reserved Twitch paths", () => {
    expect(parseTwitchChannel("https://www.twitch.tv/directory")).toBe("");
    expect(parseTwitchChannel("https://www.twitch.tv/videos")).toBe("");
    expect(parseTwitchChannel("directory")).toBe("");
  });

  // Regression (cycle 17): bare-domain / foreign-host URLs must not emit a scheme
  // or host fragment ("https"/"www"/"twitch") as a bogus channel.
  it("rejects bare-domain and foreign-host URLs (no scheme/host fragment leaks)", () => {
    for (const bad of [
      "twitch.tv",
      "https://twitch.tv",
      "http://twitch.tv",
      "www.twitch.tv",
      "https://www.twitch.tv/",
      "https://example.com/pokimane",
    ]) {
      expect(parseTwitchChannel(bad), bad).toBe("");
    }
  });

  it("returns empty for empty/whitespace input", () => {
    expect(parseTwitchChannel("")).toBe("");
    expect(parseTwitchChannel("   ")).toBe("");
  });
});
