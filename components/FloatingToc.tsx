'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { generateHeadingId } from '../lib/utils';

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface FloatingTocProps {
  content: string;
  className?: string;
}

/**
 * 悬浮目录组件
 * 提供可展开/折叠的目录导航，支持点击跳转
 */
export function FloatingToc({ content, className = '' }: FloatingTocProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const tocRef = useRef<HTMLDivElement>(null);

  // 解析内容中的标题生成目录
  useEffect(() => {
    const items = parseContentToc(content);
    setTocItems(items);
  }, [content]);

  // 点击外部区域关闭目录
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tocRef.current && !tocRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 跳转到指定标题
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      setIsOpen(false); // 跳转后关闭目录
    }
  };

  if (tocItems.length === 0) {
    return null; // 没有标题时不显示目录
  }

  return (
    <div 
      ref={tocRef}
      className={`fixed top-20 right-6 z-50 ${className}`}
    >
      {/* 悬浮按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          floating-toc-button w-12 h-12 rounded-full 
          bg-blue-600 hover:bg-blue-700 text-white 
          flex items-center justify-center
          ${isOpen ? 'bg-blue-700' : ''}
        `}
        title={isOpen ? '关闭目录' : '打开目录'}
        aria-label={isOpen ? '关闭目录' : '打开目录'}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 目录面板 */}
      {isOpen && (
        <div className="
          floating-toc-panel absolute top-14 right-0 w-80 max-h-96 
          rounded-lg shadow-xl border border-gray-200
          overflow-hidden animate-in slide-in-from-top-2 duration-200
        ">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">目录</h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            <nav className="p-2">
              {tocItems.map((item, index) => (
                <button
                  key={`${item.id}-${index}`}
                  onClick={() => scrollToHeading(item.id)}
                  className={`
                    toc-item w-full text-left px-3 py-2 text-sm
                    flex items-start gap-2
                    toc-item-level-${item.level}
                  `}
                >
                  <span className="flex-shrink-0 w-1 h-1 rounded-full bg-current mt-2 opacity-60" />
                  <span className="line-clamp-2">{item.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 解析内容中的标题生成目录
 */
function parseContentToc(content: string): TocItem[] {
  const items: TocItem[] = [];
  
  // 如果是HTML内容，解析HTML标题
  if (content.includes('<h')) {
    const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/gi;
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const id = match[2];
      const title = match[3].replace(/<[^>]*>/g, '').trim(); // 移除HTML标签
      
      if (title && id) {
        items.push({ id, title, level });
      }
    }
  } else {
    // 如果是Markdown内容，解析Markdown标题
    const lines = content.split('\n');
    let headingIndex = 0;
    
    lines.forEach(line => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        let title = match[2].trim();
        
        // 去掉标题前后的 * 号
        title = title.replace(/^\*+|\*+$/g, '').trim();
        
        if (title) {
          // 生成与渲染器相同的ID
          const id = generateHeadingId(headingIndex, title);
          items.push({ id, title, level });
          headingIndex++;
        }
      }
    });
  }
  
  return items;
}

