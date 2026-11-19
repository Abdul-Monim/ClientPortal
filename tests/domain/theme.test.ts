import { describe, expect, it } from "vitest";
import {
  buildBrandThemeTokens,
  getContrastRatio,
  inferDeliverableKindFromUrl,
  normalizeAccentHex,
} from "@/domain/theme";

describe("white-label theme & contrast tokens", () => {
  it("normalizes valid hex codes and falls back safely on malformed input", () => {
    expect(normalizeAccentHex("#2f5d50")).toBe("#2F5D50");
    expect(normalizeAccentHex("not-a-color")).toBe("#2F5D50");
  });

  it("selects high-contrast button text for dark and light accents", () => {
    const pine = buildBrandThemeTokens("#2F5D50");
    expect(pine.accentForegroundHex).toBe("#FAF9F6");
    expect(pine.meetsWcagAa).toBe(true);
    expect(getContrastRatio("#161614", "#FAF9F6")).toBeGreaterThan(15);

    const paleGold = buildBrandThemeTokens("#F4D35E");
    expect(paleGold.accentForegroundHex).toBe("#161614");
    expect(paleGold.meetsWcagAa).toBe(true);
  });

  it("infers deliverable kinds from common freelance tool URLs", () => {
    expect(inferDeliverableKindFromUrl("https://www.figma.com/design/abc")).toBe("figma");
    expect(inferDeliverableKindFromUrl("https://www.loom.com/share/123")).toBe("loom");
    expect(inferDeliverableKindFromUrl("https://demo.vercel.app")).toBe("staging_url");
    expect(inferDeliverableKindFromUrl("https://cdn.site/spec.pdf")).toBe("pdf");
    expect(inferDeliverableKindFromUrl("https://cdn.site/hero.webp")).toBe("image");
    expect(inferDeliverableKindFromUrl("https://cdn.site/clip.mp4")).toBe("video");
    expect(inferDeliverableKindFromUrl("https://example.com/notes")).toBe("link");
  });
});
