import { useState } from 'react'
import { SectionConfig } from '@/lib/types'
import { INITIAL_EXPANDED_SECTIONS } from '@/lib/constants'

export const useSections = () => {
  const [expandedSections, setExpandedSections] = useState<SectionConfig>(INITIAL_EXPANDED_SECTIONS)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // 跳转到对应方案部分的函数
  const scrollToSection = (sectionKey: string) => {
    const element = document.getElementById(`section-${sectionKey}`)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
      // 同时展开对应的折叠区域
      setExpandedSections((prev) => ({
        ...prev,
        [sectionKey]: true,
      }))
    }
  }

  return {
    expandedSections,
    toggleSection,
    scrollToSection
  }
}