import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useStoredNumber } from "@/screens/sessions/stored";

beforeEach(() => AsyncStorage.clear());

test("a stored number survives a restart and can be cleared", async () => {
  const first = await renderHook(() => useStoredNumber("test.width"));
  expect(first.result.current[0]).toBeNull();
  await act(async () => first.result.current[1](420));
  expect(await AsyncStorage.getItem("test.width")).toBe("420");

  const next = await renderHook(() => useStoredNumber("test.width"));
  await waitFor(() => expect(next.result.current[0]).toBe(420));
  await act(async () => next.result.current[1](null));
  expect(await AsyncStorage.getItem("test.width")).toBeNull();
});
