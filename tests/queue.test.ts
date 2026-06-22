import { describe, it, expect } from "vitest";
import { addToQueue, removeFromQueue, getQueue, saveQueue, type QueueItem } from "@/lib/queue";

const ID1 = "dQw4w9WgXcQ";
const ID2 = "kJQP7kiw5Fk";
const mk = (id: string, extra: Partial<QueueItem> = {}): QueueItem => ({
  id,
  title: `t-${id}`,
  channel: "chan",
  ...extra,
});

describe("addToQueue", () => {
  it("appends a valid item", () => {
    expect(addToQueue([], mk(ID1)).map((q) => q.id)).toEqual([ID1]);
  });

  it("dedupes by id (returns the same list unchanged)", () => {
    const list = addToQueue([], mk(ID1));
    expect(addToQueue(list, mk(ID1))).toBe(list);
  });

  it("rejects an invalid video id", () => {
    expect(addToQueue([], mk("not-an-id"))).toEqual([]);
  });

  it("caps the queue at 50", () => {
    let list: QueueItem[] = [];
    for (let i = 0; i < 60; i++) list = addToQueue(list, mk(String(i).padStart(11, "a")));
    expect(list).toHaveLength(50);
  });
});

describe("removeFromQueue", () => {
  it("removes the matching id and leaves the rest", () => {
    const list = addToQueue(addToQueue([], mk(ID1)), mk(ID2));
    expect(removeFromQueue(list, ID1).map((q) => q.id)).toEqual([ID2]);
  });
});

describe("getQueue / saveQueue", () => {
  it("round-trips through localStorage", () => {
    const list = [mk(ID1, { thumb: "https://t/1.jpg" }), mk(ID2)];
    saveQueue(list);
    expect(getQueue()).toEqual(list);
  });

  it("tolerates garbage and drops bad entries", () => {
    localStorage.setItem("cs_queue", "not json");
    expect(getQueue()).toEqual([]);
    localStorage.setItem("cs_queue", JSON.stringify({ not: "an array" }));
    expect(getQueue()).toEqual([]);
    localStorage.setItem("cs_queue", JSON.stringify([{ id: "bad" }, { id: ID1, title: "ok", channel: "c" }]));
    expect(getQueue().map((q) => q.id)).toEqual([ID1]);
  });
});
