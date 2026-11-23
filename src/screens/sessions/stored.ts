import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SPLIT_RATIO_KEY = "sessions.splitRatio";

/** A number kept across launches, or null when none was saved. */
export function useStoredNumber(
  key: string,
): [number | null, (value: number | null) => void] {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    setValue(null);
    AsyncStorage.getItem(key)
      .then((v) => {
        const n = v == null ? NaN : Number(v);
        if (live && Number.isFinite(n)) setValue(n);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [key]);

  const set = useCallback(
    (next: number | null) => {
      setValue(next);
      (next == null
        ? AsyncStorage.removeItem(key)
        : AsyncStorage.setItem(key, String(next))
      ).catch(() => {});
    },
    [key],
  );

  return [value, set];
}
