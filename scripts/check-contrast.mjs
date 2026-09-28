/**
 * WCAG contrast checker for the Agnipankh Labs palette.
 *
 * The Brand Kit's Innovation Orange (#FF6B00) fails AA for text on white, which is
 * why app/globals.css splits it into `brand` (backgrounds) and `brand-ink` (text).
 * This script proves those assignments rather than trusting them.
 *
 * Run: npm run check:contrast
 */

const PALETTE = {
  brand: "#FF6B00",
  "brand-ink": "#B35100",
  "brand-hover": "#8F4100",
  navy: "#0F172A",
  royal: "#2563EB",
  "royal-ink": "#1D4ED8",
  surface: "#FFFFFF",
  muted: "#F3F4F6",
  body: "#374151",
};

/** Relative luminance per WCAG 2.1 §relative-luminance. */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Pairs we actually ship, and the threshold each must clear. */
const CHECKS = [
  // Foreground text on light surfaces
  ["body on surface", PALETTE.body, PALETTE.surface, 4.5, "body text"],
  ["navy on surface", PALETTE.navy, PALETTE.surface, 4.5, "headings"],
  ["brand-ink on surface", PALETTE["brand-ink"], PALETTE.surface, 4.5, "orange text/links"],
  ["royal-ink on surface", PALETTE["royal-ink"], PALETTE.surface, 4.5, "blue links"],
  ["body on muted", PALETTE.body, PALETTE.muted, 4.5, "text on gray cards"],
  ["brand-ink on muted", PALETTE["brand-ink"], PALETTE.muted, 4.5, "orange text on gray"],
  ["navy on muted", PALETTE.navy, PALETTE.muted, 4.5, "headings on gray cards"],
  // Primary button: brand-ink fill, white label (NOT #FF6B00 — that fails)
  ["surface on brand-ink", PALETTE.surface, PALETTE["brand-ink"], 4.5, "primary button label"],
  ["surface on brand-hover", PALETTE.surface, PALETTE["brand-hover"], 4.5, "primary hover label"],
  ["brand-ink on surface (fill vs page)", PALETTE["brand-ink"], PALETTE.surface, 3.0, "button edge"],
  // Decorative orange: only ever carries navy text
  ["navy on brand", PALETTE.navy, PALETTE.brand, 4.5, "navy-on-orange badge"],
  // Dark sections
  ["surface on navy", PALETTE.surface, PALETTE.navy, 4.5, "footer/dark section text"],
  ["brand on navy", PALETTE.brand, PALETTE.navy, 4.5, "orange accent on navy"],
  ["surface on royal", PALETTE.surface, PALETTE.royal, 4.5, "blue button label"],
  // Focus ring (WCAG 1.4.11, 3:1)
  ["brand-ink on surface (focus ring)", PALETTE["brand-ink"], PALETTE.surface, 3.0, "focus ring"],
];

let failed = 0;
console.log("\n  WCAG contrast — Agnipankh Labs palette\n");
for (const [label, fg, bg, min, note] of CHECKS) {
  const ratio = contrast(fg, bg);
  const ok = ratio >= min;
  if (!ok) failed++;
  console.log(
    `  ${ok ? "PASS" : "FAIL"}  ${ratio.toFixed(2).padStart(5)}:1  (min ${min})  ${label.padEnd(34)} ${note}`,
  );
}

// The trap this whole split exists to prevent.
const trap = contrast(PALETTE.brand, PALETTE.surface);
console.log(
  `\n  Guard: raw brand #FF6B00 as TEXT on white is ${trap.toFixed(2)}:1 — ` +
    `${trap >= 4.5 ? "unexpectedly passing" : "failing AA as expected"}. Use brand-ink instead.\n`,
);

if (failed > 0) {
  console.error(`  ${failed} pair(s) failed. Fix the palette before shipping.\n`);
  process.exit(1);
}
console.log("  All shipped color pairs meet their threshold.\n");
