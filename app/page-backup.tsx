"use client"

import { useState } from "react"
import { PageHeader } from "../components/page-header"
import { ProgressSteps } from "../components/progress-steps"

export default function HomeBackup() {
  const [currentStep] = useState(1)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        <ProgressSteps currentStep={currentStep} />
        
        {/* Placeholder content for backup component */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            备份页面组件
          </h2>
          <p className="text-gray-600">
            这是主页面的备份版本，用于开发和测试目的。
          </p>
        </div>
      </div>
    </div>
  )
}