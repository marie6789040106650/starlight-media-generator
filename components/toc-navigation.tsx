"use client"

import React from "react"
import { TocItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Hash, X } from "lucide-react"

interface TocNavigationProps {
  tocItems: TocItem[]
  activeSection: string
  showFloatingToc: boolean
  setShowFloatingToc: (show: boolean) => void
  scrollToHeading: (id: string) => void
}

export const TocNavigation: React.FC<TocNavigationProps> = ({
  tocItems,
  activeSection,
  showFloatingToc,
  setShowFloatingToc,
  scrollToHeading
}) => {
  if (tocItems.length === 0) return null

  return (
    <>
      {/* 悬浮目录按钮 - 所有设备都显示 */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setShowFloatingToc(!showFloatingToc)}
          size="sm"
          className={`rounded-lg px-4 py-2 h-auto shadow-lg transition-all duration-200 ${
            showFloatingToc 
              ? "bg-gray-600 hover:bg-gray-700" 
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          <span className="text-white font-medium">目录</span>
        </Button>
      </div>

      {/* 悬浮目录面板 */}
      {showFloatingToc && (
        <>
          {/* 背景遮罩 - 点击关闭 */}
          <div 
            className="fixed inset-0 z-45 bg-black bg-opacity-30"
            onClick={() => setShowFloatingToc(false)}
          />
          
          {/* 目录面板 */}
          <div className="fixed bottom-20 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] max-h-[60vh] bg-white rounded-lg shadow-xl border overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
            {/* 头部 */}
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center">
                <Hash className="h-4 w-4 mr-2" />
                目录导航
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFloatingToc(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* 目录内容 */}
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(60vh-4rem)]">
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToHeading(item.id)
                    setShowFloatingToc(false)
                  }}
                  className={`block text-left w-full px-3 py-2 text-sm rounded-md transition-all duration-150 hover:scale-[1.02] ${
                    activeSection === item.id
                      ? "bg-purple-100 text-purple-700 font-medium border-l-2 border-purple-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                >
                  <div className="flex items-center">
                    <span className="truncate">{item.title}</span>
                  </div>
                </button>
              ))}
            </nav>
            
            {/* 底部提示 */}
            <div className="p-3 bg-gray-50 border-t text-center">
              <p className="text-xs text-gray-500">点击标题跳转到对应位置</p>
            </div>
          </div>
        </>
      )}
    </>
  )
}