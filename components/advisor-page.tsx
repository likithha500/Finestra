"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Send, Sparkles, Bot, User, Lightbulb, TrendingUp, Target } from "lucide-react"
import { useState, useRef, useEffect } from "react"

const SUGGESTED_PROMPTS = [
  { icon: Target, text: "Help me create a savings plan", category: "Savings" },
  { icon: TrendingUp, text: "How can I reduce unnecessary spending?", category: "Budgeting" },
  { icon: Lightbulb, text: "Investment tips for beginners", category: "Investing" },
  { icon: Sparkles, text: "Explain the 50/30/20 rule", category: "Financial Tips" },
]

export default function AdvisorPage() {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat-advisor" }),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && status !== "in_progress") {
      sendMessage({ text: input })
      setInput("")
    }
  }

  const handleSuggestedPrompt = (text: string) => {
    if (status !== "in_progress") {
      sendMessage({ text })
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0F4C81] to-[#2E3A4B] rounded-full flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">AI Financial Advisor</h1>
              <p className="text-xs text-muted-foreground">Always here to help with your finances</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0F4C81] to-[#2E3A4B] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">How can I help you today?</h2>
                <p className="text-muted-foreground max-w-md">
                  Get personalized financial advice, budgeting tips, and insights to achieve your goals.
                </p>
              </div>

              <div className="w-full max-w-2xl">
                <p className="text-sm font-medium text-muted-foreground mb-3 px-1">Popular topics</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_PROMPTS.map((prompt, index) => {
                    const Icon = prompt.icon
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestedPrompt(prompt.text)}
                        className="group p-4 rounded-xl border-2 border-border bg-card hover:border-[#0F4C81] hover:bg-card/80 transition-all text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0F4C81] to-[#2E3A4B] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#0F4C81] mb-1">{prompt.category}</p>
                            <p className="text-sm text-foreground font-medium leading-snug">{prompt.text}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F4C81] to-[#2E3A4B] flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[75%]`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-[#0F4C81] to-[#2E3A4B] text-white"
                          : "bg-card border border-border text-foreground"
                      }`}
                    >
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <p key={index} className="text-[15px] leading-relaxed whitespace-pre-wrap">
                              {part.text}
                            </p>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {status === "in_progress" && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F4C81] to-[#2E3A4B] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-[#0F4C81] rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-[#0F4C81] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#0F4C81] rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your finances..."
                disabled={status === "in_progress"}
                className="w-full px-4 py-3 pr-12 border-2 border-border bg-background text-foreground rounded-2xl focus:outline-none focus:border-[#0F4C81] transition-colors disabled:opacity-50 placeholder:text-muted-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || status === "in_progress"}
              className="bg-gradient-to-r from-[#0F4C81] to-[#2E3A4B] hover:from-[#0F4C81]/90 hover:to-[#2E3A4B]/90 text-white px-5 py-3 rounded-2xl transition-all disabled:opacity-50 h-auto"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI can make mistakes. Please verify important financial information.
          </p>
        </div>
      </div>
    </div>
  )
}
