import { describe, it, expect } from "vitest";
import { pushSearch, getSearches, rememberSearch, clearSearches } from "@/lib/searchHistory";

describe("pushSearch", () => {
  it("puts the newest term at the front", () => {
    expect(pushSearch(["a", "b"], "c")).toEqual(["c", "a", "b"]);
  });

  it("de-dupes case-insensitively and moves to front", () => {
    expect(pushSearch(["a", "b", "c"], "B")).toEqual(["B", "a", "c"]);
  });

  it("trims and ignores empty/whitespace", () => {
    expect(pushSearch(["a"], "   ")).toEqual(["a"]);
    expect(pushSearch(["a"], "  lofi  ")).toEqual(["lofi", "a"]);
  });

  it("caps at 8", () => {
    let l: string[] = [];
    for (let i = 0; i < 12; i++) l = pushSearch(l, `term${i}`);
    expect(l).toHaveLength(8);
    expect(l[0]).toBe("term11");
  });
});

describe("rememberSearch / getSearches / clearSearches", () => {
  it("persists newest-first and reads back", () => {
    rememberSearch("lofi");
    rememberSearch("jazz");
    expect(getSearches()).toEqual(["jazz", "lofi"]);
  });

  it("tolerates garbage in storage", () => {
    localStorage.setItem("cs_searches", "not json");
    expect(getSearches()).toEqual([]);
  });

  it("clears", () => {
    rememberSearch("x");
    clearSearches();
    expect(getSearches()).toEqual([]);
  });
});
