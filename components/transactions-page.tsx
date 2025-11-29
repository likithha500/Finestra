"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Upload,
  Search,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Trash2,
  MoreVertical,
  Pencil,
} from "lucide-react"
import { formatRupees } from "@/lib/currency"
import { getTransactions, addTransaction, clearAllTransactions, type Transaction } from "@/lib/actions/transactions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Insights = {
  totalSpent: number
  totalIncome: number
  topCategory: { name: string; amount: number }
  largestExpense: { name: string; amount: number }
  averageDaily: number
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
  trend: "increasing" | "decreasing" | "stable"
  savingsRate: number
}

export default function TransactionsPage({ onRefreshDashboard }: { onRefreshDashboard?: () => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [insights, setInsights] = useState<Insights | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "Food",
    amount: "",
    type: "expense" as "expense" | "income",
    icon: "💰",
  })

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showClearDialog, setShowClearDialog] = useState(false)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await getTransactions()
        setTransactions(data)
      } catch (error) {
        console.error("[v0] Failed to fetch transactions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  const categories = [
    "all",
    "Food",
    "Transport",
    "Entertainment",
    "Income",
    "Shopping",
    "Bills",
    "Healthcare",
    "Education",
    "Other",
    "Stocks",
    "Mutual Funds",
    "Fixed Deposit",
    "SIP",
  ]

  const analyzeTransactions = (txs: Transaction[]) => {
    const expenses = txs.filter((t) => t.amount < 0)
    const income = txs.filter((t) => t.amount > 0)

    const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)

    const categoryTotals: Record<string, number> = {}
    expenses.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount)
    })

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalSpent) * 100,
      }))
      .sort((a, b) => b.amount - a.amount)

    const topCategory = categoryBreakdown[0] || { name: "N/A", amount: 0 }

    const largestExpense = expenses.reduce(
      (max, t) => (Math.abs(t.amount) > max.amount ? { name: t.name, amount: Math.abs(t.amount) } : max),
      { name: "N/A", amount: 0 },
    )

    const dates = txs.map((t) => new Date(t.date).getTime())
    const daysDiff = Math.max(1, Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)))
    const averageDaily = totalSpent / daysDiff

    const sortedTxs = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const midpoint = Math.floor(sortedTxs.length / 2)
    const firstHalfSpending =
      sortedTxs.slice(0, midpoint).reduce((sum, t) => sum + Math.abs(t.amount), 0) / Math.max(1, midpoint)
    const secondHalfSpending =
      sortedTxs.slice(midpoint).reduce((sum, t) => sum + Math.abs(t.amount), 0) /
      Math.max(1, sortedTxs.length - midpoint)

    let trend: "increasing" | "decreasing" | "stable" = "stable"
    if (secondHalfSpending > firstHalfSpending * 1.1) trend = "increasing"
    else if (secondHalfSpending < firstHalfSpending * 0.9) trend = "decreasing"

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0

    return {
      totalSpent,
      totalIncome,
      topCategory: { name: topCategory.category, amount: topCategory.amount },
      largestExpense,
      averageDaily,
      categoryBreakdown,
      trend,
      savingsRate,
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return new Date().toISOString()
    return date.toISOString()
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Food: "🍔",
      Transport: "🚗",
      Entertainment: "🎬",
      Income: "💰",
      Shopping: "🛍️",
      Bills: "📄",
      Healthcare: "🏥",
      Education: "📚",
      Other: "💳",
      Stocks: "📈",
      "Mutual Funds": "📊",
      "Fixed Deposit": "🏦",
      SIP: "💰",
    }
    return icons[category] || "💰"
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        alert("CSV file must have a header row and at least one data row")
        return
      }

      const headers = lines[0]
        .toLowerCase()
        .split(",")
        .map((h) => h.trim())
      const dateIndex = headers.findIndex((h) => h.includes("date"))
      const nameIndex = headers.findIndex(
        (h) => h.includes("name") || h.includes("description") || h.includes("merchant"),
      )
      const amountIndex = headers.findIndex((h) => h.includes("amount") || h.includes("price") || h.includes("total"))
      const categoryIndex = headers.findIndex((h) => h.includes("category") || h.includes("type"))

      if (dateIndex === -1 || nameIndex === -1 || amountIndex === -1) {
        alert(
          `CSV must contain columns for date, name/description, and amount.\n\nFound headers: ${headers.join(", ")}`,
        )
        return
      }

      const newTransactions: Transaction[] = []
      let successCount = 0
      let errorCount = 0
      let totalCsvExpenses = 0

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))

          if (values.length < 3) {
            errorCount++
            continue
          }

          const amountStr = values[amountIndex].replace(/[^0-9.-]/g, "")
          let amount = Number.parseFloat(amountStr)

          if (isNaN(amount)) {
            errorCount++
            continue
          }

          const category = categoryIndex !== -1 && values[categoryIndex] ? values[categoryIndex].trim() : "Other"
          const isIncomeCategory =
            category.toLowerCase().includes("income") || category.toLowerCase().includes("salary")

          if (!isIncomeCategory && amount > 0) {
            amount = -Math.abs(amount)
          }
          if (isIncomeCategory && amount < 0) {
            amount = Math.abs(amount)
          }

          const icon = getCategoryIcon(category)

          const formattedDate = formatDate(values[dateIndex].trim())
          console.log("[v0] CSV transaction date:", formattedDate, "amount:", amount, "category:", category)

          const tx = await addTransaction({
            date: formattedDate,
            name: values[nameIndex].trim() || "Unknown Transaction",
            category: category,
            amount: amount,
            icon: icon,
          })
          newTransactions.push(tx)
          successCount++

          if (amount < 0) {
            totalCsvExpenses += Math.abs(amount)
          }
        } catch (err) {
          console.error(`Error processing line ${i}:`, err)
          errorCount++
        }
      }

      if (newTransactions.length === 0) {
        alert("No valid transactions found in CSV file")
        return
      }

      const allTransactions = await getTransactions()
      setTransactions(allTransactions)

      const newInsights = analyzeTransactions(allTransactions)
      setInsights(newInsights)
      setShowInsights(true)

      if (onRefreshDashboard) {
        console.log("[v0] CSV import complete - calling onRefreshDashboard")
        onRefreshDashboard()
      }

      alert(
        `Successfully imported ${successCount} transactions!\n` +
          `Total expenses from CSV: ₹${totalCsvExpenses.toFixed(2)}${errorCount > 0 ? `\n(${errorCount} rows skipped)` : ""}\n\n` +
          `Note: Only transactions from the last 30 days will appear in dashboard calculations.\n` +
          `Your dashboard has been refreshed.`,
      )
    } catch (error) {
      console.error("Error during file upload:", error)
      alert(`Error processing CSV file: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const categoryIcons: Record<string, string> = {
    Food: "🍔",
    Transport: "🚗",
    Entertainment: "🎬",
    Income: "💰",
    Shopping: "🛍️",
    Bills: "📄",
    Healthcare: "🏥",
    Education: "📚",
    Other: "💳",
    Stocks: "📈",
    "Mutual Funds": "📊",
    "Fixed Deposit": "🏦",
    SIP: "💰",
  }

  const handleAddTransaction = async () => {
    const amount = Number.parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) return

    try {
      const tx = await addTransaction({
        date: new Date().toISOString(),
        name: formData.name,
        category: formData.category,
        amount: formData.type === "expense" ? -amount : amount,
        icon: formData.icon,
      })

      setTransactions([tx, ...transactions])
      setIsModalOpen(false)
      setFormData({
        name: "",
        category: "Food",
        amount: "",
        type: "expense",
        icon: "💰",
      })

      if (onRefreshDashboard) {
        console.log("[v0] Manual transaction added - calling onRefreshDashboard")
        onRefreshDashboard()
      }
    } catch (error) {
      console.error("[v0] Failed to add transaction:", error)
      alert("Failed to add transaction. Please try again.")
    }
  }

  const handleClearAll = async () => {
    try {
      await clearAllTransactions()
      setTransactions([])
      setShowClearDialog(false)
      setShowInsights(false)
      setInsights(null)
    } catch (error) {
      console.error("[v0] Failed to clear transactions:", error)
      alert("Failed to clear transactions. Please try again.")
    }
  }

  const handleEdit = (tx: Transaction) => {
    // Placeholder for edit functionality
    console.log("Edit transaction:", tx)
  }

  const handleDeleteClick = (id: string) => {
    // Placeholder for delete functionality
    console.log("Delete transaction with ID:", id)
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || tx.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categorizeTransactionsByDate = (txs: Transaction[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(thisWeekStart.getDate() - today.getDay())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const groups: Record<string, Transaction[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
    }

    const monthGroups: Record<string, Transaction[]> = {}

    txs.forEach((tx) => {
      const txDate = new Date(tx.date)
      const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate())

      if (txDateOnly.getTime() === today.getTime()) {
        groups.Today.push(tx)
      } else if (txDateOnly.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(tx)
      } else if (txDate >= thisWeekStart && txDate < today) {
        groups["This Week"].push(tx)
      } else if (txDate >= thisMonthStart && txDate < thisWeekStart) {
        groups["This Month"].push(tx)
      } else {
        // Group by month and year for older transactions
        const monthYear = txDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        if (!monthGroups[monthYear]) {
          monthGroups[monthYear] = []
        }
        monthGroups[monthYear].push(tx)
      }
    })

    // Combine and filter out empty groups
    const result: Array<{ label: string; transactions: Transaction[] }> = []

    if (groups.Today.length > 0) result.push({ label: "Today", transactions: groups.Today })
    if (groups.Yesterday.length > 0) result.push({ label: "Yesterday", transactions: groups.Yesterday })
    if (groups["This Week"].length > 0) result.push({ label: "This Week", transactions: groups["This Week"] })
    if (groups["This Month"].length > 0) result.push({ label: "This Month", transactions: groups["This Month"] })

    // Add month groups sorted by date (most recent first)
    Object.keys(monthGroups)
      .sort((a, b) => {
        const dateA = new Date(a)
        const dateB = new Date(b)
        return dateB.getTime() - dateA.getTime()
      })
      .forEach((monthYear) => {
        result.push({ label: monthYear, transactions: monthGroups[monthYear] })
      })

    return result
  }

  const groupedTransactions = categorizeTransactionsByDate(filteredTransactions)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-foreground text-xl">Loading transactions...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background/80 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-2">Manage and track all your transactions in one place</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:shadow-lg transition-shadow bg-emerald-900"
            >
              <Upload className="w-5 h-5" />
              Import CSV
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:shadow-lg transition-shadow bg-emerald-900"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-card border-2 border-[#0F4C81] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-[#0F4C81]" />
                <h3 className="font-bold text-foreground">Search</h3>
              </div>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-border rounded-lg focus:border-[#0F4C81] focus:outline-none bg-background text-foreground"
              />
            </Card>

            <Card className="bg-card border-2 border-[#0F4C81] rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-foreground mb-4">Filter by Category</h3>
              <div className="space-y-2 bg-background">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors opacity-100 ${
                      selectedCategory === cat
                        ? "bg-emerald-900 text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat === "all" ? "All Categories" : cat}
                  </button>
                ))}
              </div>
            </Card>

            {transactions.length > 0 && (
              <Card className="bg-card border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="text-center">
                  <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">Clear All Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">Remove all transactions</p>
                  <Button
                    onClick={() => setShowClearDialog(true)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold"
                  >
                    Clear All
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-3 space-y-6">
            {transactions.length === 0 ? (
              <Card className="bg-card border-2 border-[#0F4C81] rounded-2xl p-12 text-center shadow-lg">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No transactions yet!</h3>
                <p className="text-muted-foreground mb-6">
                  Start by adding your first transaction or importing from CSV
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white px-6 py-3 rounded-full font-bold bg-emerald-900"
                  >
                    Add Transaction
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] text-white px-6 py-3 rounded-full font-bold bg-emerald-900"
                  >
                    Import CSV
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {showInsights && insights && (
                  <Card className="bg-gradient-to-br from-[#0077b6] to-[#00b4d8] border-0 rounded-2xl p-8 text-white shadow-xl bg-teal-700">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-8 h-8" />
                        <h3 className="text-2xl font-black">Financial Insights</h3>
                      </div>
                      <button onClick={() => setShowInsights(false)} className="hover:bg-white/20 p-2 rounded-lg">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/20 rounded-xl p-4">
                        <p className="text-sm opacity-90 mb-1">Total Spent</p>
                        <p className="text-2xl font-black">{formatRupees(insights.totalSpent)}</p>
                      </div>
                      <div className="bg-white/20 rounded-xl p-4">
                        <p className="text-sm opacity-90 mb-1">Total Income</p>
                        <p className="text-2xl font-black">{formatRupees(insights.totalIncome)}</p>
                      </div>
                      <div className="bg-white/20 rounded-xl p-4">
                        <p className="text-sm opacity-90 mb-1">Savings Rate</p>
                        <p className="text-2xl font-black">{insights.savingsRate.toFixed(1)}%</p>
                      </div>
                      <div className="bg-white/20 rounded-xl p-4">
                        <p className="text-sm opacity-90 mb-1">Top Category</p>
                        <p className="text-lg font-black">{insights.topCategory.name}</p>
                        <p className="text-sm opacity-90">{formatRupees(insights.topCategory.amount)}</p>
                      </div>
                      <div className="bg-white/20 rounded-xl p-4">
                        <p className="text-sm opacity-90 mb-1">Largest Expense</p>
                        <p className="text-lg font-black">{insights.largestExpense.name}</p>
                        <p className="text-sm opacity-90">{formatRupees(insights.largestExpense.amount)}</p>
                      </div>
                      <div className="bg-white/20 rounded-xl p-4">
                        <p className="text-sm opacity-90 mb-1">Average Daily</p>
                        <p className="text-2xl font-black">{formatRupees(insights.averageDaily)}</p>
                      </div>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {insights.trend === "increasing" && <TrendingUp className="w-5 h-5" />}
                        {insights.trend === "decreasing" && <TrendingDown className="w-5 h-5" />}
                        <p className="font-bold">
                          Spending Trend:{" "}
                          <span className="capitalize">
                            {insights.trend === "increasing"
                              ? "Increasing"
                              : insights.trend === "decreasing"
                                ? "Decreasing"
                                : "Stable"}
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        {insights.categoryBreakdown.slice(0, 5).map((cat) => (
                          <div key={cat.category} className="flex items-center justify-between">
                            <span className="text-sm">{cat.category}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
                                <div className="h-full bg-white" style={{ width: `${cat.percentage}%` }}></div>
                              </div>
                              <span className="text-sm font-bold w-16 text-right">{cat.percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {groupedTransactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No transactions found. Try adjusting your filters.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groupedTransactions.map((group) => (
                      <div key={group.label} className="space-y-3">
                        {/* Date group header */}
                        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            {group.label}
                          </h3>
                        </div>

                        {/* Transactions in this group */}
                        <div className="space-y-3">
                          {group.transactions
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((tx) => (
                              <Card
                                key={tx.id}
                                className="bg-card border-2 border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <span className="text-3xl">{tx.icon || categoryIcons[tx.category] || "💰"}</span>
                                    <div>
                                      <h4 className="font-bold text-foreground">{tx.name}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {tx.category} • {(() => {
                                          const txDate = new Date(tx.date)
                                          const now = new Date()
                                          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                                          const yesterday = new Date(today)
                                          yesterday.setDate(yesterday.getDate() - 1)
                                          const txDateOnly = new Date(
                                            txDate.getFullYear(),
                                            txDate.getMonth(),
                                            txDate.getDate(),
                                          )

                                          if (txDateOnly.getTime() === today.getTime()) {
                                            return txDate.toLocaleString("en-US", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true,
                                            })
                                          } else if (txDateOnly.getTime() === yesterday.getTime()) {
                                            return txDate.toLocaleString("en-US", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true,
                                            })
                                          } else {
                                            return txDate.toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                            })
                                          }
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`text-xl font-black ${tx.amount < 0 ? "text-red-600" : "text-green-600"}`}
                                    >
                                      {tx.amount < 0 ? "-" : "+"}
                                      {formatRupees(Math.abs(tx.amount))}
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(tx)}>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteClick(tx.id)}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </Card>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your transactions from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-red-500 hover:bg-red-600">
              Delete All Transactions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Transaction Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold text-foreground">
                Type
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "expense" })}
                  className={`flex-1 ${
                    formData.type === "expense"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Expense
                </Button>
                <Button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "income" })}
                  className={`flex-1 ${
                    formData.type === "income"
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Income
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                Description
              </Label>
              <Input
                id="name"
                placeholder="e.g., Grocery shopping, Salary"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold text-foreground">
                Category
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-foreground">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-background border-border text-xl font-bold"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddTransaction}
                disabled={!formData.name || !formData.amount || Number.parseFloat(formData.amount) <= 0}
                className="flex-1 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white hover:opacity-90"
              >
                Add Transaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
