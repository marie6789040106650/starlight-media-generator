import { useState, useEffect } from 'react'
import { TocItem } from '@/lib/types'
import { parseMarkdownToc } from '@/lib/utils'

export const useToc = (content: string, currentStep: number) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeSection, setActiveSection] = useState('')
  const [showFloatingToc, setShowFloatingToc] = useState(false)

  // 解析目录的 useEffect
  useEffect(() => {
    if (content && currentStep === 2) {
      const toc = parseMarkdownToc(content)
      setTocItems(toc)
    }
  }, [content, currentStep])

  // 监听滚动事件，更新当前激活的章节
  useEffect(() => {
    if (!content || currentStep !== 2) return

    const handleScroll = () => {
      const headings = document.querySelectorAll('[id^="heading-"]')
      let currentActive = ''

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 100) {
          currentActive = heading.id
        }
      })

      setActiveSection(currentActive)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [content, currentStep])

  // 跳转到指定标题
  const scrollToHeading = (id: string) => {
    console.log('尝试滚动到:', id)
    const element = document.getElementById(id)
    if (element) {
      console.log('找到元素，开始滚动:', element)
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    } else {
      console.log('未找到元素，可用的标题元素:', 
        Array.from(document.querySelectorAll('[id^="heading-"]')).map(el => ({ 
          id: el.id, 
          text: el.textContent?.slice(0, 30) 
        }))
      )
      console.log('目录中的ID:', tocItems.map(item => ({ id: item.id, title: item.title })))
    }
  }

  return {
    tocItems,
    activeSection,
    showFloatingToc,
    setShowFloatingToc,
    scrollToHeading
  }
}