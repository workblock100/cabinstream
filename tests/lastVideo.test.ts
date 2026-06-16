import { describe, it, expect, beforeEach } from "vitest";
import { saveLastVideo, getLastVideo } from "@/lib/lastVideo";

const ID = "dQw4w9WgXcQ";

beforeEach(() => localStorage.clear());

describe("saveLastVideo / getLastVideo", () => {
  it("round-trips a valid video", () => {
    saveLastVideo({ id: ID, title: "Song", channel: "Artist" });
    expect(getLastVideo()).toEqual({ id: ID, title: "Song", channel: "Artist" });
  });

  it("never persists a video whose id fails validation", () => {
    saveLastVideo({ id: "not-an-id", title: "x", channel: "y" });
    expect(getLastVideo()).toBeNull();
  });

  it("returns null for empty or garbage storage", () => {
    expect(getLastVideo()).toBeNull();
    localStorage.setItem("cs_last_video", "{{{ not json");
    expect(getLastVideo()).toBeNull();
  });

  it("rejects a stored object whose id is later corrupted", () => {
    localStorage.setItem(
      "cs_last_video",
      JSON.stringify({ id: "evil/../../x", title: "t", channel: "c" }),
    );
    expect(getLastVideo()).toBeNull();
  });

  it("defaults missing title/channel when the id is valid", () => {
    localStorage.setItem("cs_last_video", JSON.stringify({ id: ID }));
    const v = getLastVideo();
    expect(v?.id).toBe(ID);
    expect(typeof v?.title).toBe("string");
    expect(typeof v?.channel).toBe("string");
  });
});
