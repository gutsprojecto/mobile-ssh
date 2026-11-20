// Shared by generate-icons.mjs and verify-app-icons.cjs so the two agree.

const BRAND = {
  tile: "#141513",
  // The launcher icon's own light tile, like current Google app icons.
  iconTile: "#fbf8f3",
  white: "#ffffff",
  accent: "#f59145",
  // Ends of the accent gradient in the full color icons.
  accentLight: "#ffb36b",
  accentDeep: "#ec7429",
  // Accent as gray for the tinted iOS icon.
  tintedAccent: "#a6a6a6",
};

// Visual bounds of the glyph inside assets/brand/logo.svg (1024 units).
const GLYPH = { x0: 252, y0: 218, x1: 768, y1: 802 };

// Android adaptive icons: 108dp layers, content kept in the center 66dp.
// We keep the glyph inside a circle of that diameter so round masks never
// clip it, with a little margin.
const SAFE_CIRCLE = 66 / 108;
const SAFE_MARGIN = 0.94;

// Android status bar icon: 24dp with the glyph inside the center 20dp.
const NOTIFICATION_DENSITIES = {
  mdpi: 24,
  hdpi: 36,
  xhdpi: 48,
  xxhdpi: 72,
  xxxhdpi: 96,
};
const NOTIFICATION_FILL = 20 / 24;

const OUT = {
  icon: "assets/images/icon.png",
  iosDark: "assets/images/ios-dark.png",
  iosTinted: "assets/images/ios-tinted.png",
  adaptive: "assets/images/adaptive-icon.png",
  adaptiveBackground: "assets/images/adaptive-background.png",
  monochrome: "assets/images/adaptive-monochrome.png",
  splash: "assets/images/splash-icon.png",
  notificationDir: "assets/images/notification",
};

module.exports = {
  BRAND,
  GLYPH,
  SAFE_CIRCLE,
  SAFE_MARGIN,
  NOTIFICATION_DENSITIES,
  NOTIFICATION_FILL,
  OUT,
};
