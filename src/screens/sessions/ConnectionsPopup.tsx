import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  ReduceMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConnectionsPanel } from "@/screens/sessions/ConnectionsPanel";
import { Glass } from "@/ui/Glass";
import { useWindowInfo } from "@/utils/window-class";
import { getButtonSize } from "@/utils/responsive";
import { t } from "@/i18n";

const OPEN_MS = 180;
const CLOSE_MS = 140;
/** Space between the popup and the dock, and the dock's own side gap. */
const GAP = 8;

/**
 * The open connections in a small frosted card above the dock's Connections
 * button. As tall as its rows, about three times as wide as the dock's three
 * buttons. A click anywhere else closes it.
 */
export function ConnectionsPopup({
  open,
  onClose,
  left,
  bottom,
}: {
  open: boolean;
  onClose: () => void;
  /** Left edge of the dock in the stage. */
  left: number;
  /** Top edge of the dock, from the bottom of the stage. */
  bottom: number;
}) {
  const { isLandscape, isShort } = useWindowInfo();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const button = getButtonSize(isLandscape, 44, isShort);
  const buttonGap = isLandscape ? 4 : 6;
  const width = Math.min(
    3 * (3 * button + 2 * buttonGap),
    window.width - left - 2 * GAP,
  );
  const maxHeight = Math.max(
    160,
    (window.height - bottom - insets.top - 3 * GAP) * 0.75,
  );

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { zIndex: 1010 }]}
    >
      {open ? (
        <Animated.View
          entering={FadeIn.duration(OPEN_MS).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(CLOSE_MS).reduceMotion(ReduceMotion.System)}
          style={StyleSheet.absoluteFill}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t("sessions.connectionsPanel.close")}
          />
        </Animated.View>
      ) : null}
      {open ? (
        <Animated.View
          entering={FadeInUp.duration(OPEN_MS).reduceMotion(
            ReduceMotion.System,
          )}
          exiting={FadeOutDown.duration(CLOSE_MS).reduceMotion(
            ReduceMotion.System,
          )}
          style={{
            position: "absolute",
            left: left + GAP,
            bottom: bottom + GAP,
            width,
            maxHeight,
          }}
        >
          <Glass radius={18} intensity={50} style={{ maxHeight }}>
            <ConnectionsPanel popup onClose={onClose} />
          </Glass>
        </Animated.View>
      ) : null}
    </View>
  );
}
