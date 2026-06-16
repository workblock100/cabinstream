import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParkedOnlyNotice } from "@/components/ParkedOnlyNotice";
import { setCabinUrl } from "@/lib/settings";

describe("ParkedOnlyNotice", () => {
  it("shows the setup button (not a link) when no cabin URL is configured", async () => {
    render(<ParkedOnlyNotice openLabel="Open Live YouTube" setupLabel="Set up Live YouTube" />);
    expect(await screen.findByRole("button", { name: "Set up Live YouTube" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("shows the open link (new tab, safe rel) once a cabin URL is configured", async () => {
    setCabinUrl("https://my-tunnel.trycloudflare.com");
    render(<ParkedOnlyNotice openLabel="Open Live YouTube" setupLabel="Set up Live YouTube" />);
    const link = await screen.findByRole("link", { name: /Open Live YouTube/ });
    expect(link).toHaveAttribute("href", "https://my-tunnel.trycloudflare.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
