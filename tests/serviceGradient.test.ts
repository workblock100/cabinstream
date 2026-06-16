import { describe, it, expect } from "vitest";
import { tileGradient, SERVICES, type Service } from "@/lib/services";

const HEX6 = /^#[0-9a-fA-F]{6}$/;

describe("tileGradient", () => {
  it("produces valid #rrggbb from/to and a known fg for every catalog service", () => {
    for (const s of SERVICES) {
      const g = tileGradient(s);
      expect(g.from, `${s.id} from`).toMatch(HEX6);
      expect(g.to, `${s.id} to`).toMatch(HEX6);
      expect(["#ffffff", "#07090d"], `${s.id} fg`).toContain(g.fg);
    }
  });

  it("uses a neutral charcoal with white fg for a near-black brand", () => {
    const g = tileGradient({ brandHex: "000000" } as Service);
    expect(g).toEqual({ from: "#23262e", to: "#0d0f14", fg: "#ffffff" });
  });

  it("flips the foreground to near-black for a very bright brand", () => {
    const g = tileGradient({ brandHex: "FFFFFF" } as Service);
    expect(g.fg).toBe("#07090d");
    expect(g.from).toBe("#FFFFFF");
    expect(g.to).toMatch(HEX6);
  });

  it("keeps white fg for a mid/dark brand and darkens the gradient end", () => {
    const g = tileGradient({ brandHex: "FF0000" } as Service);
    expect(g.fg).toBe("#ffffff");
    expect(g.from).toBe("#FF0000");
    expect(g.to).toMatch(HEX6);
  });
});
