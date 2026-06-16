import { describe, it, expect } from "vitest";
import { mapPiped, mapInvidious } from "@/lib/youtube";

const ID = "dQw4w9WgXcQ";

describe("mapPiped", () => {
  it("returns [] for non-array / missing items", () => {
    expect(mapPiped(null)).toEqual([]);
    expect(mapPiped({})).toEqual([]);
    expect(mapPiped({ items: "nope" })).toEqual([]);
  });

  it("maps a stream item and extracts the videoId from the url", () => {
    const out = mapPiped({
      items: [
        { type: "stream", url: `/watch?v=${ID}`, title: "Song", uploaderName: "Artist", duration: 213, thumbnail: "https://t/x.jpg" },
      ],
    });
    expect(out).toEqual([{ videoId: ID, title: "Song", author: "Artist", duration: 213, thumbnail: "https://t/x.jpg" }]);
  });

  it("ignores non-stream items (channels/playlists)", () => {
    const out = mapPiped({
      items: [
        { type: "channel", url: "/c/foo", name: "Foo" },
        { type: "stream", url: `/watch?v=${ID}`, title: "ok" },
      ],
    });
    expect(out.map((r) => r.videoId)).toEqual([ID]);
  });

  // Regression (cycle 11): an earlier "…v=" param must not corrupt the id.
  it("extracts the real id when another v= param precedes it", () => {
    const out = mapPiped({ items: [{ type: "stream", url: `/watch?lv=1&v=${ID}`, title: "x" }] });
    expect(out[0].videoId).toBe(ID);
  });

  it("drops items whose url has no valid 11-char v= id", () => {
    const out = mapPiped({ items: [{ type: "stream", url: "/watch?v=short", title: "x" }] });
    expect(out).toEqual([]);
  });

  it("defaults missing fields and keeps live streams (duration 0)", () => {
    const out = mapPiped({ items: [{ type: "stream", url: `/watch?v=${ID}` }] });
    expect(out[0]).toEqual({ videoId: ID, title: "", author: "", duration: 0, thumbnail: "" });
  });
});

describe("mapInvidious", () => {
  const BASE = "https://inv.example.com";

  it("returns [] for non-array data", () => {
    expect(mapInvidious(null, BASE)).toEqual([]);
    expect(mapInvidious({}, BASE)).toEqual([]);
  });

  it("maps a video and prefers the 2nd thumbnail", () => {
    const out = mapInvidious(
      [
        {
          type: "video",
          videoId: ID,
          title: "Song",
          author: "Artist",
          lengthSeconds: 200,
          videoThumbnails: [{ url: "https://a/0.jpg" }, { url: "https://a/1.jpg" }],
        },
      ],
      BASE,
    );
    expect(out).toEqual([{ videoId: ID, title: "Song", author: "Artist", duration: 200, thumbnail: "https://a/1.jpg" }]);
  });

  it("prefixes a relative thumbnail with the instance base", () => {
    const out = mapInvidious(
      [{ type: "video", videoId: ID, title: "x", videoThumbnails: [{ url: "/vi/x/0.jpg" }] }],
      BASE,
    );
    expect(out[0].thumbnail).toBe(`${BASE}/vi/x/0.jpg`);
  });

  it("ignores non-video items and items without a videoId", () => {
    const out = mapInvidious(
      [
        { type: "playlist", playlistId: "PL" },
        { type: "video", title: "no id" },
        { type: "video", videoId: ID, title: "ok" },
      ],
      BASE,
    );
    expect(out.map((r) => r.videoId)).toEqual([ID]);
  });

  it("falls back to empty thumbnail when none provided", () => {
    const out = mapInvidious([{ type: "video", videoId: ID, title: "x" }], BASE);
    expect(out[0].thumbnail).toBe("");
  });
});
