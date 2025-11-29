"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  TrendingDown,
  TrendingUp,
  Wallet,
  PiggyBank,
  Target,
  AlertCircle,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { formatRupees } from "@/lib/currency"
import { getTransactions } from "@/lib/actions/transactions"
import { getUserSettings } from "@/lib/actions/user-settings"
import { BudgetEditor } from "@/components/budget-editor"

interface DashboardProps {
  onDataChange?: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ onDataChange }) => {
  const [transactions, setTransactions] = useState<any[]>([])
  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [userName, setUserName] = useState("User")
  const [displayName, setDisplayName] = useState("")
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showBudgetEditor, setShowBudgetEditor] = useState(false)
  const [budgetPeriod, setBudgetPeriod] = useState<"daily" | "weekly" | "monthly">("monthly")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [txs, settings] = await Promise.all([getTransactions(), getUserSettings()])
        console.log("[v0] Dashboard loaded - Monthly Budget:", settings?.monthly_budget)
        setTransactions(txs || [])
        setMonthlyBudget(settings?.monthly_budget || 0)
        setDisplayName(settings?.display_name || "")
      } catch (error) {
        console.error("[v0] Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Register global refresh function for other components to call
    ;(window as any).__dashboardRefresh = () => loadData()

    return () => {
      delete (window as any).__dashboardRefresh
    }
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date)
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
    })

    const expenses = monthTransactions.filter((t) => t.amount < 0)
    const income = monthTransactions.filter((t) => t.amount > 0)
    const totalSpent = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0))
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)

    // Category breakdown
    const categoryMap: { [key: string]: number } = {}
    expenses.forEach((t) => {
      const cat = t.category || "Other"
      categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(t.amount)
    })

    const categoryData = Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value,
        color: getColorForCategory(name),
      }))
      .sort((a, b) => b.value - a.value)

    // Weekly data for trending
    const weekOffset = selectedWeek
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - weekOffset * 7)
    weekStart.setHours(0, 0, 0, 0)

    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dayTransactions = transactions.filter((t) => {
        const txDate = new Date(t.date)
        return (
          txDate.getDate() === date.getDate() &&
          txDate.getMonth() === date.getMonth() &&
          txDate.getFullYear() === date.getFullYear()
        )
      })
      const amount = Math.abs(dayTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
      return {
        fullLabel: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        amount,
      }
    })

    // Recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5)

    let periodSpent = totalSpent || 0
    let periodBudget = monthlyBudget
    let periodLabel = ""

    if (budgetPeriod === "daily") {
      periodBudget = monthlyBudget / 30
      periodLabel = "Daily Budget"
      // Calculate today's spending
      const today = new Date()
      const todayTransactions = transactions.filter((t) => {
        const txDate = new Date(t.date)
        return (
          txDate.getDate() === today.getDate() &&
          txDate.getMonth() === today.getMonth() &&
          txDate.getFullYear() === today.getFullYear()
        )
      })
      periodSpent = Math.abs(todayTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
    } else if (budgetPeriod === "weekly") {
      periodBudget = monthlyBudget / 4.33
      periodLabel = "Weekly Budget"
      // Calculate this week's spending
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const weekTransactions = transactions.filter((t) => {
        const txDate = new Date(t.date)
        return txDate >= weekStart && txDate < weekEnd
      })
      periodSpent = Math.abs(weekTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
    } else {
      periodLabel = "Monthly Budget"
      // Use existing monthly spent
    }

    return {
      totalSpent,
      totalIncome,
      remaining: Math.max(0, monthlyBudget - totalSpent),
      percentageUsed: monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0,
      categoryData,
      weeklyData,
      recentTransactions,
      dailyBudget: monthlyBudget / 30,
      weeklyBudget: monthlyBudget / 4.33,
      periodSpent,
      periodBudget,
      periodLabel,
      periodPercentage: periodBudget > 0 ? (periodSpent / periodBudget) * 100 : 0,
    }
  }, [transactions, selectedWeek, monthlyBudget, budgetPeriod])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Morning"
    if (hour < 18) return "Afternoon"
    return "Evening"
  }, [])

  const financialTips = [
    "💡 The 50/30/20 rule: Allocate 50% to needs, 30% to wants, and 20% to savings.",
    "🏦 Emergency fund: Keep 3-6 months of expenses saved for unexpected situations.",
    "📈 Compound interest: Start investing early to benefit from the power of compounding.",
    "💳 Reduce debt: Pay off high-interest debt first to improve financial health.",
    "📊 Track expenses: Monitor your spending to identify areas where you can save.",
    "🎯 Set goals: Define clear financial goals (emergency fund, vacation, retirement).",
  ]

  const currentTip = useMemo(() => financialTips[Math.floor(Math.random() * financialTips.length)], [])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-foreground text-3xl">
            Good {greeting}, {displayName || userName}!
          </h1>
          <p className="text-muted-foreground mt-1">Here's your financial overview</p>
        </div>
        <Button onClick={() => setShowBudgetEditor(true)} variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Edit Budget
        </Button>
        {showBudgetEditor && (
          <BudgetEditor
            currentBudget={monthlyBudget}
            onBudgetUpdate={(newBudget) => {
              setMonthlyBudget(newBudget)
              setShowBudgetEditor(false)
            }}
          />
        )}
      </div>

      <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-0 text-white shadow-lg overflow-hidden bg-[rgba(109,164,191,1)]">
        <CardContent className="pt-8 pb-6">
          <p className="text-lg opacity-90 mb-2">{stats.periodLabel}</p>
          <p className="text-5xl font-bold mb-6">
            {formatRupees(stats.periodSpent)} of {formatRupees(stats.periodBudget)}
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.periodPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Spent and Remaining */}
          <div className="flex justify-between mb-6 text-sm">
            <span>Spent: {(stats.periodPercentage || 0).toFixed(1)}%</span>
            <span>Remaining: {formatRupees(Math.max(0, stats.periodBudget - stats.periodSpent))}</span>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setBudgetPeriod("daily")}
              variant={budgetPeriod === "daily" ? "default" : "outline"}
              className={`rounded-full ${
                budgetPeriod === "daily"
                  ? "bg-white text-blue-600 hover:bg-white"
                  : "bg-white/20 text-white border-white/30 hover:bg-white/30"
              }`}
            >
              Daily
            </Button>
            <Button
              onClick={() => setBudgetPeriod("weekly")}
              variant={budgetPeriod === "weekly" ? "default" : "outline"}
              className={`rounded-full ${
                budgetPeriod === "weekly"
                  ? "bg-white text-blue-600 hover:bg-white"
                  : "bg-white/20 text-white border-white/30 hover:bg-white/30"
              }`}
            >
              Weekly
            </Button>
            <Button
              onClick={() => setBudgetPeriod("monthly")}
              variant={budgetPeriod === "monthly" ? "default" : "outline"}
              className={`rounded-full ${
                budgetPeriod === "monthly"
                  ? "bg-white text-blue-600 hover:bg-white"
                  : "bg-white/20 text-white border-white/30 hover:bg-white/30"
              }`}
            >
              Monthly
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-green-500 shadow-md bg-lime-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Income</p>
                <p className="text-3xl font-bold text-green-600">{formatRupees(stats.totalIncome)}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-md bg-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600">{formatRupees(stats.totalSpent)}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Spending Trends</CardTitle>
            <CardDescription>Weekly expense pattern</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeek(Math.max(selectedWeek - 1, 0))}
              disabled={selectedWeek === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedWeek(selectedWeek + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.weeklyData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No spending data for this week</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.weeklyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fullLabel" style={{ fontSize: "12px" }} />
                <YAxis style={{ fontSize: "12px" }} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PiggyBank className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No categories yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stats.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupees(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4 space-y-2">
              {stats.categoryData.slice(0, 5).map((cat) => (
                <div key={cat.name} className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                  <span className="font-semibold">{formatRupees(cat.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">{tx.icon || "💰"}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tx.name}</p>
                        <p className="text-xs text-muted-foreground">{tx.category}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.amount > 0 ? "+" : ""}
                      {formatRupees(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shadow-lg bg-slate-400">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-2">💡 Financial Insight</p>
              <p className="text-sm opacity-90">{currentTip}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getColorForCategory(category: string): string {
  const colors: { [key: string]: string } = {
    Food: "#FF6384",
    Transport: "#36A2EB",
    Entertainment: "#FFCE56",
    Shopping: "#4BC0C0",
    Utilities: "#9966FF",
    Bills: "#FF9F40",
    Healthcare: "#FF6384",
    Education: "#36A2EB",
    Stocks: "#00D9A3",
    "Mutual Funds": "#0099FF",
    "Fixed Deposit": "#FFB366",
    SIP: "#66BB6A",
  }
  return colors[category] || "#999999"
}

export default Dashboard
