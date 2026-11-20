import {
  Platform,
  Text as RNText,
  type TextProps as RNTextProps,
} from "react-native";
import {
  MONO_FONT,
  MONO_FONT_BOLD,
  MONO_FONT_MEDIUM,
  UI_FONT,
  UI_FONT_BOLD,
  UI_FONT_MEDIUM,
} from "@/constants/fonts";
import { textScale, useUiPrefs } from "@/core/ui-prefs";
import { scaledTextStyle } from "./text-scale";

export type TextWeight = "regular" | "medium" | "bold";

export interface ThemedTextProps extends RNTextProps {
  weight?: TextWeight;
  /** Tailwind classes (color, size, etc.). Defaults to foreground. */
  className?: string;
}

// Android reserves extra space above/below the glyphs from the font metrics,
// which makes text sit off centre inside fixed-height rows and buttons.
const FONT_PADDING = Platform.select({
  android: { includeFontPadding: false },
});

/**
 * System text size is capped here, since the app's own text size setting
 * scales on top of it and rows would stop fitting the screen.
 */
export const MAX_FONT_SCALE = 2;

const FONT_BY_WEIGHT: Record<TextWeight, string> = {
  regular: UI_FONT,
  medium: UI_FONT_MEDIUM,
  bold: UI_FONT_BOLD,
};

const MONO_BY_WEIGHT: Record<TextWeight, string> = {
  regular: MONO_FONT,
  medium: MONO_FONT_MEDIUM,
  bold: MONO_FONT_BOLD,
};

/**
 * App-wide text in Inter, or JetBrains Mono with `font-mono` in className
 * (code, addresses, logs). Defaults to the theme foreground color. Use `weight` for medium/bold since RN cannot synthesize
 * weights for custom fonts.
 */
export function Text({
  weight = "regular",
  className,
  style,
  ...props
}: ThemedTextProps) {
  const { textSize } = useUiPrefs();
  const scaled = scaledTextStyle(className, textScale(textSize));
  return (
    <RNText
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      className={`text-foreground ${className ?? ""}`}
      style={[
        {
          fontFamily: (className?.includes("font-mono")
            ? MONO_BY_WEIGHT
            : FONT_BY_WEIGHT)[weight],
        },
        FONT_PADDING,
        scaled,
        style,
      ]}
      {...props}
    />
  );
}
