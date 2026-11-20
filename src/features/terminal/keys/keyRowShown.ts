import { useSyncExternalStore } from "react";
import { plainStore } from "@/core/storage/kv";

/**
 * Whether the key row (Esc, Tab, arrows...) shows under the terminal. With a
 * hardware keyboard it only takes room, so the tab bar has a button to hide it.
 * Kept across restarts.
 */
const KEY = "keyRowShown";

let shown = true;
const listeners = new Set<() => void>();

void plainStore.get(KEY).then((raw) => {
  if (raw === "false" && shown) {
    shown = false;
    listeners.forEach((l) => l());
  }
});

export const keyRowShown = {
  get: () => shown,
  set(next: boolean) {
    if (next === shown) return;
    shown = next;
    listeners.forEach((l) => l());
    plainStore.set(KEY, String(next)).catch(() => {});
  },
  toggle() {
    keyRowShown.set(!shown);
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useKeyRowShown(): boolean {
  return useSyncExternalStore(
    keyRowShown.subscribe,
    keyRowShown.get,
    keyRowShown.get,
  );
}
