import { describe, it, expect } from "vitest";
import { getChannels, rememberChannel, clearChannels } from "@/lib/twitchHistory";

describe("twitchHistory", () => {
  it("remembers channels newest-first, de-duped case-insensitively", () => {
    rememberChannel("pokimane");
    rememberChannel("xqc");
    rememberChannel("Pokimane");
    expect(getChannels()).toEqual(["Pokimane", "xqc"]);
  });

  it("tolerates garbage and clears", () => {
    localStorage.setItem("cs_twitch_channels", "not json");
    expect(getChannels()).toEqual([]);
    rememberChannel("a");
    clearChannels();
    expect(getChannels()).toEqual([]);
  });
});
