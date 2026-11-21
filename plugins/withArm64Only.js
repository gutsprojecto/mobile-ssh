const { withGradleProperties } = require("@expo/config-plugins");
const { setProperties } = require("./withFdroid");

// ShellPad runs on ARM tablets and phones. x86_64 is only for emulators and
// doubled the APK (~49 MB). Build an emulator APK with
// `./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,x86_64`.
const withArm64Only = (config) =>
  withGradleProperties(config, (c) => {
    c.modResults = setProperties(c.modResults, {
      reactNativeArchitectures: "arm64-v8a",
    });
    return c;
  });

module.exports = withArm64Only;
