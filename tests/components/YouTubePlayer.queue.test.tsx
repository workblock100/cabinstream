import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { FEATURED_VIDEOS } from "@/lib/services";

describe("YouTubePlayer — Up Next queue", () => {
  it("adds a featured video to the queue, then plays + consumes it via Play next", async () => {
    render(<YouTubePlayer />);
    const second = FEATURED_VIDEOS[1];

    // No queue initially.
    expect(screen.queryByRole("region", { name: "Up next" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Play next" })).toBeNull();

    // Add the 2nd featured video to Up Next.
    await userEvent.click(screen.getByRole("button", { name: `Add ${second.title} to Up next` }));

    // The panel appears with the item; the grid toggle flips to a pressed "Remove".
    const panel = await screen.findByRole("region", { name: "Up next" });
    expect(within(panel).getByText(second.title)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Remove ${second.title} from Up next`, pressed: true }),
    ).toBeInTheDocument();

    // Play next consumes the queue: panel + Play next button disappear, toggle resets to "Add".
    await userEvent.click(screen.getByRole("button", { name: "Play next" }));
    expect(screen.queryByRole("region", { name: "Up next" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Play next" })).toBeNull();
    expect(screen.getByRole("button", { name: `Add ${second.title} to Up next` })).toBeInTheDocument();
  });

  it("removes a queued item with the panel's remove button", async () => {
    render(<YouTubePlayer />);
    const third = FEATURED_VIDEOS[2];
    await userEvent.click(screen.getByRole("button", { name: `Add ${third.title} to Up next` }));
    const panel = await screen.findByRole("region", { name: "Up next" });
    await userEvent.click(within(panel).getByRole("button", { name: `Remove ${third.title} from Up next` }));
    expect(screen.queryByRole("region", { name: "Up next" })).toBeNull();
  });
});
