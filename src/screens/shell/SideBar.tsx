import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "expo-router/tabs";
import { Glass, Text } from "@/ui";
import { useThemeColor } from "@/contexts/ThemeContext";
import { useTerminalSessions } from "@/contexts/TerminalSessionsContext";
import { useSessionStatuses } from "@/core/sessions/status";
import { features } from "@/core/features";
import { sessionsMark, TABS } from "@/screens/shell/BottomBar";
import { useWindowInfo } from "@/utils/window-class";
import {
  SIDEBAR_PEEK_WIDTH,
  SIDEBAR_WIDTH,
  shellLayout,
} from "@/screens/shell/layout";
import { t as tr } from "@/i18n";

export { SIDEBAR_WIDTH };
/** The rail on a phone held sideways, where height is short. */
const SHORT_SIDEBAR_WIDTH = 64;

/**
 * Navigation rail for tablets and wide windows. Same tabs as the bottom bar.
 * On iPhone Duo it sits in the column the system keeps for its bars, under the
 * status bar, with the tabs at the bottom like Apple's own vertical tab bars.
 */
export function SideBar({
  state,
  navigation,
  side = "left",
  inBar = false,
  floating = false,
}: BottomTabBarProps & {
  side?: "left" | "right";
  /** Inside the system's bar column, which is as wide as that side's safe area. */
  inBar?: boolean;
  /** Drawn on glass over the terminal: no fill or edge of its own, no insets. */
  floating?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const win = useWindowInfo();
  const { isShort, fold } = win;
  const color = useThemeColor();
  const { sessions } = useTerminalSessions();
  const statuses = useSessionStatuses();
  const accent = color("accent-brand");
  const muted = color("muted-foreground");
  const mark = sessionsMark(
    sessions.map((s) => s.id),
    statuses,
  );

  const edgeInset = side === "left" ? insets.left : insets.right;
  // Bent like a laptop, the tabs stay on the top half with the screens they switch,
  // clear of the keys below the crease.
  const belowCrease =
    shellLayout(win, 0).laptop && fold ? win.height - fold.start : 0;
  const bottom = Math.max(insets.bottom, belowCrease);
  return (
    <View
      className={`items-stretch ${floating ? "" : `border-border bg-sidebar ${side === "left" ? "border-r" : "border-l"}`} ${inBar ? "justify-end" : ""}`}
      style={
        floating
          ? { flex: 1, paddingVertical: 10, paddingHorizontal: 6, gap: 4 }
          : inBar
            ? {
                // The column is the safe area, so the rail fills it and adds nothing.
                width: edgeInset,
                paddingTop: insets.top,
                paddingBottom: bottom + 8,
              }
            : {
                // The notch side inset comes on top of the rail, not out of it.
                width:
                  (isShort ? SHORT_SIDEBAR_WIDTH : SIDEBAR_WIDTH) + edgeInset,
                paddingTop: insets.top + (isShort ? 4 : 8),
                paddingBottom: bottom + (isShort ? 4 : 8),
                paddingHorizontal: 6,
                gap: 4,
                [side === "left" ? "paddingLeft" : "paddingRight"]:
                  edgeInset + 6,
              }
      }
    >
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) return null;
        const focused = state.index === index;
        const tint = focused ? accent : muted;
        const count = route.name === "sessions" ? sessions.length : 0;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={
              count
                ? tr("shell.sideBar.open", { label: tab.label, count })
                : tab.label
            }
            className={`items-center justify-center gap-1 rounded-lg ${focused ? "bg-accent-brand/15" : "hover:bg-muted/40"} ${isShort ? "flex-1" : "py-3"}`}
          >
            <View>
              {tab.icon({ color: tint, size: isShort ? 20 : 22 })}
              {count > 0 ? (
                <View
                  className="absolute -right-3 -top-1.5 min-w-4 items-center px-1"
                  style={{
                    backgroundColor:
                      mark === "failed"
                        ? color("destructive")
                        : mark
                          ? color("warning")
                          : accent,
                  }}
                >
                  <Text
                    weight="bold"
                    className="text-[9px]"
                    style={{ color: color("background") }}
                  >
                    {count}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              weight={focused ? "medium" : "regular"}
              numberOfLines={1}
              className={isShort ? "text-[10px]" : "text-[11px]"}
              style={{ color: tint }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Space around the floating glass rail. */
const FLOAT_GAP = 10;

/** How long the rail stays out on the sessions tab once the pointer has left it. */
const AUTO_HIDE_MS = 5000;

/**
 * The rail for tablets used with a mouse. On the sessions tab it shrinks to a
 * thin strip on the edge so the terminal gets the room; pointing at the strip
 * (or tapping it) brings the rail out over the terminal, and it goes back once
 * the pointer has been away for five seconds while a session is shown. Other
 * tabs show the full rail. It floats over the screens, which pad for it
 * themselves (see sidebarScenePadding), so the terminal never resizes.
 */
export function AutoHideSideBar(
  props: BottomTabBarProps & { side?: "left" | "right" },
) {
  const { state, side = "left" } = props;
  const insets = useSafeAreaInsets();
  const onSessions = state.routes[state.index]?.name === "sessions";
  // Tabs without a terminal (files, tools) keep the rail in place, beside them.
  const pinned = useSessionsRailInset() > 0;
  const [open, setOpen] = useState(false);
  const hovering = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const scheduleHide = () => {
    clearTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      if (!hovering.current) setOpen(false);
    }, AUTO_HIDE_MS);
  };

  // Coming to the sessions tab with the rail out starts the countdown there.
  useEffect(() => {
    if (onSessions && open && !hovering.current) scheduleHide();
    if (!onSessions) clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSessions]);
  useEffect(() => clearTimer, []);

  const expanded = !onSessions || open || pinned;
  // Out over the terminal it floats as a glass pill, clear of the edges.
  const floatingOut = onSessions && open && !pinned;
  const { isShort } = useWindowInfo();
  const railWidth = isShort ? SHORT_SIDEBAR_WIDTH : SIDEBAR_WIDTH;
  const edgeInset = side === "left" ? insets.left : insets.right;
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [side]: 0,
        width:
          (floatingOut
            ? railWidth + 2 * FLOAT_GAP
            : expanded
              ? railWidth
              : SIDEBAR_PEEK_WIDTH) + edgeInset,
        zIndex: 1100,
        elevation: 12,
        // A row, so the rail inside stretches to the full height.
        flexDirection: "row",
      }}
      onPointerEnter={() => {
        hovering.current = true;
        clearTimer();
        setOpen(true);
      }}
      onPointerLeave={() => {
        hovering.current = false;
        if (onSessions) scheduleHide();
      }}
    >
      {floatingOut ? (
        <Glass
          radius={22}
          style={{
            position: "absolute",
            top: insets.top + FLOAT_GAP,
            bottom: insets.bottom + FLOAT_GAP,
            [side]: edgeInset + FLOAT_GAP,
            width: railWidth,
          }}
        >
          <SideBar {...props} side={side} floating />
        </Glass>
      ) : expanded ? (
        <SideBar {...props} side={side} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr("shell.sideBar.showNavigation")}
          onPress={() => {
            setOpen(true);
            scheduleHide();
          }}
          hitSlop={{ [side === "left" ? "right" : "left"]: 10 }}
          className="flex-1 items-center justify-center"
          style={{
            [side === "left" ? "paddingLeft" : "paddingRight"]: edgeInset,
          }}
        >
          {/* A faint, dark line marks where the rail waits. */}
          <View
            className="w-[3px] rounded-full"
            style={{
              height: "40%",
              backgroundColor: "rgba(128, 128, 128, 0.22)",
            }}
          />
        </Pressable>
      )}
    </View>
  );
}

/** Room each screen leaves for the floating rail. The sessions tab only leaves the strip. */
export function sidebarScenePadding(
  routeName: string,
  edgeInset: number,
  isShort: boolean,
) {
  if (routeName === "sessions") return SIDEBAR_PEEK_WIDTH + edgeInset;
  return (isShort ? SHORT_SIDEBAR_WIDTH : SIDEBAR_WIDTH) + edgeInset;
}

/**
 * How far the sessions tab must keep its content clear of the rail: the full
 * rail beside a tab without a terminal (files, tools) or with no tabs open,
 * nothing beside a terminal, where the rail only floats over it on demand.
 */
export function useSessionsRailInset(): number {
  const win = useWindowInfo();
  const { sessions, activeSessionId } = useTerminalSessions();
  const layout = shellLayout(win, 0);
  if (layout.nav !== "side" || layout.railInBar) return 0;
  const active = sessions.find((s) => s.id === activeSessionId);
  if (active && features.sessionHas(active.type, "terminal-input")) return 0;
  return (
    (win.isShort ? SHORT_SIDEBAR_WIDTH : SIDEBAR_WIDTH) - SIDEBAR_PEEK_WIDTH
  );
}
