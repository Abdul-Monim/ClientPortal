export interface BrandThemeTokens {
  accentHex: string;
  accentForegroundHex: string;
  accentSoftRgba: string;
  accentBorderRgba: string;
  contrastRatioOnWhite: number;
  meetsWcagAa: boolean;
}

const DEFAULT_ACCENT = "#2F5D50";

export function normalizeAccentHex(input: string): string {
  const trimmed = input.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return DEFAULT_ACCENT;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function channelLuminance(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(normalizeAccentHex(hex));
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

export function getContrastRatio(hexA: string, hexB: string): number {
  const lumA = getRelativeLuminance(hexA);
  const lumB = getRelativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function buildBrandThemeTokens(inputHex: string): BrandThemeTokens {
  const accentHex = normalizeAccentHex(inputHex);
  const { r, g, b } = hexToRgb(accentHex);

  const contrastLightText = getContrastRatio(accentHex, "#FAF9F6");
  const contrastDarkText = getContrastRatio(accentHex, "#161614");
  const accentForegroundHex =
    contrastLightText >= contrastDarkText ? "#FAF9F6" : "#161614";
  const contrastRatioOnWhite = getContrastRatio(accentHex, "#FAF9F6");

  return {
    accentHex,
    accentForegroundHex,
    accentSoftRgba: `rgba(${r}, ${g}, ${b}, 0.12)`,
    accentBorderRgba: `rgba(${r}, ${g}, ${b}, 0.28)`,
    contrastRatioOnWhite,
    meetsWcagAa: Math.max(contrastLightText, contrastDarkText) >= 4.5,
  };
}

export function inferDeliverableKindFromUrl(url: string):
  | "figma"
  | "loom"
  | "staging_url"
  | "pdf"
  | "image"
  | "video"
  | "link" {
  const lower = url.toLowerCase();
  if (lower.includes("figma.com")) return "figma";
  if (lower.includes("loom.com")) return "loom";
  if (lower.includes("vercel.app") || lower.includes("netlify.app")) return "staging_url";
  if (lower.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpg|jpeg|webp|gif|svg)(\?|$)/.test(lower)) return "image";
  if (/\.(mp4|mov|webm)(\?|$)/.test(lower)) return "video";
  return "link";
}
