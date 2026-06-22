import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/settings/page";

describe("SettingsPage — Clear watch data", () => {
  it("clears watch data but keeps sign-in and the Cabin Browser URL", async () => {
    localStorage.setItem("cs_auth", "1");
    localStorage.setItem("cs_cabin_url", "https://x.trycloudflare.com/");
    localStorage.setItem("cs_queue", JSON.stringify([{ id: "dQw4w9WgXcQ", title: "t", channel: "c" }]));
    localStorage.setItem("cs_searches", JSON.stringify(["lofi"]));
    localStorage.setItem("cs_twitch_channels", JSON.stringify(["xqc"]));
    localStorage.setItem("cs_recents", JSON.stringify(["youtube"]));

    render(<SettingsPage />);
    await userEvent.click(await screen.findByRole("button", { name: "Clear watch data" }));

    // wiped
    expect(localStorage.getItem("cs_queue")).toBeNull();
    expect(localStorage.getItem("cs_searches")).toBeNull();
    expect(localStorage.getItem("cs_twitch_channels")).toBeNull();
    expect(localStorage.getItem("cs_recents")).toBeNull();
    // kept
    expect(localStorage.getItem("cs_auth")).toBe("1");
    expect(localStorage.getItem("cs_cabin_url")).toBe("https://x.trycloudflare.com/");
    // feedback
    expect(await screen.findByRole("button", { name: "Cleared" })).toBeInTheDocument();
  });
});
