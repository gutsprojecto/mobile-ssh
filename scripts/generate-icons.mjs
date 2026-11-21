// Builds every app icon, splash and notification image from assets/brand/logo.svg.
// Run with: npm run icons
//
// logo.svg holds the full color symbol (with its own gradients) centered at
// 512,512 in 1024 units. One color variants paint every shape in a single
// color and drop the shading paths marked data-shade.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const require = createRequire(import.meta.url);
const spec = require("./icon-spec.cjs");
const { BRAND, OUT } = spec;

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const logo = fs.readFileSync(path.join(root, "assets/brand/logo.svg"), "utf8");
const symbol = logo
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/<!--[\s\S]*?-->/g, "");

/** The symbol in one color, without its shading. */
function flat(color) {
  return symbol
    .replace(/<defs>[\s\S]*?<\/defs>/, "")
    .replace(/<path data-shade[^>]*\/>/g, "")
    .replace(/fill="[^"]*"/g, `fill="${color}"`);
}

/** The symbol at `scale` of its 1024 frame, centered in a `size` square. */
function svg(size, { bg, scale, color }) {
  const body = color ? flat(color) : symbol;
  const s = (size / 1024) * scale;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    (bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : "") +
    `<g transform="translate(${size / 2} ${size / 2}) scale(${s}) translate(-512 -512)">${body}</g></svg>`
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

/** Farthest painted pixel from the center at scale 1, in 1024 units. */
function symbolRadius() {
  const size = 1024;
  const { pixels, width, height } = render(svg(size, { scale: 1 }));
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
  return max;
}

const SIZE = 1024;
const radius = symbolRadius();
// Adaptive icons: keep the symbol inside the 66dp safe circle.
const safeScale = (((spec.SAFE_CIRCLE * SIZE) / 2) * spec.SAFE_MARGIN) / radius;
// The adaptive icon's symbol: smaller than the safe circle, like Google Play
// or Proton Pass.
const symbolScale = safeScale * spec.TILE_SYMBOL;
// Square icons (iOS, web) show the whole tile, the launcher only the middle
// 72 of 108dp: scale up so both look the same.
const tileScale = symbolScale * (108 / 72);

write(OUT.icon, svg(SIZE, { bg: BRAND.iconTile, scale: tileScale }));
// iOS dark: transparent so the system dark background shows through.
write(OUT.iosDark, svg(SIZE, { scale: tileScale }));
// iOS tinted: grayscale, the system adds the tint.
write(
  OUT.iosTinted,
  svg(SIZE, { bg: "#000000", scale: tileScale, color: BRAND.tintedAccent }),
);

// Android adaptive foreground and background, and the themed icon.
write(OUT.adaptive, svg(SIZE, { scale: symbolScale }));
write(OUT.adaptiveBackground, svg(SIZE, { bg: BRAND.iconTile, scale: 0 }));
write(OUT.monochrome, svg(SIZE, { scale: symbolScale, color: "#ffffff" }));

// Android 12+ masks the splash icon to the same center circle.
write(OUT.splash, svg(SIZE, { scale: safeScale }));

// Status bar icon, white on transparent, filling the center 20dp.
for (const [density, px] of Object.entries(spec.NOTIFICATION_DENSITIES)) {
  const scale = (spec.NOTIFICATION_FILL * 512) / radius;
  write(
    `${OUT.notificationDir}/notification-icon-${density}.png`,
    svg(px, { scale, color: "#ffffff" }),
  );
}
