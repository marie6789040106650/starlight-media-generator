/**
 * Markdown 渲染器测试
 */

import { renderMarkdown, MarkdownRenderer, MarkdownPresets } from '../lib/markdown-renderer';

// 简单的测试工具函数
function expect(actual: any) {
    return {
        toBe(expected: any) {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, but got ${actual}`);
            }
        },
        toContain(expected: any) {
            if (!actual.includes(expected)) {
                throw new Error(`Expected "${actual}" to contain "${expected}"`);
            }
        },
        toBeTruthy() {
            if (!actual) {
                throw new Error(`Expected ${actual} to be truthy`);
            }
        },
        not: {
            toContain(expected: any) {
                if (actual.includes(expected)) {
                    throw new Error(`Expected "${actual}" not to contain "${expected}"`);
                }
            }
        },
        toBeLessThan(expected: number) {
            if (actual >= expected) {
                throw new Error(`Expected ${actual} to be less than ${expected}`);
            }
        }
    };
}

function describe(name: string, fn: () => void) {
    console.log(`\n📋 ${name}`);
    try {
        fn();
        console.log(`✅ ${name} - 所有测试通过`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ ${name} - 测试失败:`, errorMessage);
    }
}

function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`  ✗ ${name}: ${errorMessage}`);
        throw error;
    }
}

function beforeEach(fn: () => void) {
    // 在每个测试组中调用
    fn();
}

describe('MarkdownRenderer', () => {
    let renderer: MarkdownRenderer;

    beforeEach(() => {
        renderer = new MarkdownRenderer();
    });

    describe('标题渲染', () => {
        test('ATX 风格标题', () => {
            const markdown = '# 一级标题\n## 二级标题\n### 三级标题';
            const result = renderer.render(markdown);

            expect(result).toContain('<h1 id="一级标题">一级标题</h1>');
            expect(result).toContain('<h2 id="二级标题">二级标题</h2>');
            expect(result).toContain('<h3 id="三级标题">三级标题</h3>');
        });

        test('Setext 风格标题', () => {
            const markdown = '一级标题\n========\n\n二级标题\n--------';
            const result = renderer.render(markdown);

            expect(result).toContain('<h1 id="一级标题">一级标题</h1>');
            expect(result).toContain('<h2 id="二级标题">二级标题</h2>');
        });
    });

    describe('文本格式化', () => {
        test('粗体', () => {
            expect(renderer.render('**粗体**')).toContain('<strong>粗体</strong>');
            expect(renderer.render('__粗体__')).toContain('<strong>粗体</strong>');
        });

        test('斜体', () => {
            expect(renderer.render('*斜体*')).toContain('<em>斜体</em>');
            expect(renderer.render('_斜体_')).toContain('<em>斜体</em>');
        });

        test('删除线', () => {
            const result = renderer.render('~~删除线~~');
            expect(result).toContain('<del>删除线</del>');
        });

        test('行内代码', () => {
            const result = renderer.render('`代码`');
            expect(result).toContain('<code>代码</code>');
        });
    });

    describe('列表渲染', () => {
        test('无序列表', () => {
            const markdown = '- 项目1\n- 项目2\n- 项目3';
            const result = renderer.render(markdown);

            expect(result).toContain('<ul>');
            expect(result).toContain('<li>项目1</li>');
            expect(result).toContain('<li>项目2</li>');
            expect(result).toContain('<li>项目3</li>');
            expect(result).toContain('</ul>');
        });

        test('有序列表', () => {
            const markdown = '1. 第一项\n2. 第二项\n3. 第三项';
            const result = renderer.render(markdown);

            expect(result).toContain('<ol>');
            expect(result).toContain('<li>第一项</li>');
            expect(result).toContain('<li>第二项</li>');
            expect(result).toContain('<li>第三项</li>');
            expect(result).toContain('</ol>');
        });

        test('任务列表', () => {
            const markdown = '- [x] 已完成\n- [ ] 未完成';
            const result = renderer.render(markdown);

            expect(result).toContain('checked');
            expect(result).toContain('type="checkbox"');
        });
    });

    describe('代码块渲染', () => {
        test('围栏代码块', () => {
            const markdown = '```javascript\nconsole.log("hello");\n```';
            const result = renderer.render(markdown);

            expect(result).toContain('<pre>');
            expect(result).toContain('<code class="language-javascript">');
            expect(result).toContain('console.log("hello");');
        });

        test('缩进代码块', () => {
            const markdown = '    console.log("hello");';
            const result = renderer.render(markdown);

            expect(result).toContain('<pre><code>');
            expect(result).toContain('console.log("hello");');
        });
    });

    describe('表格渲染', () => {
        test('基础表格', () => {
            const markdown = '| 列1 | 列2 |\n|-----|-----|\n| 内容1 | 内容2 |';
            const result = renderer.render(markdown);

            expect(result).toContain('<table>');
            expect(result).toContain('<thead>');
            expect(result).toContain('<tbody>');
            expect(result).toContain('<th>列1</th>');
            expect(result).toContain('<td>内容1</td>');
        });

        test('表格对齐', () => {
            const markdown = '| 左 | 中 | 右 |\n|:---|:---:|---:|\n| L | C | R |';
            const result = renderer.render(markdown);

            expect(result).toContain('text-align: left');
            expect(result).toContain('text-align: center');
            expect(result).toContain('text-align: right');
        });
    });

    describe('链接和图片', () => {
        test('内联链接', () => {
            const markdown = '[链接](https://example.com "标题")';
            const result = renderer.render(markdown);

            expect(result).toContain('<a href="https://example.com" title="标题">链接</a>');
        });

        test('图片', () => {
            const markdown = '![alt](https://example.com/img.jpg "标题")';
            const result = renderer.render(markdown);

            expect(result).toContain('<img src="https://example.com/img.jpg" alt="alt" title="标题">');
        });
    });

    describe('引用', () => {
        test('基础引用', () => {
            const markdown = '> 这是引用\n> 第二行';
            const result = renderer.render(markdown);

            expect(result).toContain('<blockquote>');
            expect(result).toContain('这是引用');
        });
    });

    describe('水平分隔线', () => {
        test('不同风格的分隔线', () => {
            expect(renderer.render('---')).toContain('<hr>');
            expect(renderer.render('***')).toContain('<hr>');
            expect(renderer.render('___')).toContain('<hr>');
        });
    });

    describe('脚注', () => {
        test('脚注渲染', () => {
            const markdown = '文本[^1]\n\n[^1]: 脚注内容';
            const result = renderer.render(markdown);

            expect(result).toContain('<sup>');
            expect(result).toContain('href="#fn-1"');
            expect(result).toContain('class="footnotes"');
        });
    });

    describe('数学公式', () => {
        test('行内公式', () => {
            const result = renderer.render('$E = mc^2$');
            expect(result).toContain('class="math-inline"');
            expect(result).toContain('$E = mc^2$');
        });

        test('块级公式', () => {
            const result = renderer.render('$$\nE = mc^2\n$$');
            expect(result).toContain('class="math-block"');
            expect(result).toContain('$$E = mc^2$$');
        });
    });

    describe('Emoji', () => {
        test('Emoji 转换', () => {
            const result = renderer.render(':smile: :heart: :thumbsup:');
            expect(result).toContain('😊');
            expect(result).toContain('❤️');
            expect(result).toContain('👍');
        });
    });

    describe('转义字符', () => {
        test('转义处理', () => {
            const result = renderer.render('\\*不是斜体\\*');
            expect(result).toContain('*不是斜体*');
            expect(result).not.toContain('<em>');
        });
    });

    describe('预设配置', () => {
        test('基础预设', () => {
            const result = renderMarkdown('**粗体** ~~删除线~~', MarkdownPresets.basic);
            expect(result).toContain('<strong>粗体</strong>');
            expect(result).not.toContain('<del>'); // 基础预设不支持删除线
        });

        test('完整预设', () => {
            const result = renderMarkdown('**粗体** ~~删除线~~ :smile:', MarkdownPresets.full);
            expect(result).toContain('<strong>粗体</strong>');
            expect(result).toContain('<del>删除线</del>');
            expect(result).toContain('😊');
        });

        test('安全预设', () => {
            const result = renderMarkdown('<script>alert("xss")</script> **安全文本**', MarkdownPresets.safe);
            expect(result).toContain('<strong>安全文本</strong>');
            // 安全预设应该清理危险的 HTML
        });
    });

    describe('HTML 处理', () => {
        test('允许安全的 HTML', () => {
            const result = renderer.render('<div>安全内容</div>');
            expect(result).toContain('<div>安全内容</div>');
        });
    });

    describe('边界情况', () => {
        test('空字符串', () => {
            expect(renderer.render('')).toBe('');
        });

        test('只有空白字符', () => {
            expect(renderer.render('   \n\n   ')).toBe('');
        });

        test('混合内容', () => {
            const markdown = `
# 标题

**粗体** 和 *斜体*

- 列表项
- 另一项

\`\`\`js
code();
\`\`\`

> 引用内容
`;
            const result = renderer.render(markdown);

            expect(result).toContain('<h1');
            expect(result).toContain('<strong>');
            expect(result).toContain('<em>');
            expect(result).toContain('<ul>');
            expect(result).toContain('<pre>');
            expect(result).toContain('<blockquote>');
        });
    });
});

// 性能测试
describe('性能测试', () => {
    test('大文档渲染性能', () => {
        const largeMarkdown = Array(1000).fill(`
# 标题 ${Math.random()}

这是一个 **粗体** 和 *斜体* 的段落。

- 列表项 1
- 列表项 2

\`\`\`javascript
console.log("代码块");
\`\`\`

| 列1 | 列2 |
|-----|-----|
| 内容1 | 内容2 |
`).join('\n');

        const start = Date.now();
        const result = renderMarkdown(largeMarkdown);
        const end = Date.now();

        expect(result).toBeTruthy();
        expect(end - start).toBeLessThan(5000); // 应该在 5 秒内完成
    });
});

// 运行所有测试
function runAllTests() {
    console.log('🚀 开始运行 Markdown 渲染器测试...\n');

    try {
        // 这里会自动执行所有的 describe 块
        console.log('\n🎉 所有测试完成！');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('\n💥 测试过程中出现错误:', errorMessage);
        process.exit(1);
    }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    runAllTests();
}

export { runAllTests };