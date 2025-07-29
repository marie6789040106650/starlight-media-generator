"use client"

import React, { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CategoryDropdownProps {
  value: string
  onChange: (value: string) => void
  categories: string[]
  label?: string
  placeholder?: string
  required?: boolean
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
  categories,
  label = "店的品类",
  placeholder = "请选择或输入行业类型",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sort categories
  const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b, 'zh-CN'))

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <Label htmlFor="storeCategory" className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="storeCategory"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-10"
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsOpen(true)}
        />
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {sortedCategories.map((category, index) => (
              <div
                key={index}
                className={`px-4 py-2 cursor-pointer hover:bg-purple-50 ${
                  value === category ? 'bg-purple-100' : ''
                }`}
                onClick={() => {
                  onChange(category)
                  setIsOpen(false)
                }}
              >
                {category}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}