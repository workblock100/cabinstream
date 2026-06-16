import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmbedView } from "@/components/EmbedView";

describe("EmbedView (Twitch)", () => {
  // Regression (cycle 13 a11y + cycle 17 parsing): an invalid/reserved entry must
  // surface an accessible error and NOT load a dead player.
  it("shows an accessible error and no player for a reserved word", async () => {
    render(<EmbedView />);
    await userEvent.type(screen.getByLabelText("Twitch channel name"), "directory");
    await userEvent.click(screen.getByRole("button", { name: "Watch live" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Twitch channel/i);
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("renders the Twitch player iframe for a valid channel", async () => {
    render(<EmbedView />);
    await userEvent.type(screen.getByLabelText("Twitch channel name"), "pokimane");
    await userEvent.click(screen.getByRole("button", { name: "Watch live" }));
    const iframe = await screen.findByTitle("Twitch player");
    expect(iframe.getAttribute("src")).toContain("channel=pokimane");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
