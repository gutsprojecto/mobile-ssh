package expo.modules.termixterminal

/**
 * Finds a web address under a tapped cell. iOS has the same rules in TermixLinkFinder.swift.
 */
internal object LinkFinder {
  private val URL = Regex(
    "(?:https?|ftp)://[^\\s<>\"'`{}|\\\\^]+|www\\.[^\\s<>\"'`{}|\\\\^]+",
    RegexOption.IGNORE_CASE
  )

  // Punctuation that usually ends a sentence, not the address.
  private const val TRAILING = ".,;:!?'\")]}>"

  /**
   * [cells] holds each cell's text: " " for a blank cell and "" for the second half of a wide
   * character. Returns the address covering [col], or null.
   */
  fun find(cells: List<String>, col: Int): String? {
    if (col < 0 || col >= cells.size) return null
    val text = StringBuilder()
    val cellOfChar = ArrayList<Int>()
    for ((i, cell) in cells.withIndex()) {
      for (ch in cell) cellOfChar.add(i)
      text.append(cell)
    }
    for (match in URL.findAll(text)) {
      var end = match.range.last
      while (end > match.range.first && TRAILING.indexOf(text[end]) >= 0 && !keepsBracket(text, match.range.first, end)) {
        end--
      }
      val first = cellOfChar[match.range.first]
      var last = cellOfChar[end]
      // A wide last character also covers its spacer cell.
      while (last + 1 < cells.size && cells[last + 1].isEmpty()) last++
      if (col in first..last) {
        val url = text.substring(match.range.first, end + 1)
        return if (url.startsWith("www.", ignoreCase = true)) "https://$url" else url
      }
    }
    return null
  }

  /**
   * [find] across soft wrapped rows: a long address that fills a row to the last column goes on
   * at the start of the next one. [rows] holds each viewport row's cells, null when unknown.
   * Rows with a tmux pane border are never joined, the next row may belong to another pane.
   */
  fun findWrapped(rows: List<List<String>?>, row: Int, col: Int): String? =
    findWrapped(rows.size, row, col) { rows[it] }

  /** [findWrapped] reading rows on demand, so only the rows around [row] are built. */
  fun findWrapped(rowCount: Int, row: Int, col: Int, rowAt: (Int) -> List<String>?): String? {
    val cache = HashMap<Int, List<String>?>()
    val rows = { r: Int -> cache.getOrPut(r) { rowAt(r) } }
    val here = rows(row) ?: return null
    var first = row
    while (first > 0 && row - first < MAX_WRAP_ROWS && joins(rows(first - 1), rows(first))) first--
    var last = row
    while (last + 1 < rowCount && last - row < MAX_WRAP_ROWS && joins(rows(last), rows(last + 1))) last++
    if (first == last) return find(here, col)
    val cells = ArrayList<String>()
    var offset = col
    for (r in first..last) {
      val cellsOfRow = rows(r)!!
      if (r < row) offset += cellsOfRow.size
      cells.addAll(cellsOfRow)
    }
    return find(cells, offset)
  }

  private const val MAX_WRAP_ROWS = 8
  private const val PANE_BORDER = '│'

  private fun joins(upper: List<String>?, lower: List<String>?): Boolean {
    if (upper.isNullOrEmpty() || lower.isNullOrEmpty()) return false
    // "" is the second half of a wide character, so the row is still full.
    if (upper.last() == " " || lower.first() == " " || lower.first().isEmpty()) return false
    return upper.none { PANE_BORDER in it } && lower.none { PANE_BORDER in it }
  }

  /** [find] on plain text where every character is one column. */
  fun findInText(line: String, col: Int): String? = find(line.map { it.toString() }, col)

  // Keeps a closing bracket that matches one inside the address, like a wiki link.
  private fun keepsBracket(text: CharSequence, start: Int, end: Int): Boolean {
    val open = when (text[end]) {
      ')' -> '('
      ']' -> '['
      '}' -> '{'
      else -> return false
    }
    var opens = 0
    var closes = 0
    for (i in start..end) {
      if (text[i] == open) opens++
      if (text[i] == text[end]) closes++
    }
    return opens >= closes
  }
}
