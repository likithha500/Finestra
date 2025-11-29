"use client"

import { useState } from "react"
import { Bot, X } from "lucide-react"
import AdvisorPage from "./advisor-page"

export default function FloatingAdvisorButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#0F4C81] to-[#2E3A4B] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
          aria-label="Open AI Advisor"
        >
          <Bot className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-background animate-pulse"></span>
        </button>
      )}

      {/* Full Screen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setIsOpen(false)}
              className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-110"
              aria-label="Close AI Advisor"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-[#0F4C81]" />
              <h2 className="text-lg font-semibold text-foreground">AI Financial Advisor</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
              aria-label="Close AI Advisor"
            >
              <X className="w-5 h-5" />
              Close
            </button>
          </div>
          <AdvisorPage />
        </div>
      )}
    </>
  )
}
