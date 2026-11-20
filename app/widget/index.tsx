import { Redirect } from "expo-router";

// Bare `shellpad://widget`.
export default function WidgetIndex() {
  return <Redirect href="/(tabs)/hosts" />;
}
