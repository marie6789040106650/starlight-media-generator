"use client"

import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const PageHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">星光传媒</h1>
                <p className="text-xs sm:text-sm text-gray-500">方案生成器</p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="hidden sm:inline-flex bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
              抖音第一人设打造专家
            </Badge>
            <Badge variant="secondary" className="sm:hidden bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs px-2 py-1">
              专家
            </Badge>
          </div>
        </div>
      </div>
    </header>
  )
}