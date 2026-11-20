import { View } from "react-native";
import { router } from "expo-router";
import { Bell, Search, SquareTerminal } from "lucide-react-native";
import { useThemeColor } from "@/contexts/ThemeContext";
import { useActiveClient, type Account } from "@/core/accounts";
import { useUnreadAlerts } from "@/screens/notifications/unread";
import { palette } from "@/screens/palette/store";
import { Button, Text } from "@/ui";
import { deviceWord } from "@/utils/device-word";
import { t } from "@/i18n";

const STATUS: Record<string, string> = {
  idle: t("shell.appHeader.signedIn"),
  syncing: "Syncing",
  offline: "Offline",
  error: t("shell.appHeader.error"),
  signed_out: t("shell.appHeader.signedOut"),
};

/** One short line under the account name. */
export function accountLine(account: Account): string {
  if (account.kind === "local") return t("shell.appHeader.worksWithoutAServer");
  return [
    STATUS[account.status],
    account.options.sync === true
      ? t("shell.appHeader.copyOnThis", { deviceWord })
      : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

/**
 * The app name on the left of a screen header. ShellPad keeps everything on
 * this device, so there is no account to switch.
 */
export function AccountButton() {
  const color = useThemeColor();
  return (
    <View className="flex-row items-center gap-2" accessibilityRole="header">
      <SquareTerminal size={20} color={color("accent-brand")} />
      <Text
        weight="bold"
        className="shrink text-title text-foreground"
        numberOfLines={1}
      >
        ShellPad
      </Text>
    </View>
  );
}

/** Opens the search and command palette. */
export function SearchButton() {
  const color = useThemeColor();
  return (
    <Button
      variant="ghost"
      size="icon"
      accessibilityLabel={t("shell.appHeader.search")}
      onPress={palette.open}
      icon={<Search size={18} color={color("muted-foreground")} />}
    />
  );
}

/** Opens the notifications inbox, with the unread count on it. */
export function NotificationsButton() {
  const color = useThemeColor();
  const client = useActiveClient();
  const unread = useUnreadAlerts();
  if (!client || !client.api.alerts.available()) return null;
  return (
    <View>
      <Button
        variant="ghost"
        size="icon"
        accessibilityLabel={
          unread > 0
            ? t("shell.appHeader.notificationsUnread", { unread })
            : t("shell.appHeader.notifications")
        }
        onPress={() => router.push("/tabs/settings/Notifications" as never)}
        icon={<Bell size={18} color={color("muted-foreground")} />}
      />
      {unread > 0 ? (
        <View
          pointerEvents="none"
          className="absolute right-0.5 top-0.5 min-w-4 items-center bg-accent-brand px-1"
        >
          <Text weight="bold" className="text-2xs text-background">
            {unread > 99 ? "99+" : String(unread)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
