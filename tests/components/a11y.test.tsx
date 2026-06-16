import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import { ParkedOnlyNotice } from "@/components/ParkedOnlyNotice";
import { AppTile } from "@/components/AppTile";
import { EmbedView } from "@/components/EmbedView";
import { getService } from "@/lib/services";
import { setCabinUrl } from "@/lib/settings";

// jsdom can't compute layout, so axe's color-contrast check is skipped here (that
// lens is covered by the real-browser audit each cycle). This test locks the
// STRUCTURAL a11y — labels, names, roles, ARIA, alt — against regressions in CI.
// Page-level rules don't apply to isolated component renders, so disable them;
// color-contrast needs real layout (canvas) jsdom lacks, and is covered by the
// real-browser audit, so disable it here to avoid noisy "incomplete" canvas warnings.
const PAGE_LEVEL = ["region", "landmark-one-main", "page-has-heading-one", "color-contrast"];

async function violations(container: HTMLElement) {
  const r = await axe.run(container, {
    rules: Object.fromEntries(PAGE_LEVEL.map((id) => [id, { enabled: false }])),
    resultTypes: ["violations"],
  });
  return r.violations.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.length }));
}

const youtube = getService("youtube")!;

describe("accessibility — structural (axe-core)", () => {
  it("ParkedOnlyNotice is clean in both states", async () => {
    const a = render(
      <main>
        <ParkedOnlyNotice openLabel="Open Live YouTube" setupLabel="Set up Live YouTube" />
      </main>,
    );
    expect(await violations(a.container)).toEqual([]);
    a.unmount();

    setCabinUrl("https://x.trycloudflare.com");
    const b = render(
      <main>
        <ParkedOnlyNotice openLabel="Open Live YouTube" setupLabel="Set up Live YouTube" />
      </main>,
    );
    expect(await violations(b.container)).toEqual([]);
  });

  it("AppTile (Live YouTube) is clean", async () => {
    setCabinUrl("https://x.trycloudflare.com");
    const { container } = render(
      <main>
        <AppTile service={youtube} onOpen={() => {}} />
      </main>,
    );
    expect(await violations(container)).toEqual([]);
  });

  it("EmbedView (Twitch) is clean", async () => {
    const { container } = render(
      <main>
        <EmbedView />
      </main>,
    );
    expect(await violations(container)).toEqual([]);
  });
});
