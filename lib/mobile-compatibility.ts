/**
 * 手机浏览器兼容性检查和优化
 * 针对移动设备的特殊处理
 */

export interface MobileCompatibility {
    isMobile: boolean
    isIOS: boolean
    isAndroid: boolean
    canvasSupport: boolean
    blobSupport: boolean
    downloadSupport: boolean
    memoryLimited: boolean
    recommendedMaxPages: number
}

/**
 * 检测移动设备和浏览器兼容性
 */
export function checkMobileCompatibility(): MobileCompatibility {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''

    // 检测移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroid = /Android/.test(userAgent)

    // 检测核心API支持
    const canvasSupport = typeof window !== 'undefined' && 'HTMLCanvasElement' in window
    const blobSupport = typeof window !== 'undefined' && 'Blob' in window

    // 检测下载支持（移动端可能有限制）
    const downloadSupport = typeof document !== 'undefined' && 'createElement' in document

    // 内存限制检测（移动设备通常内存较小）
    const memoryLimited = isMobile || (typeof navigator !== 'undefined' &&
        navigator.deviceMemory !== undefined && navigator.deviceMemory < 4)

    // 根据设备推荐最大页数
    let recommendedMaxPages = 50 // 桌面端默认
    if (isMobile) {
        recommendedMaxPages = isIOS ? 20 : 15 // iOS稍好一些
    }

    return {
        isMobile,
        isIOS,
        isAndroid,
        canvasSupport,
        blobSupport,
        downloadSupport,
        memoryLimited,
        recommendedMaxPages
    }
}

/**
 * 获取移动端优化的html2canvas配置
 */
export function getMobileCanvasConfig(isMobile: boolean, memoryLimited: boolean) {
    if (!isMobile) {
        // 桌面端高质量配置
        return {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123
        }
    }

    // 移动端优化配置
    return {
        scale: memoryLimited ? 1 : 1.5, // 降低缩放比例节省内存
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        // 移动端特殊优化
        logging: false, // 关闭日志节省内存
        removeContainer: true, // 自动清理临时容器
        imageTimeout: 15000, // 增加图片加载超时时间
        onclone: (clonedDoc: Document) => {
            // 移除可能导致问题的元素
            const scripts = clonedDoc.querySelectorAll('script')
            scripts.forEach(script => script.remove())
        }
    }
}

/**
 * 移动端文件下载处理
 */
export function handleMobileDownload(blob: Blob, filename: string, isIOS: boolean) {
    if (isIOS) {
        // iOS Safari 特殊处理
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename

        // iOS需要用户手动触发下载
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 延迟释放URL
        setTimeout(() => URL.revokeObjectURL(url), 1000)

        return {
            success: true,
            message: 'iOS设备：请在弹出的页面中长按保存文件'
        }
    } else {
        // Android和其他移动浏览器
        try {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            link.click()
            URL.revokeObjectURL(url)

            return {
                success: true,
                message: '文件下载已开始'
            }
        } catch (error) {
            return {
                success: false,
                message: '下载失败，请尝试使用桌面浏览器'
            }
        }
    }
}

/**
 * 移动端内存优化的分页处理
 */
export function optimizePagesForMobile(pages: NodeListOf<Element>, maxPages: number) {
    if (pages.length <= maxPages) {
        return Array.from(pages)
    }

    // 如果页数过多，提示用户
    const shouldContinue = confirm(
        `检测到${pages.length}页内容，移动设备建议不超过${maxPages}页。\n` +
        `继续导出可能导致浏览器崩溃或内存不足。\n\n` +
        `是否继续？（建议在桌面端导出大文档）`
    )

    if (!shouldContinue) {
        throw new Error('用户取消导出')
    }

    return Array.from(pages)
}

/**
 * 检查移动端特定限制
 */
export function checkMobileLimitations(): {
    warnings: string[]
    canExport: boolean
} {
    const compat = checkMobileCompatibility()
    const warnings: string[] = []
    let canExport = true

    if (compat.isMobile) {
        warnings.push('📱 移动设备检测：导出功能可能受限')

        if (!compat.canvasSupport) {
            warnings.push('❌ 不支持Canvas API，无法导出PDF')
            canExport = false
        }

        if (!compat.blobSupport) {
            warnings.push('❌ 不支持Blob API，无法生成文件')
            canExport = false
        }

        if (compat.memoryLimited) {
            warnings.push('⚠️ 设备内存较小，建议导出页数不超过' + compat.recommendedMaxPages + '页')
        }

        if (compat.isIOS) {
            warnings.push('🍎 iOS设备：下载文件需要手动保存')
        }

        if (compat.isAndroid) {
            warnings.push('🤖 Android设备：某些浏览器可能不支持直接下载')
        }
    }

    return { warnings, canExport }
}

/**
 * 移动端用户体验优化提示
 */
export function getMobileExportTips(isMobile: boolean): string[] {
    if (!isMobile) return []

    return [
        '💡 移动端导出提示：',
        '• 建议在WiFi环境下导出，避免消耗流量',
        '• 导出过程中请勿切换应用或锁屏',
        '• 大文档建议在桌面端导出以获得最佳体验',
        '• iOS用户：下载后需要手动保存到文件app',
        '• 如遇到问题，请尝试刷新页面后重试'
    ]
}