import { Tabs, usePathname } from "expo-router";
import { useTerminalSessions } from "@/contexts/TerminalSessionsContext";
import { BottomBar, TABS } from "@/screens/shell/BottomBar";
import { shellLayout } from "@/screens/shell/layout";
import {
  AutoHideSideBar,
  SideBar,
  sidebarScenePadding,
} from "@/screens/shell/SideBar";
import { BottomBarShown, SideBarShown } from "@/ui/bottom-inset";
import { useWindowInfo } from "@/utils/window-class";
import { useUiColors } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { sessions } = useTerminalSessions();
  const pathname = usePathname();
  const win = useWindowInfo();
  const layout = shellLayout(win, 0);
  const isWide = layout.nav === "side";
  const { railSide, railInBar } = layout;
  const insets = useSafeAreaInsets();
  const ui = useUiColors();
  // A rail of its own (not the Duo bar column) floats and hides on the sessions tab.
  const floatingRail = isWide && !railInBar;

  // Phones hide the bar on a full screen session. Tablets keep the sidebar, and
  // so does a Duo, whose bar column stays the system's either way.
  const hideTabBar =
    layout.fullScreenSessions &&
    !layout.tabsInSessions &&
    pathname === "/sessions" &&
    sessions.length > 0;

  return (
    <BottomBarShown.Provider value={!isWide && !hideTabBar}>
      <SideBarShown.Provider value={isWide && !hideTabBar ? railSide : null}>
        <Tabs
          // Keep the default detach. With it off, inactive tabs get display none and
          // Fabric deletes their native views, so terminals came back empty.
          tabBar={
            hideTabBar
              ? () => null
              : floatingRail
                ? (props) => <AutoHideSideBar {...props} side={railSide} />
                : isWide
                  ? (props) => (
                      <SideBar {...props} side={railSide} inBar={railInBar} />
                    )
                  : (props) => <BottomBar {...props} />
          }
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarPosition: isWide ? railSide : "bottom",
            ...(floatingRail && !hideTabBar
              ? {
                  sceneStyle: {
                    // The strip beside the floating rail shows the theme, never white.
                    backgroundColor: ui.background,
                    [railSide === "left" ? "paddingLeft" : "paddingRight"]:
                      sidebarScenePadding(
                        route.name,
                        railSide === "left" ? insets.left : insets.right,
                        win.isShort,
                      ),
                  },
                }
              : {}),
          })}
        >
          {TABS.map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{ title: tab.label }}
            />
          ))}
        </Tabs>
      </SideBarShown.Provider>
    </BottomBarShown.Provider>
  );
}
