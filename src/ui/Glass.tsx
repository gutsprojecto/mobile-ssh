import { useSyncExternalStore, type RefObject } from "react";
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { BlurTargetView, BlurView } from "expo-blur";
import { useTheme, useUiColors } from "@/contexts/ThemeContext";

/**
 * Frosted glass for ShellPad's floating bars, menus and cards.
 *
 * iOS blurs whatever is behind. Android blurs one registered target view (the
 * terminal stage); a glass surface over anything else, or on Android 11 and
 * older, falls back to the same translucent tint without the blur, so it
 * still reads as glass.
 */

let target: RefObject<View | null> | null = null;
const listeners = new Set<() => void>();

/** The view Android's glass blurs: set by the screen that owns it. */
export const glassTarget = {
  set(ref: RefObject<View | null> | null) {
    if (target === ref) return;
    target = ref;
    listeners.forEach((l) => l());
  },
  get: () => target,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

function useGlassTarget() {
  return useSyncExternalStore(
    glassTarget.subscribe,
    glassTarget.get,
    glassTarget.get,
  );
}

/** Wraps the content glass blurs on Android (no-op elsewhere). */
export const GlassBackdrop = BlurTargetView;

/** The tint and edge glass uses, from the current theme's card color. */
export function useGlassColors() {
  const { isDark } = useTheme();
  const ui = useUiColors();
  const card = ui.card.slice(0, 7);
  return {
    dark: isDark,
    /** Fill over the blur. */
    tint: `${card}9e`,
    /** The same fill where nothing is blurred: a touch more opaque. */
    solid: `${card}db`,
    edge: isDark ? "rgba(255, 255, 255, 0.09)" : "rgba(0, 0, 0, 0.08)",
    /** Keys and buttons sitting on glass. */
    chip: isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.05)",
  };
}

export function Glass({
  radius = 18,
  intensity = 40,
  style,
  children,
  ...props
}: ViewProps & {
  radius?: number;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useGlassColors();
  const blurTarget = useGlassTarget();
  const blurs =
    Platform.OS === "ios" ||
    (Platform.OS === "android" &&
      typeof Platform.Version === "number" &&
      Platform.Version >= 31 &&
      blurTarget !== null);
  const frame: ViewStyle = {
    borderRadius: radius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.edge,
    overflow: "hidden",
  };
  return (
    <View style={[frame, style]} {...props}>
      {blurs ? (
        <BlurView
          tint={colors.dark ? "dark" : "light"}
          intensity={intensity}
          blurMethod="dimezisBlurViewSdk31Plus"
          blurTarget={blurTarget ?? undefined}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: blurs ? colors.tint : colors.solid },
        ]}
      />
      {children}
    </View>
  );
}
