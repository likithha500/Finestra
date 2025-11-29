"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatRupees } from "@/lib/currency"
import { ChevronDown } from "lucide-react"
import { updateUserSettings } from "@/lib/actions/user-settings"
import { addSubscription } from "@/lib/actions/subscriptions"

type BudgetSetupProps = {
  onComplete: () => void
}

const AVAILABLE_SUBSCRIPTIONS = [
  { name: "Netflix", icon: "🎬", amount: 150 },
  { name: "Spotify", icon: "🎵", amount: 99 },
  { name: "Adobe Creative Cloud", icon: "🎨", amount: 500 },
  { name: "Disney+", icon: "🏰", amount: 99 },
  { name: "Amazon Prime", icon: "📦", amount: 299 },
  { name: "Apple Music", icon: "🍎", amount: 99 },
  { name: "YouTube Premium", icon: "▶️", amount: 129 },
  { name: "ChatGPT Plus", icon: "🤖", amount: 200 },
]

export default function BudgetSetup({ onComplete }: BudgetSetupProps) {
  const [budgetInput, setBudgetInput] = useState("")
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<
    Array<{ name: string; icon: string; amount: number }>
  >([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const budget = Number(budgetInput)
    if (budget > 0 && !isSubmitting) {
      setIsSubmitting(true)
      try {
        // Save budget to database
        await updateUserSettings({ monthly_budget: budget })

        // Save subscriptions to database
        for (const sub of selectedSubscriptions) {
          const renewalDate = new Date()
          renewalDate.setDate(renewalDate.getDate() + 30)
          await addSubscription({
            name: sub.name,
            icon: sub.icon,
            amount: sub.amount,
            renewal_date: renewalDate.toISOString().split("T")[0],
          })
        }

        onComplete()
      } catch (error) {
        console.error("[v0] Failed to save budget setup:", error)
        alert("Failed to save budget. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const quickBudgets = [10000, 15000, 20000, 30000, 50000]

  const isSubscriptionSelected = (name: string) => selectedSubscriptions.some((s) => s.name === name)

  const toggleSubscription = (sub: (typeof AVAILABLE_SUBSCRIPTIONS)[0]) => {
    if (isSubscriptionSelected(sub.name)) {
      setSelectedSubscriptions(selectedSubscriptions.filter((s) => s.name !== sub.name))
    } else {
      setSelectedSubscriptions([...selectedSubscriptions, sub])
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-card border-2 border-border rounded-3xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">💰</span>
          <h1 className="text-4xl font-black text-foreground mb-3">Set Your Monthly Budget</h1>
          <p className="text-muted-foreground text-lg">
            This will help us track your spending and provide personalized insights
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-3">Monthly Budget Amount</label>
            <Input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="Enter amount in ₹"
              className="text-2xl font-bold text-center h-16 bg-background border-2 border-border text-foreground focus:border-[#EEC1A0] focus:ring-[#EEC1A0]"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-3">Quick Select</label>
            <div className="grid grid-cols-3 gap-3">
              {quickBudgets.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  onClick={() => setBudgetInput(String(amount))}
                  className={`h-12 ${
                    budgetInput === String(amount)
                      ? "bg-[#EEC1A0] text-black font-bold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {formatRupees(amount)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-3">Add Subscriptions (Optional)</label>
            <div className="relative mb-3">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full bg-background border-2 border-border text-foreground rounded-lg p-3 flex items-center justify-between hover:bg-muted transition-colors"
              >
                <span className="text-left">
                  {selectedSubscriptions.length > 0
                    ? `${selectedSubscriptions.length} subscription(s) selected`
                    : "Click to add subscriptions"}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 bg-card border-2 border-border rounded-lg mt-2 z-10 max-h-64 overflow-y-auto shadow-lg">
                  {AVAILABLE_SUBSCRIPTIONS.map((sub) => (
                    <button
                      key={sub.name}
                      type="button"
                      onClick={() => toggleSubscription(sub)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted transition-colors border-b border-border ${
                        isSubscriptionSelected(sub.name) ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{sub.icon}</span>
                        <div>
                          <p className="text-foreground font-medium">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">{formatRupees(sub.amount)}/month</p>
                        </div>
                      </div>
                      {isSubscriptionSelected(sub.name) && (
                        <div className="w-5 h-5 bg-[#EEC1A0] rounded-full flex items-center justify-center">
                          <span className="text-black text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedSubscriptions.length > 0 && (
              <div className="bg-muted rounded-lg p-4 border border-border">
                <p className="text-sm font-bold text-foreground mb-3">Selected Subscriptions:</p>
                <div className="space-y-2">
                  {selectedSubscriptions.map((sub) => (
                    <div
                      key={sub.name}
                      className="flex items-center justify-between bg-card p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{sub.icon}</span>
                        <span className="text-foreground text-sm">{sub.name}</span>
                      </div>
                      <span className="text-foreground font-bold text-sm">{formatRupees(sub.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-3 pt-3">
                  <p className="text-sm text-muted-foreground">
                    Total Subscriptions:{" "}
                    <span className="text-foreground font-bold">
                      {formatRupees(selectedSubscriptions.reduce((sum, s) => sum + s.amount, 0))}/month
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-muted rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">💡 Tip:</span> Your monthly budget should cover all your
              regular expenses including food, transport, entertainment, and bills. You can change this anytime from
              settings.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-bold bg-[#EEC1A0] hover:bg-[#E5B594] text-black disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Continue to Dashboard"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onComplete}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Skip for now
          </button>
        </div>
      </Card>
    </div>
  )
}
