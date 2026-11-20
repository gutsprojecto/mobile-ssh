const { applyFdroid } = require("./scripts/fdroid.cjs");

// Firebase config for Android push, passed in as a file variable.
// Without it the app builds, minus push. The bundled google-services.json is
// upstream Termix's package, so ShellPad never reads it.
function withFirebase(config) {
  const file = process.env.GOOGLE_SERVICES_JSON || null;
  if (!file) return config;
  return {
    ...config,
    android: { ...config.android, googleServicesFile: file },
  };
}

// app.json is the config. TERMIX_FDROID=1 builds the F-Droid variant.
module.exports = ({ config }) =>
  process.env.TERMIX_FDROID === "1"
    ? applyFdroid(config)
    : withFirebase(config);
