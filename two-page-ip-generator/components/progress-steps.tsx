"use client"

import React from "react"

interface ProgressStepsProps {
  currentStep: number
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-center space-x-4 sm:space-x-8">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${
              currentStep >= 1 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            1
          </div>
          <span className={`ml-2 text-sm sm:text-base ${currentStep >= 1 ? "text-purple-600 font-medium" : "text-gray-500"}`}>
            填写信息
          </span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-gray-200">
          <div
            className={`h-full transition-all duration-300 ${
              currentStep >= 2 ? "bg-purple-600 w-full" : "bg-gray-200 w-0"
            }`}
          />
        </div>
        <div className="flex items-center">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${
              currentStep >= 2 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            2
          </div>
          <span className={`ml-2 text-sm sm:text-base ${currentStep >= 2 ? "text-purple-600 font-medium" : "text-gray-500"}`}>
            生成方案
          </span>
        </div>
      </div>
    </div>
  )
}