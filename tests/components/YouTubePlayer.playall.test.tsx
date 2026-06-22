import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the network search so we can drive search results deterministically.
vi.mock("@/lib/youtube", async (orig) => {
  const actual = (await orig()) as object;
  return {
    ...actual,
    searchYouTube: vi.fn(async () => [
      { videoId: "dQw4w9WgXcQ", title: "First Vid", author: "A", duration: 100, thumbnail: "https://t/1.jpg" },
      { videoId: "kJQP7kiw5Fk", title: "Second Vid", author: "B", duration: 200, thumbnail: "https://t/2.jpg" },
      { videoId: "9bZkp7q19f0", title: "Third Vid", author: "C", duration: 300, thumbnail: "https://t/3.jpg" },
    ]),
  };
});

import { YouTubePlayer } from "@/components/YouTubePlayer";

describe("YouTubePlayer — Play all", () => {
  it("plays the first result and queues the rest", async () => {
    render(<YouTubePlayer />);
    await userEvent.type(screen.getByLabelText(/Search YouTube/i), "lofi");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await userEvent.click(await screen.findByRole("button", { name: "Play all" }));

    const panel = await screen.findByRole("region", { name: "Up next" });
    expect(within(panel).getByText("Second Vid")).toBeInTheDocument();
    expect(within(panel).getByText("Third Vid")).toBeInTheDocument();
    // the first result is now playing, not sitting in the queue
    expect(within(panel).queryByText("First Vid")).toBeNull();
  });
});
