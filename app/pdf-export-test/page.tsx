'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { FileText, Download, Info, CheckCircle } from 'lucide-react'
import { PDFGenerator, getPDFGenerationInstructions } from '@/lib/export/pdf-generator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

const defaultContent = `# 星光传媒企业方案测试

## 1. 项目概述

这是一个测试PDF导出功能的示例文档，包含了各种格式的内容。

## 2. 功能特点

### 2.1 中文支持
- ✅ 完美支持中文字符显示
- ✅ 支持各种中文标点符号
- ✅ 支持中英文混排

### 2.2 格式支持
- **粗体文本**
- *斜体文本*
- 普通段落文本

## 3. 列表功能

### 有序列表
1. 第一项内容
2. 第二项内容
3. 第三项内容

### 无序列表
- 项目A：重要功能
- 项目B：辅助功能
- 项目C：扩展功能

## 4. 引用内容

> 这是一个引用块的示例，用于展示重要的信息或者客户反馈。
> 引用块可以包含多行内容。

## 5. 代码示例

\`\`\`javascript
// 这是一个代码块示例
function generatePDF() {
  console.log('生成PDF文档');
  return true;
}
\`\`\`

## 6. 总结

通过Word转PDF的方式，我们可以：
- 确保中文字符正确显示
- 保持专业的文档格式
- 支持复杂的样式和布局

---

*本文档由星光传媒专业团队制作*`

// Export configuration component
interface ExportConfigCardProps {
    storeName: string
    setStoreName: (value: string) => void
    filename: string
    setFilename: (value: string) => void
    bannerImage: string
    setBannerImage: (value: string) => void
}

function ExportConfigCard({
    storeName,
    setStoreName,
    filename,
    setFilename,
    bannerImage,
    setBannerImage
}: ExportConfigCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    导出配置
                </CardTitle>
                <CardDescription>
                    配置PDF导出的基本信息
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="storeName">店铺名称</Label>
                    <Input
                        id="storeName"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="输入店铺名称"
                    />
                </div>

                <div>
                    <Label htmlFor="filename">文件名（可选）</Label>
                    <Input
                        id="filename"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        placeholder="自定义文件名.pdf"
                    />
                </div>

                <div>
                    <Label htmlFor="bannerImage">Banner图片URL（可选）</Label>
                    <Input
                        id="bannerImage"
                        value={bannerImage}
                        onChange={(e) => setBannerImage(e.target.value)}
                        placeholder="https://example.com/banner.jpg"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

// Custom hook for export functionality
function useExportHandlers(content: string, storeName: string, bannerImage: string, filename: string) {
    const [isExporting, setIsExporting] = useState(false)

    const validateInput = useCallback(() => {
        if (!content.trim()) {
            toast.error('请输入内容后再导出')
            return false
        }
        if (!storeName.trim()) {
            toast.error('请输入店铺名称')
            return false
        }
        return true
    }, [content, storeName])

    const handleExport = useCallback(async (
        exportType: 'pdf' | 'word',
        exportFn: () => Promise<void>,
        successMessage: string
    ) => {
        if (!validateInput()) return

        setIsExporting(true)

        try {
            await exportFn()
            toast.success(successMessage)
        } catch (error) {
            console.error(`${exportType}导出失败:`, error)
            toast.error(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
        } finally {
            setIsExporting(false)
        }
    }, [validateInput])

    const handlePDFExport = useCallback(async () => {
        const pdfGenerator = new PDFGenerator()

        await handleExport(
            'pdf',
            () => pdfGenerator.generatePDFDocument({
                content,
                storeName,
                bannerImage: bannerImage || null,
                filename: filename || undefined,
                includeWatermark: true
            }),
            'PDF文档已成功生成并下载！'
        )
    }, [content, storeName, bannerImage, filename, handleExport])

    const handleWordExport = useCallback(async () => {
        const pdfGenerator = new PDFGenerator()

        await handleExport(
            'word',
            () => pdfGenerator.generateWordDocument({
                content,
                storeName,
                bannerImage: bannerImage || null,
                filename: filename?.replace(/\.pdf$/i, '.docx') || undefined,
                includeWatermark: true
            }),
            'Word文档已生成并下载！'
        )
    }, [content, storeName, bannerImage, filename, handleExport])

    return {
        isExporting,
        handlePDFExport,
        handleWordExport
    }
}

export default function PDFExportTestPage() {
    const [content, setContent] = useState(defaultContent)
    const [storeName, setStoreName] = useState('星光传媒测试店铺')
    const [filename, setFilename] = useState('')
    const [bannerImage, setBannerImage] = useState('')
    const [showInstructions, setShowInstructions] = useState(false)
    const [pdfServiceStatus, setPdfServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')

    const { isExporting, handlePDFExport, handleWordExport } = useExportHandlers(
        content,
        storeName,
        bannerImage,
        filename
    )

    // 检查PDF服务状态
    useEffect(() => {
        const checkPDFService = async () => {
            try {
                const response = await fetch('/api/generate-pdf', { method: 'GET' })
                if (response.ok) {
                    setPdfServiceStatus('available')
                } else {
                    setPdfServiceStatus('unavailable')
                }
            } catch (error) {
                setPdfServiceStatus('unavailable')
            }
        }

        checkPDFService()
    }, [])

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">PDF导出功能测试</h1>
                <p className="text-muted-foreground">
                    测试基于Word转换的PDF生成功能，确保中文内容正确显示
                </p>
            </div>

            {/* PDF服务状态 */}
            <Alert className={`mb-4 ${pdfServiceStatus === 'available' ? 'border-green-200 bg-green-50' :
                pdfServiceStatus === 'unavailable' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}`}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    <div className="space-y-2">
                        <p><strong>PDF服务状态：</strong>
                            {pdfServiceStatus === 'checking' && <span className="text-blue-600 ml-2">检查中...</span>}
                            {pdfServiceStatus === 'available' && <span className="text-green-600 ml-2">✅ 后端转换可用</span>}
                            {pdfServiceStatus === 'unavailable' && <span className="text-yellow-600 ml-2">⚠️ 后端不可用，将使用Word转换</span>}
                        </p>
                        {pdfServiceStatus === 'available' && (
                            <p className="text-sm text-green-700">支持直接生成PDF文件，无需手动转换</p>
                        )}
                        {pdfServiceStatus === 'unavailable' && (
                            <p className="text-sm text-yellow-700">将生成Word文档，需要手动转换为PDF</p>
                        )}
                    </div>
                </AlertDescription>
            </Alert>

            {/* 说明信息 */}
            <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                    <div className="space-y-2">
                        <p><strong>PDF生成流程：</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>优先使用后端服务直接生成PDF</li>
                            <li>如果后端不可用，生成Word文档供手动转换</li>
                            <li>确保中文内容和格式正确显示</li>
                        </ul>
                    </div>
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 左侧：配置区域 */}
                <div className="space-y-6">
                    <ExportConfigCard
                        storeName={storeName}
                        setStoreName={setStoreName}
                        filename={filename}
                        setFilename={setFilename}
                        bannerImage={bannerImage}
                        setBannerImage={setBannerImage}
                    />

                    {/* 导出按钮 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>导出操作</CardTitle>
                            <CardDescription>
                                选择导出格式
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={handlePDFExport}
                                disabled={isExporting || !content.trim()}
                                className="w-full"
                                size="lg"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                {isExporting ? '生成中...' :
                                    pdfServiceStatus === 'available' ? '直接生成PDF文档' :
                                        pdfServiceStatus === 'unavailable' ? '生成PDF（通过Word转换）' :
                                            '生成PDF文档'}
                            </Button>

                            <Button
                                onClick={handleWordExport}
                                disabled={isExporting || !content.trim()}
                                variant="outline"
                                className="w-full"
                                size="lg"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                {isExporting ? '生成中...' : '直接生成Word文档'}
                            </Button>

                            <Separator />

                            <Button
                                onClick={() => setShowInstructions(!showInstructions)}
                                variant="ghost"
                                className="w-full"
                                size="sm"
                            >
                                <Info className="h-4 w-4 mr-2" />
                                {showInstructions ? '隐藏' : '查看'}转换说明
                            </Button>

                            {showInstructions && (
                                <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
                                    <pre className="whitespace-pre-wrap font-mono text-xs">
                                        {getPDFGenerationInstructions()}
                                    </pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 右侧：内容编辑区域 */}
                <div>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>文档内容</CardTitle>
                            <CardDescription>
                                编辑要导出的Markdown内容
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="输入Markdown格式的内容..."
                                className="min-h-[600px] font-mono text-sm"
                            />
                            <div className="mt-2 text-xs text-muted-foreground">
                                支持Markdown格式：标题、列表、粗体、斜体、代码块、引用等
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 底部提示 */}
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-green-800 mb-1">优势说明</p>
                        <ul className="text-green-700 space-y-1">
                            <li>• 完美支持中文字符，无乱码问题</li>
                            <li>• 保持专业的文档格式和样式</li>
                            <li>• 支持复杂的布局和图片插入</li>
                            <li>• 兼容性好，可在各种设备上正常显示</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}