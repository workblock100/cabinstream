import { describe, it, expect } from "vitest";
import { parseYouTubeId, getService, FEATURED_VIDEOS, looksLikeVideoUrl } from "@/lib/services";

const ID = "dQw4w9WgXcQ"; // a real 11-char YouTube id

describe("parseYouTubeId", () => {
  it("accepts a bare 11-char id", () => {
    expect(parseYouTubeId(ID)).toBe(ID);
  });

  it("extracts from every supported URL form", () => {
    expect(parseYouTubeId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(parseYouTubeId(`https://youtu.be/${ID}`)).toBe(ID);
    expect(parseYouTubeId(`https://www.youtube.com/embed/${ID}`)).toBe(ID);
    expect(parseYouTubeId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID);
    expect(parseYouTubeId(`https://m.youtube.com/watch?v=${ID}&t=30s`)).toBe(ID);
  });

  it("trims surrounding whitespace and rejects empty input", () => {
    expect(parseYouTubeId(`  ${ID}  `)).toBe(ID);
    expect(parseYouTubeId("")).toBeNull();
    expect(parseYouTubeId("    ")).toBeNull();
  });

  it("returns null for non-YouTube URLs and short strings", () => {
    expect(parseYouTubeId("https://vimeo.com/12345")).toBeNull();
    expect(parseYouTubeId("hello")).toBeNull();
  });

  // Regression context (cycle 11): parseYouTubeId accepts ANY 11-char token, so a
  // bare search word like "documentary" (11 chars) parses as an id. The fix lived
  // in YouTubePlayer's looksLikeUrl guard, NOT here — this test documents WHY that
  // guard is required, so nobody "fixes" parseYouTubeId and breaks pasted bare ids.
  it("treats an 11-char word as an id (why the search-routing guard exists)", () => {
    expect("documentary".length).toBe(11);
    expect(parseYouTubeId("documentary")).toBe("documentary");
    expect(parseYouTubeId("cheesecakes")).toBe("cheesecakes");
    // a word with a space is NOT 11 single-token chars -> null (so it searches)
    expect(parseYouTubeId("music video")).toBeNull();
  });
});

// Regression (cycle 11): the search box must SEARCH bare words and only PLAY links.
describe("looksLikeVideoUrl", () => {
  it("is false for bare search terms (so they get searched)", () => {
    expect(looksLikeVideoUrl("documentary")).toBe(false);
    expect(looksLikeVideoUrl("cheesecakes")).toBe(false);
    expect(looksLikeVideoUrl("lofi hip hop")).toBe(false);
    expect(looksLikeVideoUrl("dQw4w9WgXcQ")).toBe(false); // a bare id still searches
  });

  it("is true for YouTube links (so they get played)", () => {
    expect(looksLikeVideoUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(looksLikeVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
    expect(looksLikeVideoUrl("https://youtube.com/shorts/abc123")).toBe(true);
    expect(looksLikeVideoUrl("youtube.com/embed/abc")).toBe(true);
  });
});

describe("getService", () => {
  it("resolves known services and returns undefined for unknown", () => {
    expect(getService("youtube")?.id).toBe("youtube");
    expect(getService("nope-not-real")).toBeUndefined();
  });

  // Regression (cycle 14): the Max tile was canonicalized to "HBO Max".
  it("has HBO Max canonical name and url (not the defunct play.max.com)", () => {
    const max = getService("max");
    expect(max?.name).toBe("HBO Max");
    expect(max?.url).toBe("https://www.hbomax.com");
  });
});

describe("FEATURED_VIDEOS", () => {
  it("every featured id is a valid 11-char YouTube id", () => {
    for (const v of FEATURED_VIDEOS) {
      expect(parseYouTubeId(v.id), `${v.title} (${v.id})`).toBe(v.id);
    }
  });
});
