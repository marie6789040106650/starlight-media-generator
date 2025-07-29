"use client"

import React from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import { LucideIcon } from "lucide-react"

interface SectionCollapsibleProps {
  title: string
  icon: LucideIcon
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
  id: string
}

export const SectionCollapsible: React.FC<SectionCollapsibleProps> = ({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
  id
}) => {
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={onToggle}
      className="border rounded-lg bg-white shadow-sm mb-4"
      id={id}
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-purple-600" />
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 pt-0 border-t">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}