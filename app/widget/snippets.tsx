import { Redirect } from "expo-router";

// `shellpad://widget/snippets` - the snippets list.
export default function WidgetSnippets() {
  return <Redirect href="/(tabs)/hosts" />;
}
