import { parseShowcaseUrl } from "@/showcase/url";

test("reads the scenario, theme and accent", () => {
  expect(
    parseShowcaseUrl("shellpad://showcase/hosts?theme=nord&accent=3b82f6"),
  ).toEqual({
    scenario: "hosts",
    theme: "nord",
    accent: "#3b82f6",
    video: false,
  });
});

test("falls back to dark and orange", () => {
  expect(parseShowcaseUrl("shellpad://showcase/Terminal")).toEqual({
    scenario: "terminal",
    theme: "dark",
    accent: "#f59145",
    video: false,
  });
  expect(
    parseShowcaseUrl("shellpad://showcase/hosts?theme=nope&accent=zz")?.theme,
  ).toBe("dark");
});

test("video flag", () => {
  expect(parseShowcaseUrl("shellpad://showcase/tour?video=1")?.video).toBe(
    true,
  );
});

test("other links are not showcase links", () => {
  expect(parseShowcaseUrl(null)).toBeNull();
  expect(parseShowcaseUrl("shellpad://dev/terminal-lab")).toBeNull();
  expect(parseShowcaseUrl("https://example.com/showcase/hosts")).toBeNull();
});
