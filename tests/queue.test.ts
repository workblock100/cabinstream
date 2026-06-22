import { describe, it, expect } from "vitest";
import {
  addToQueue,
  addManyToQueue,
  removeFromQueue,
  moveInQueue,
  getQueue,
  saveQueue,
  type QueueItem,
} from "@/lib/queue";

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

describe("addManyToQueue", () => {
  it("appends many, dropping dupes and bad ids", () => {
    const start = addToQueue([], mk(ID1));
    const out = addManyToQueue(start, [mk(ID1), mk("bad"), mk(ID2)]);
    expect(out.map((q) => q.id)).toEqual([ID1, ID2]);
  });

  it("respects the cap across a bulk add", () => {
    const many = Array.from({ length: 70 }, (_, i) => mk(String(i).padStart(11, "a")));
    expect(addManyToQueue([], many)).toHaveLength(50);
  });
});

describe("removeFromQueue", () => {
  it("removes the matching id and leaves the rest", () => {
    const list = addToQueue(addToQueue([], mk(ID1)), mk(ID2));
    expect(removeFromQueue(list, ID1).map((q) => q.id)).toEqual([ID2]);
  });
});

describe("moveInQueue", () => {
  const ID3 = "9bZkp7q19f0";
  const three = () => [mk(ID1), mk(ID2), mk(ID3)];

  it("moves an item up and down", () => {
    expect(moveInQueue(three(), ID2, -1).map((q) => q.id)).toEqual([ID2, ID1, ID3]);
    expect(moveInQueue(three(), ID2, 1).map((q) => q.id)).toEqual([ID1, ID3, ID2]);
  });

  it("clamps at the ends and ignores unknown ids", () => {
    expect(moveInQueue(three(), ID1, -1).map((q) => q.id)).toEqual([ID1, ID2, ID3]);
    expect(moveInQueue(three(), ID3, 1).map((q) => q.id)).toEqual([ID1, ID2, ID3]);
    expect(moveInQueue(three(), "nope", -1).map((q) => q.id)).toEqual([ID1, ID2, ID3]);
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
