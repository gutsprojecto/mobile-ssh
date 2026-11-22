import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
} from "react-native-reanimated";
import { Check } from "lucide-react-native";
import { Glass } from "./Glass";
import { Text } from "./Text";
import { useThemeColor } from "@/contexts/ThemeContext";

/** How long the copy confirmation stays up. */
const HUD_MS = 1200;
const FADE_MS = 160;

type Hud = { id: number; label: string };
let next = 0;
const listeners = new Set<(hud: Hud) => void>();

/** Shows a short frosted "Copied" in the middle of the screen. */
export function showCopied(label: string) {
  AccessibilityInfo.announceForAccessibility(label);
  const hud = { id: ++next, label };
  listeners.forEach((l) => l(hud));
}

/** Mount once near the root; draws the copy confirmation over everything. */
export function CopiedHud() {
  const [hud, setHud] = useState<Hud | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accent = useThemeColor()("accent-brand");

  useEffect(() => {
    const show = (h: Hud) => {
      setHud(h);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setHud(null), HUD_MS);
    };
    listeners.add(show);
    return () => {
      listeners.delete(show);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
      {hud ? (
        <Animated.View
          key={hud.id}
          entering={FadeIn.duration(FADE_MS).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(FADE_MS).reduceMotion(ReduceMotion.System)}
        >
          <Glass radius={18} intensity={50} style={styles.pill}>
            <Check size={18} color={accent} strokeWidth={2.5} />
            <Text weight="medium" className="text-sm text-foreground">
              {hud.label}
            </Text>
          </Glass>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", zIndex: 2000 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
});
