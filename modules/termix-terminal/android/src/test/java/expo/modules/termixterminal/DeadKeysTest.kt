package expo.modules.termixterminal

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class DeadKeysTest {
  @Test
  fun composesUmlauts() {
    assertEquals('ü'.code, DeadKeys.compose(0xA8, 'u'.code))
    assertEquals('Ö'.code, DeadKeys.compose(0xA8, 'O'.code))
    assertEquals('é'.code, DeadKeys.compose(0xB4, 'e'.code))
  }

  @Test
  fun acceptsCombiningAccents() {
    assertEquals('ä'.code, DeadKeys.compose(0x308, 'a'.code))
  }

  @Test
  fun noCharacterForOtherKeys() {
    assertEquals(0, DeadKeys.compose(0xA8, 'q'.code))
    assertEquals(0, DeadKeys.compose(0xA8, ' '.code))
    assertEquals(0, DeadKeys.compose(0xA8, '2'.code))
    assertEquals(0, DeadKeys.compose('x'.code, 'u'.code))
  }

  @Test
  fun onlyRareAccentsWait() {
    assertTrue(DeadKeys.waitsForLetter(0xA8))
    assertFalse(DeadKeys.waitsForLetter('`'.code))
    assertFalse(DeadKeys.waitsForLetter('^'.code))
    assertEquals(0xA8, DeadKeys.spacing(0x308))
  }
}
