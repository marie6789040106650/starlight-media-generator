export const PDF_CONSTANTS = {
  PAGE_HEIGHT: 297, // A4 height in mm
  PAGE_WIDTH: 210,  // A4 width in mm
  MARGIN: 20,
  LINE_HEIGHT: 7,
  FONT_SIZES: {
    HEADER: 10,
    H1: 18,
    H2: 16,
    H3: 14,
    BODY: 11,
    CODE: 10,
    FOOTER: 10
  },
  COLORS: {
    BLACK: [0, 0, 0] as [number, number, number],
    GRAY: [100, 100, 100] as [number, number, number],
    LIGHT_GRAY: [150, 150, 150] as [number, number, number],
    BORDER_GRAY: [200, 200, 200] as [number, number, number],
    CODE_BACKGROUND: [245, 245, 245] as [number, number, number]
  },
  SPACING: {
    PARAGRAPH: 3,
    HEADING_TOP: {
      H1: 10,
      H2: 8,
      H3: 6
    },
    HEADING_BOTTOM: 5,
    LIST_ITEM: 3,
    BLOCKQUOTE: 5,
    CODE_BLOCK: 8,
    SEPARATOR: 10
  }
} as const

export const EMOJI_REPLACEMENTS = {
  '⚠️': '警告',
  '✅': '完成',
  '❌': '错误',
  '📝': '笔记',
  '📌': '重点',
  '🔍': '搜索',
  '🚀': '启动',
  '💡': '提示',
  '⭐': '星级',
  '👍': '赞同'
} as const