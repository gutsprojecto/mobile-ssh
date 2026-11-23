package expo.modules.termixterminal

import java.text.Normalizer

/**
 * Accents that combine with the next letter, like ¨ then u for ü. Android text fields do this
 * themselves; a terminal only sees the characters, so the view does it here.
 */
internal object DeadKeys {
  // Spacing accent → combining accent.
  private val COMBINING = mapOf(
    0xA8 to 0x308, // ¨
    0xB4 to 0x301, // ´
    0x60 to 0x300, // `
    0x5E to 0x302, // ^
    0x7E to 0x303, // ~
    0xB8 to 0x327, // ¸
    0x2C7 to 0x30C, // ˇ
    0x2D8 to 0x306, // ˘
    0x2DA to 0x30A, // ˚
  )
  private val SPACING = COMBINING.entries.associate { (spacing, combining) -> combining to spacing }

  /**
   * Accents that wait for a letter even when typed as a plain character. Only ones a shell
   * hardly needs on their own: ` ^ ~ stay as they are.
   */
  fun waitsForLetter(c: Int): Boolean = c == 0xA8 || c == 0xB4

  /** [accent] (spacing or combining) on [c], or 0 when there is no such character. */
  fun compose(accent: Int, c: Int): Int {
    val combining = COMBINING[accent] ?: accent.takeIf { it in 0x300..0x36F } ?: return 0
    if (!Character.isLetter(c)) return 0
    val text = Normalizer.normalize(
      String(Character.toChars(c)) + String(Character.toChars(combining)),
      Normalizer.Form.NFC,
    )
    return if (text.codePointCount(0, text.length) == 1) text.codePointAt(0) else 0
  }

  /** The accent as a character of its own. */
  fun spacing(accent: Int): Int = SPACING[accent] ?: accent
}
