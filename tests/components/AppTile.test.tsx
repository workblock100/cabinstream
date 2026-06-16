import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppTile } from "@/components/AppTile";
import { getService } from "@/lib/services";
import { setCabinUrl } from "@/lib/settings";
import { getRecents } from "@/lib/recents";

const youtube = getService("youtube")!;
const netflix = getService("netflix")!;

describe("AppTile", () => {
  it("a non-live tile is a button that calls onOpen", async () => {
    const onOpen = vi.fn();
    render(<AppTile service={netflix} onOpen={onOpen} />);
    await userEvent.click(screen.getByRole("button", { name: /Open Netflix/ }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  // Regression (cycle 12): the Live YouTube tile is a real anchor to the Cabin
  // Browser and must record into "Jump back in" (recents) when opened.
  it("the Live YouTube tile is an anchor and records into recents on open", async () => {
    setCabinUrl("https://my-tunnel.trycloudflare.com");
    render(<AppTile service={youtube} onOpen={vi.fn()} />);
    const link = await screen.findByRole("link", { name: /Open YouTube/ });
    expect(link).toHaveAttribute("href", "https://my-tunnel.trycloudflare.com/");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(getRecents()).not.toContain("youtube");
    await userEvent.click(link);
    expect(getRecents()).toContain("youtube");
  });
});
