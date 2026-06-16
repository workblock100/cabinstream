import { describe, it, expect } from "vitest";
import { formatDuration } from "@/lib/youtube";

describe("formatDuration", () => {
  it("renders LIVE for 0 / negative / falsy durations", () => {
    expect(formatDuration(0)).toBe("LIVE");
    expect(formatDuration(-1)).toBe("LIVE");
  });

  it("formats sub-hour durations as m:ss with zero-padded seconds", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(599)).toBe("9:59");
    expect(formatDuration(5)).toBe("0:05");
  });

  it("formats hour-plus durations as h:mm:ss", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(7325)).toBe("2:02:05");
  });
});
