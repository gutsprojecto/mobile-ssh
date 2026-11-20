// Builds every app icon, splash and notification image from assets/brand/logo.svg.
// Run with: npm run icons
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const require = createRequire(import.meta.url);
const spec = require("./icon-spec.cjs");
const { BRAND, GLYPH, OUT } = spec;

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const logo = fs.readFileSync(path.join(root, "assets/brand/logo.svg"), "utf8");
const glyphMarkup = logo
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");

const GLYPH_CX = (GLYPH.x0 + GLYPH.x1) / 2;
const GLYPH_CY = (GLYPH.y0 + GLYPH.y1) / 2;

// The accent as a warm gradient and a soft glow on the tile, for the full
// color icons. Single color variants (themed, notification) stay flat.
const DEFS =
  `<defs>` +
  // In glyph units, so a flat stroke like the cursor still gets painted.
  `<linearGradient id="accent" gradientUnits="userSpaceOnUse" x1="260" y1="220" x2="800" y2="800">` +
  `<stop offset="0" stop-color="${BRAND.accentLight}"/><stop offset="1" stop-color="${BRAND.accentDeep}"/>` +
  `</linearGradient>` +
  `<radialGradient id="glow" cx="0.8" cy="0.16" r="0.55">` +
  `<stop offset="0" stop-color="${BRAND.accent}" stop-opacity="0.2"/><stop offset="1" stop-color="${BRAND.accent}" stop-opacity="0"/>` +
  `</radialGradient>` +
  `</defs>`;

function svg(
  size,
  { bg, glow = false, scale = 1, white, accent, place = "center" },
) {
  const paint = (attr, from, to) => (m) =>
    m.replaceAll(`${attr}="${from}"`, `${attr}="${to}"`);
  let body = glyphMarkup;
  for (const attr of ["fill", "stroke"]) {
    body = paint(attr, BRAND.white, white)(body);
    body = paint(attr, BRAND.accent, accent)(body);
  }
  // "logo" keeps the exact layout of the web and desktop icon.
  const transform =
    place === "logo"
      ? `scale(${size / 1024})`
      : `translate(${size / 2} ${size / 2}) scale(${scale}) translate(${-GLYPH_CX} ${-GLYPH_CY})`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    DEFS +
    (bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : "") +
    (glow ? `<rect width="${size}" height="${size}" fill="url(#glow)"/>` : "") +
    `<g transform="${transform}">${body}</g></svg>`
  );
}

function render(markup) {
  return new Resvg(markup, { fitTo: { mode: "original" } }).render();
}

function write(rel, markup) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, render(markup).asPng());
  console.log("wrote", rel);
}

// Farthest painted pixel from the center, for a glyph drawn at scale 1.
function glyphRadius(size) {
  const img = render(
    svg(size, { white: BRAND.white, accent: BRAND.accent, scale: size / 1024 }),
  );
  const { pixels, width, height } = img;
  const c = size / 2;
  let max = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] === 0) continue;
      const dx = Math.max(Math.abs(x - c), Math.abs(x + 1 - c));
      const dy = Math.max(Math.abs(y - c), Math.abs(y + 1 - c));
      max = Math.max(max, Math.hypot(dx, dy));
    }
  }
  return max / (size / 1024);
}

const SIZE = 1024;
const safeRadius = ((spec.SAFE_CIRCLE * SIZE) / 2) * spec.SAFE_MARGIN;
const safeScale = safeRadius / glyphRadius(SIZE);

// iOS light and the default icon: same as the web and desktop icon.
write(
  OUT.icon,
  svg(SIZE, {
    bg: BRAND.iconTile,
    white: BRAND.white,
    accent: "url(#accent)",
    place: "logo",
  }),
);
// iOS dark: transparent so the system dark background shows through.
write(
  OUT.iosDark,
  svg(SIZE, { white: BRAND.white, accent: "url(#accent)", place: "logo" }),
);
// iOS tinted: grayscale, the system adds the tint.
write(
  OUT.iosTinted,
  svg(SIZE, {
    bg: "#000000",
    white: BRAND.white,
    accent: BRAND.tintedAccent,
    place: "logo",
  }),
);

// Android adaptive foreground and themed icon, inside the safe circle.
write(
  OUT.adaptive,
  svg(SIZE, {
    white: BRAND.white,
    accent: "url(#accent)",
    scale: safeScale,
  }),
);
// Its background: the tile with the same glow as the full icon.
write(
  OUT.adaptiveBackground,
  svg(SIZE, {
    bg: BRAND.iconTile,
    white: "none",
    accent: "none",
    scale: 0,
  }),
);
write(
  OUT.monochrome,
  svg(SIZE, { white: BRAND.white, accent: BRAND.white, scale: safeScale }),
);

// Android 12+ masks the splash icon to the same center circle.
write(
  OUT.splash,
  svg(SIZE, {
    white: BRAND.white,
    accent: "url(#accent)",
    scale: safeScale,
  }),
);

// Status bar icon, white on transparent.
for (const [density, px] of Object.entries(spec.NOTIFICATION_DENSITIES)) {
  const scale =
    (px * spec.NOTIFICATION_FILL) /
    Math.max(GLYPH.x1 - GLYPH.x0, GLYPH.y1 - GLYPH.y0);
  write(
    `${OUT.notificationDir}/notification-icon-${density}.png`,
    svg(px, { white: "#ffffff", accent: "#ffffff", scale }),
  );
}
