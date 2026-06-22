import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ContinueWatching } from "@/components/ContinueWatching";

describe("ContinueWatching", () => {
  it("shows the last in-app YouTube video when one is stored", async () => {
    localStorage.setItem(
      "cs_last_video",
      JSON.stringify({ id: "dQw4w9WgXcQ", title: "My Last Video", channel: "Some Channel" }),
    );
    render(<ContinueWatching />);
    const region = await screen.findByRole("region", { name: "Continue watching" });
    expect(within(region).getByText("My Last Video")).toBeInTheDocument();
    expect(within(region).getByText("Some Channel")).toBeInTheDocument();
  });

  it("renders nothing when there is no last video", () => {
    const { container } = render(<ContinueWatching />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("region", { name: "Continue watching" })).toBeNull();
  });
});
