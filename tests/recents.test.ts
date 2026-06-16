import { describe, it, expect, beforeEach } from "vitest";
import { trackOpen, getRecents } from "@/lib/recents";

beforeEach(() => localStorage.clear());

describe("trackOpen / getRecents", () => {
  it("records most-recent-first", () => {
    trackOpen("a");
    trackOpen("b");
    expect(getRecents()).toEqual(["b", "a"]);
  });

  it("dedupes and moves a re-opened id to the front", () => {
    trackOpen("a");
    trackOpen("b");
    trackOpen("a");
    expect(getRecents()).toEqual(["a", "b"]);
  });

  it("caps the list at 8 entries (MAX)", () => {
    for (let i = 0; i < 12; i++) trackOpen(`svc-${i}`);
    const recents = getRecents();
    expect(recents.length).toBe(8);
    // newest kept, oldest dropped
    expect(recents[0]).toBe("svc-11");
    expect(recents).not.toContain("svc-0");
  });

  it("returns [] when storage is empty or holds garbage", () => {
    expect(getRecents()).toEqual([]);
    localStorage.setItem("cs_recents", "not json");
    expect(getRecents()).toEqual([]);
    localStorage.setItem("cs_recents", JSON.stringify({ not: "an array" }));
    expect(getRecents()).toEqual([]);
  });

  it("filters out non-string entries from stored data", () => {
    localStorage.setItem("cs_recents", JSON.stringify(["ok", 5, null, "fine"]));
    expect(getRecents()).toEqual(["ok", "fine"]);
  });
});
