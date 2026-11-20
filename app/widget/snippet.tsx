import { Redirect } from "expo-router";

// `shellpad://widget/snippet?snippetId=...`
// useWidgetDeepLink resolves the snippet and shows the run sheet.
export default function WidgetSnippet() {
  return <Redirect href="/(tabs)/hosts" />;
}
