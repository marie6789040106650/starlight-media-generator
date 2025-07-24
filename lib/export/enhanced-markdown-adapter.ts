/**
 * 增强 Markdown 渲染器适配器
 * 确保新的渲染器与现有的导出系统兼容
 */

import { renderMarkdown, MarkdownPresets } from '../markdown-renderer';
import { parseMarkdownContent, ParsedContent } from './markdown-parser';

export interface ExportCompatibleContent {
    /** 原始 Markdown 内容 */
    rawMarkdown: string;
    /** 渲染后的 HTML 内容 */
    renderedHtml: string;
    /** 解析后的结构化内容（用于 Word 导出） */
    parsedContent: ParsedContent[];
    /** 内容统计信息 */
    stats: {
        lines: number;
        words: number;
        characters: number;
        headings: number;
        lists: number;
        tables: number;
        codeBlocks: number;
    };
}

/**
 * 将 Markdown 内容转换为导出兼容格式
 */
export function prepareContentForExport(
    markdown: string,
    options: {
        enableMath?: boolean;
        enableSyntaxHighlight?: boolean;
        preset?: keyof typeof MarkdownPresets;
    } = {}
): ExportCompatibleContent {
    const {
        enableMath = true,
        enableSyntaxHighlight = true,
        preset = 'full'
    } = options;

    // 使用新的渲染器生成 HTML
    const renderedHtml = renderMarkdown(markdown, {
        ...MarkdownPresets[preset],
        math: enableMath,
        highlight: enableSyntaxHighlight
    });

    // 使用现有的解析器生成结构化内容（用于 Word 导出）
    const parsedContent = parseMarkdownContent(markdown);

    // 计算统计信息
    const stats = calculateContentStats(markdown, parsedContent);

    return {
        rawMarkdown: markdown,
        renderedHtml,
        parsedContent,
        stats
    };
}

/**
 * 计算内容统计信息
 */
function calculateContentStats(markdown: string, parsedContent: ParsedContent[]) {
    const lines = markdown.split('\n').length;
    const words = markdown.split(/\s+/).filter(word => word.length > 0).length;
    const characters = markdown.length;

    let headings = 0;
    let lists = 0;
    let tables = 0;
    let codeBlocks = 0;

    parsedContent.forEach(item => {
        switch (item.type) {
            case 'heading':
                headings++;
                break;
            case 'list':
                lists++;
                break;
            case 'table':
                tables++;
                break;
            case 'codeblock':
                codeBlocks++;
                break;
        }
    });

    return {
        lines,
        words,
        characters,
        headings,
        lists,
        tables,
        codeBlocks
    };
}

/**
 * 验证内容是否适合导出
 */
export function validateContentForExport(content: ExportCompatibleContent): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
} {
    const warnings: string[] = [];
    const errors: string[] = [];

    // 检查内容长度
    if (content.stats.characters === 0) {
        errors.push('内容为空，无法导出');
    }

    if (content.stats.characters > 100000) {
        warnings.push('内容较长，导出可能需要更多时间');
    }

    // 检查复杂元素
    if (content.stats.tables > 10) {
        warnings.push('包含大量表格，可能影响导出性能');
    }

    if (content.stats.codeBlocks > 20) {
        warnings.push('包含大量代码块，可能影响导出格式');
    }

    // 检查特殊字符
    const hasSpecialChars = /[^\u0020-\u007E\u4E00-\u9FFF]/.test(content.rawMarkdown);
    if (hasSpecialChars) {
        warnings.push('内容包含特殊字符，导出时可能被替换');
    }

    return {
        isValid: errors.length === 0,
        warnings,
        errors
    };
}

/**
 * 为 Word 导出优化内容
 */
export function optimizeContentForWord(content: ExportCompatibleContent): ExportCompatibleContent {
    // 清理可能导致 Word 导出问题的内容
    let optimizedMarkdown = content.rawMarkdown;

    // 替换可能有问题的字符
    optimizedMarkdown = optimizedMarkdown
        .replace(/[""]/g, '"')  // 统一引号
        .replace(/['']/g, "'")  // 统一撇号
        .replace(/…/g, '...')   // 替换省略号
        .replace(/–/g, '-')     // 替换短横线
        .replace(/—/g, '--');   // 替换长横线

    // 重新解析优化后的内容
    const optimizedParsedContent = parseMarkdownContent(optimizedMarkdown);
    const optimizedStats = calculateContentStats(optimizedMarkdown, optimizedParsedContent);

    return {
        ...content,
        rawMarkdown: optimizedMarkdown,
        parsedContent: optimizedParsedContent,
        stats: optimizedStats
    };
}

/**
 * 为 PDF 导出优化内容
 */
export function optimizeContentForPDF(content: ExportCompatibleContent): ExportCompatibleContent {
    // PDF 导出通常通过 Word 转换，所以先进行 Word 优化
    let optimizedContent = optimizeContentForWord(content);

    // PDF 特定的优化
    let optimizedMarkdown = optimizedContent.rawMarkdown;

    // 确保分页符正确处理
    optimizedMarkdown = optimizedMarkdown.replace(/\n{3,}/g, '\n\n');

    // 重新解析
    const optimizedParsedContent = parseMarkdownContent(optimizedMarkdown);
    const optimizedStats = calculateContentStats(optimizedMarkdown, optimizedParsedContent);

    return {
        ...optimizedContent,
        rawMarkdown: optimizedMarkdown,
        parsedContent: optimizedParsedContent,
        stats: optimizedStats
    };
}

/**
 * 生成导出预览信息
 */
export function generateExportPreview(content: ExportCompatibleContent): {
    title: string;
    summary: string;
    structure: Array<{
        type: string;
        title: string;
        level?: number;
        itemCount?: number;
    }>;
} {
    // 提取标题作为文档标题
    const firstHeading = content.parsedContent.find(item => item.type === 'heading');
    const title = firstHeading ? firstHeading.text : '未命名文档';

    // 生成摘要
    const summary = `包含 ${content.stats.headings} 个标题、${content.stats.lists} 个列表、${content.stats.tables} 个表格和 ${content.stats.codeBlocks} 个代码块的文档，共 ${content.stats.words} 个词。`;

    // 生成结构信息
    const structure = content.parsedContent
        .filter(item => ['heading', 'list', 'table', 'codeblock'].includes(item.type))
        .map(item => {
            switch (item.type) {
                case 'heading':
                    return {
                        type: '标题',
                        title: item.text,
                        level: item.level
                    };
                case 'list':
                    return {
                        type: '列表',
                        title: `${item.items?.length || 0} 个项目`,
                        itemCount: item.items?.length
                    };
                case 'table':
                    return {
                        type: '表格',
                        title: `${item.tableHeaders?.length || 0} 列 × ${item.tableRows?.length || 0} 行`
                    };
                case 'codeblock':
                    return {
                        type: '代码块',
                        title: item.language || '未指定语言'
                    };
                default:
                    return {
                        type: '其他',
                        title: item.text.substring(0, 50) + (item.text.length > 50 ? '...' : '')
                    };
            }
        });

    return {
        title,
        summary,
        structure
    };
}