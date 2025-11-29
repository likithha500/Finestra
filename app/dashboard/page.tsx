"use client"

import { useState, useEffect } from "react"
import Dashboard from "@/components/dashboard"
import GoalsPage from "@/components/goals-page"
import RewardsPage from "@/components/rewards-page"
import TransactionsPage from "@/components/transactions-page"
import ProfilePage from "@/components/profile-page"
import Navigation from "@/components/navigation"
import BudgetSetup from "@/components/budget-setup"
import FloatingAdvisorButton from "@/components/floating-advisor-button"
import { getUserSettings } from "@/lib/actions/user-settings"

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "goals" | "rewards" | "transactions" | "profile">(
    "dashboard",
  )
  const [hasBudget, setHasBudget] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [dashboardKey, setDashboardKey] = useState(0)

  useEffect(() => {
    async function checkBudget() {
      try {
        const settings = await getUserSettings()
        setHasBudget(!!settings && settings.monthly_budget > 0)
      } catch (error) {
        console.error("[v0] Failed to check budget settings:", error)
        setHasBudget(false)
      } finally {
        setLoading(false)
      }
    }
    checkBudget()
  }, [])

  const handleNavigate = (page: "dashboard" | "goals" | "rewards" | "transactions" | "profile") => {
    if (page === "dashboard") {
      setDashboardKey((prev) => prev + 1)
    }
    setCurrentPage(page)
  }

  const handleRefreshDashboard = () => {
    console.log("[v0] handleRefreshDashboard called, current page:", currentPage)
    setDashboardKey((prev) => prev + 1)

    if (typeof window !== "undefined") {
      const refresh = (window as any).__dashboardRefresh
      if (refresh) {
        console.log("[v0] Triggering immediate dashboard refresh")
        refresh()
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#03045e] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (hasBudget === false) {
    return <BudgetSetup onComplete={() => setHasBudget(true)} />
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentPage === "dashboard" && <Dashboard key={dashboardKey} onDataChange={handleRefreshDashboard} />}
        {currentPage === "goals" && <GoalsPage />}
        {currentPage === "rewards" && <RewardsPage />}
        {currentPage === "transactions" && <TransactionsPage onRefreshDashboard={handleRefreshDashboard} />}
        {currentPage === "profile" && <ProfilePage />}
      </main>

      <FloatingAdvisorButton />
    </div>
  )
}
