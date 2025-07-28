export interface FontConfig {
  name: string
  fallback: string
  size: number
  bold: boolean
  color: string
  italic?: boolean
}

export interface PageConfig {
  size: string
  orientation: string
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export interface SpacingPairConfig {
  before: number
  after: number
}

export interface SpacingConfig {
  lineHeight: number
  titleSpacing: SpacingPairConfig
  heading1Spacing: SpacingPairConfig
  heading2Spacing: SpacingPairConfig
  heading3Spacing: SpacingPairConfig
  paragraphSpacing: SpacingPairConfig
  captionSpacing: SpacingPairConfig
}

export interface WatermarkConfig {
  enabled: boolean
  type: 'text' | 'image' | 'both'
  text: {
    content: string
    font: FontConfig
    position: {
      rotation: number
      opacity: number
      layout: string
    }
  }
  image: {
    enabled: boolean
    url: string
    width: number
    height: number
    opacity: number
    position: {
      x: string
      y: string
    }
  }
}

export interface HeaderConfig {
  enabled: boolean
  content: string
  font: {
    name: string
    size: number
    bold: boolean
  }
}

export interface FooterConfig {
  enabled: boolean
  includePageNumber: boolean
  font: {
    name: string
    size: number
    bold: boolean
  }
}

export interface TemplateConfig {
  titleFormat: string
  subtitle: string
  footer: string
  date: string
}

export interface StyleConfig {
  document: {
    page: PageConfig
    fonts: {
      title: FontConfig
      subtitle: FontConfig
      heading1: FontConfig
      heading2: FontConfig
      heading3: FontConfig
      body: FontConfig
      emphasis: FontConfig
      footer: FontConfig
      caption: FontConfig
    }
    spacing: SpacingConfig
    indentation: {
      firstLine: number
    }
    alignment: {
      title: string
      subtitle: string
      heading1: string
      heading2: string
      heading3: string
      body: string
      caption: string
      footer: string
    }
  }
  watermark: WatermarkConfig
  pageElements: {
    header: HeaderConfig
    footer: FooterConfig
  }
  templates: {
    default: TemplateConfig
  }
}

// 默认配置 - 按照企业方案Word样式模板规范
const defaultConfig: StyleConfig = {
  document: {
    page: {
      size: "A4",
      orientation: "portrait",
      margins: {
        top: 2.54,    // 上边距 2.54cm
        bottom: 2.54, // 下边距 2.54cm
        left: 3.17,   // 左边距 3.17cm
        right: 3.17   // 右边距 3.17cm
      }
    },
    fonts: {
      title: {
        name: "Source Han Serif SC",  // 思源宋体
        fallback: "Microsoft YaHei",
        size: 18,     // 16-18pt
        bold: true,
        color: "#000000"
      },
      subtitle: {
        name: "Source Han Sans SC",   // 思源黑体
        fallback: "Microsoft YaHei",
        size: 12,
        bold: false,
        italic: false,
        color: "#000000"
      },
      heading1: {
        name: "Source Han Serif SC",  // 一级标题：思源宋体，16-18pt，加粗
        fallback: "Microsoft YaHei",
        size: 16,
        bold: true,
        color: "#000000"
      },
      heading2: {
        name: "Source Han Serif SC",  // 二级标题：思源宋体，14pt，加粗
        fallback: "Microsoft YaHei",
        size: 14,
        bold: true,
        color: "#000000"
      },
      heading3: {
        name: "Source Han Sans SC",   // 三级标题：思源黑体，12pt，加粗
        fallback: "Microsoft YaHei",
        size: 12,
        bold: true,
        color: "#000000"
      },
      body: {
        name: "Source Han Sans SC",   // 正文：思源黑体，11pt，1.5倍行距
        fallback: "Microsoft YaHei",
        size: 11,
        bold: false,
        color: "#000000"
      },
      emphasis: {
        name: "Source Han Sans SC",   // 正文加粗关键字：同正文，11pt，加粗
        fallback: "Microsoft YaHei",
        size: 11,
        bold: true,
        color: "#000000"
      },
      footer: {
        name: "Source Han Sans SC",   // 页脚：思源黑体，10pt
        fallback: "Microsoft YaHei",
        size: 10,
        bold: false,
        italic: false,
        color: "#000000"
      },
      caption: {
        name: "Source Han Sans SC",   // 图注：思源黑体，10pt，居中
        fallback: "Microsoft YaHei",
        size: 10,
        bold: false,
        color: "#000000"
      }
    },
    spacing: {
      lineHeight: 1.5,              // 1.5倍行距
      titleSpacing: {
        before: 12,
        after: 6
      },
      heading1Spacing: {
        before: 12,                 // 一级标题：段前12pt，段后6pt
        after: 6
      },
      heading2Spacing: {
        before: 6,                  // 二级标题：段前6pt，段后4pt
        after: 4
      },
      heading3Spacing: {
        before: 3,                  // 三级标题：段前3pt，段后3pt
        after: 3
      },
      paragraphSpacing: {
        before: 0,                  // 正文：段前0pt，段后6pt
        after: 6
      },
      captionSpacing: {
        before: 3,                  // 图注：段前3pt，段后6pt
        after: 6
      }
    },
    indentation: {
      firstLine: 0.74               // 正文首行缩进2个字符（约0.74cm）
    },
    alignment: {
      title: "center",              // 标题居中
      subtitle: "center",           // 副标题居中
      heading1: "left",             // 一级标题左对齐
      heading2: "left",             // 二级标题左对齐
      heading3: "left",             // 三级标题左对齐
      body: "left",                 // 正文左对齐
      caption: "center",            // 图注居中
      footer: "center"              // 页脚居中
    }
  },
  watermark: {
    enabled: true,
    type: "text",
    text: {
      content: "星光同城传媒 AI 生成",
      font: {
        name: "Source Han Sans SC",
        fallback: "Microsoft YaHei",
        size: 36,
        color: "#E5E7EB",
        bold: false
      },
      position: {
        rotation: -45,
        opacity: 0.3,
        layout: "diagonal"
      }
    },
    image: {
      enabled: false,
      url: "/watermarks/logo.png",
      width: 200,
      height: 100,
      opacity: 0.2,
      position: {
        x: "center",
        y: "center"
      }
    }
  },
  pageElements: {
    header: {
      enabled: true,
      content: "企业方案 Word 样式模板规范文档",  // 页眉内容
      font: {
        name: "Source Han Sans SC",              // 页眉：思源黑体，10pt
        size: 10,
        bold: false
      }
    },
    footer: {
      enabled: true,
      includePageNumber: true,                   // 页脚居中页码，阿拉伯数字
      font: {
        name: "Source Han Sans SC",              // 页脚：思源黑体，10pt
        size: 10,
        bold: false
      }
    }
  },
  templates: {
    default: {
      titleFormat: "企业方案 Word 样式模板规范文档",
      subtitle: "（适用于IP打造、品牌方案、项目规划类文档）",
      footer: "本方案由星光同城传媒AI智能生成 | 专注于服务本地实体商家的IP内容机构",
      date: "撰写日期：{date}"
    }
  }
}

export function loadStyleConfig(): StyleConfig {
  try {
    // 在实际应用中，这里会从配置文件加载
    // 现在返回默认配置
    return defaultConfig
  } catch (error) {
    console.warn('Failed to load style config, using default:', error)
    return defaultConfig
  }
}

export function updateStyleConfig(updates: Partial<StyleConfig>): StyleConfig {
  const currentConfig = loadStyleConfig()
  const newConfig = deepMerge(currentConfig, updates)
  
  try {
    // 在实际应用中，这里会保存到配置文件
    console.log('Style config updated:', newConfig)
    return newConfig
  } catch (error) {
    console.error('Failed to save style config:', error)
    return currentConfig
  }
}

function deepMerge(target: any, source: any): any {
  const result = { ...target }
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  
  return result
}