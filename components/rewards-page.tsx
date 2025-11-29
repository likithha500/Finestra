"use client"

import { useMemo, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Trophy, Star, Lock, Medal } from "lucide-react"
import { getTransactions, type Transaction } from "@/lib/actions/transactions"
import { getUserSettings } from "@/lib/actions/user-settings"

const LEADERBOARD_USERS = [
  { id: 1, name: "Rahul Sharma", points: 875, avatar: "👨", level: "Gold", badges: 35 },
  { id: 2, name: "Priya Patel", points: 750, avatar: "👩", level: "Gold", badges: 30 },
  { id: 3, name: "Amit Kumar", points: 625, avatar: "👨‍💼", level: "Silver", badges: 25 },
  { id: 4, name: "Sneha Reddy", points: 550, avatar: "👩‍💼", level: "Silver", badges: 22 },
  { id: 5, name: "Vikram Singh", points: 475, avatar: "🧑", level: "Silver", badges: 19 },
  { id: 6, name: "Anjali Gupta", points: 400, avatar: "👧", level: "Bronze", badges: 16 },
  { id: 7, name: "Rohan Mehta", points: 325, avatar: "🧑‍💻", level: "Bronze", badges: 13 },
  { id: 8, name: "Kavya Iyer", points: 275, avatar: "👩‍🎓", level: "Bronze", badges: 11 },
]

export default function RewardsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [userName, setUserName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [txData, settingsData] = await Promise.all([getTransactions(), getUserSettings()])
        setTransactions(txData)
        setUserName(settingsData?.user_name || "You")
      } catch (error) {
        console.error("[v0] Failed to fetch rewards data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const achievements = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentMonthTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date)
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
    })

    const hasTransactions = transactions.length > 0
    const currentMonthHasTransactions = currentMonthTransactions.length > 0

    const expenses = currentMonthTransactions.filter((t) => t.amount < 0)
    const income = currentMonthTransactions.filter((t) => t.amount > 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0

    const uniqueCategories = new Set(transactions.map((t) => t.category)).size
    const uniqueDays = new Set(transactions.map((t) => t.date)).size
    const consecutiveDays = calculateConsecutiveDays(transactions)
    const weekendTransactions = transactions.filter((t) => {
      const day = new Date(t.date).getDay()
      return day === 0 || day === 6
    }).length
    const earlyMorningTransactions = transactions.filter((t) => {
      const hour = new Date(t.created_at || t.date).getHours()
      return hour >= 6 && hour < 9
    }).length
    const hasIncomeTransaction = income.length > 0
    const hasBudgetSet = expenses.length > 0 && totalExpenses > 0
    const avgExpensePerDay = uniqueDays > 0 ? totalExpenses / uniqueDays : 0
    const hasLargeIncome = income.some((t) => t.amount >= 50000)
    const monthStreak = calculateMonthStreak(transactions)

    const hasStockTransaction = transactions.some(
      (t) => t.category.toLowerCase() === "stocks" || t.category.toLowerCase() === "stock",
    )
    const hasMutualFundTransaction = transactions.some(
      (t) =>
        t.category.toLowerCase() === "mutual funds" ||
        t.category.toLowerCase() === "mutual fund" ||
        t.category.toLowerCase() === "mf",
    )
    const hasFDTransaction = transactions.some(
      (t) => t.category.toLowerCase() === "fd" || t.category.toLowerCase() === "fixed deposit",
    )
    const hasSIPTransaction = transactions.some(
      (t) => t.category.toLowerCase() === "sip" || t.category.toLowerCase() === "systematic investment plan",
    )

    return [
      {
        id: 1,
        name: "First Step",
        description: "Add your first transaction",
        icon: "🎯",
        unlocked: hasTransactions,
        unlockedDate: hasTransactions
          ? new Date(Math.min(...transactions.map((t) => new Date(t.date).getTime()))).toISOString().split("T")[0]
          : undefined,
        progress: hasTransactions ? 100 : 0,
      },
      {
        id: 2,
        name: "Category Master",
        description: "Use 5 different categories",
        icon: "📊",
        unlocked: uniqueCategories >= 5,
        progress: Math.min((uniqueCategories / 5) * 100, 100),
      },
      {
        id: 3,
        name: "Saving Spree",
        description: "Save 50% of your income in a month",
        icon: "💰",
        unlocked: currentMonthHasTransactions && savingsRate >= 0.5,
        progress: Math.min(savingsRate * 100, 100),
      },
      {
        id: 4,
        name: "Daily Tracker",
        description: "Log transactions for 7 different days",
        icon: "📅",
        unlocked: uniqueDays >= 7,
        progress: Math.min((uniqueDays / 7) * 100, 100),
      },
      {
        id: 5,
        name: "Big Spender",
        description: "Record a transaction of 10,000 or more",
        icon: "💸",
        unlocked: transactions.some((t) => Math.abs(t.amount) >= 10000),
        progress: transactions.some((t) => Math.abs(t.amount) >= 10000) ? 100 : 0,
      },
      {
        id: 6,
        name: "Consistency King",
        description: "Log transactions for 3 consecutive days",
        icon: "🔥",
        unlocked: consecutiveDays >= 3,
        progress: Math.min((consecutiveDays / 3) * 100, 100),
      },
      {
        id: 7,
        name: "Weekend Warrior",
        description: "Add 3 transactions on weekends",
        icon: "🏖️",
        unlocked: weekendTransactions >= 3,
        progress: Math.min((weekendTransactions / 3) * 100, 100),
      },
      {
        id: 8,
        name: "Early Bird",
        description: "Add a transaction before 9 AM",
        icon: "🌅",
        unlocked: earlyMorningTransactions >= 1,
        progress: earlyMorningTransactions >= 1 ? 100 : 0,
      },
      {
        id: 9,
        name: "Income Earner",
        description: "Record your first income transaction",
        icon: "💵",
        unlocked: hasIncomeTransaction,
        progress: hasIncomeTransaction ? 100 : 0,
      },
      {
        id: 10,
        name: "Budget Boss",
        description: "Keep daily expenses under 500",
        icon: "👑",
        unlocked: hasBudgetSet && avgExpensePerDay <= 500,
        progress: hasBudgetSet ? Math.min(100, Math.max(0, (1 - avgExpensePerDay / 500) * 100)) : 0,
      },
      {
        id: 11,
        name: "Money Magnet",
        description: "Record an income of 50,000 or more",
        icon: "🧲",
        unlocked: hasLargeIncome,
        progress: hasLargeIncome ? 100 : 0,
      },
      {
        id: 12,
        name: "Dedicated Tracker",
        description: "Track transactions for 3 different months",
        icon: "📆",
        unlocked: monthStreak >= 3,
        progress: Math.min((monthStreak / 3) * 100, 100),
      },
      {
        id: 13,
        name: "Super Saver",
        description: "Save 75% of your income in a month",
        icon: "🌟",
        unlocked: currentMonthHasTransactions && savingsRate >= 0.75,
        progress: Math.min(savingsRate * 100, 100),
      },
      {
        id: 14,
        name: "Category Explorer",
        description: "Use 10 different categories",
        icon: "🗺️",
        unlocked: uniqueCategories >= 10,
        progress: Math.min((uniqueCategories / 10) * 100, 100),
      },
      {
        id: 15,
        name: "Streak Master",
        description: "Log transactions for 7 consecutive days",
        icon: "⚡",
        unlocked: consecutiveDays >= 7,
        progress: Math.min((consecutiveDays / 7) * 100, 100),
      },
      {
        id: 16,
        name: "Stock Market Investor",
        description: "Add money to stocks",
        icon: "📈",
        unlocked: hasStockTransaction,
        progress: hasStockTransaction ? 100 : 0,
      },
      {
        id: 17,
        name: "Mutual Fund Explorer",
        description: "Invest in mutual funds",
        icon: "🎯",
        unlocked: hasMutualFundTransaction,
        progress: hasMutualFundTransaction ? 100 : 0,
      },
      {
        id: 18,
        name: "Fixed Deposit Holder",
        description: "Open a Fixed Deposit",
        icon: "🏦",
        unlocked: hasFDTransaction,
        progress: hasFDTransaction ? 100 : 0,
      },
      {
        id: 19,
        name: "SIP Starter",
        description: "Start a Systematic Investment Plan",
        icon: "💎",
        unlocked: hasSIPTransaction,
        progress: hasSIPTransaction ? 100 : 0,
      },
    ]
  }, [transactions])

  const unlockedAchievements = achievements.filter((a) => a.unlocked).length
  const totalPoints = useMemo(() => {
    return unlockedAchievements * 25
  }, [unlockedAchievements])

  const getCurrentBadge = () => {
    if (totalPoints >= 500) return { level: "Gold", icon: "🥇", color: "from-[#0F4C81] to-[#2E3A4B]", nextPoints: null }
    if (totalPoints >= 250) return { level: "Silver", icon: "🥈", color: "from-gray-300 to-gray-400", nextPoints: 500 }
    return { level: "Bronze", icon: "🥉", color: "from-orange-400 to-amber-500", nextPoints: 250 }
  }

  const currentBadge = getCurrentBadge()

  const userRank = useMemo(() => {
    const sortedLeaderboard = [
      ...LEADERBOARD_USERS,
      {
        id: 0,
        name: userName || "You",
        points: totalPoints,
        avatar: "🎮",
        level: currentBadge.level,
        badges: unlockedAchievements,
      },
    ].sort((a, b) => b.points - a.points)
    return sortedLeaderboard.findIndex((u) => u.id === 0) + 1
  }, [totalPoints, currentBadge.level, unlockedAchievements, userName])

  const fullLeaderboard = useMemo(() => {
    return [
      ...LEADERBOARD_USERS,
      {
        id: 0,
        name: userName || "You",
        points: totalPoints,
        avatar: "🎮",
        level: currentBadge.level,
        badges: unlockedAchievements,
      },
    ].sort((a, b) => b.points - a.points)
  }, [totalPoints, currentBadge.level, unlockedAchievements, userName])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-foreground text-xl">Loading rewards...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-foreground flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Rewards & Achievements
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete challenges and unlock amazing rewards! You're at{" "}
            <span className="font-bold text-[#0F4C81]">{totalPoints} points</span>
          </p>
        </div>

        {/* Level Progress */}
        <Card className="bg-gradient-to-r from-[#0F4C81] to-[#2E3A4B] border-0 rounded-2xl p-8 mb-12 text-white shadow-xl bg-slate-400">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-lg opacity-90">Current Level</p>
              <h2 className="text-4xl font-black">
                {currentBadge.icon} {currentBadge.level} Member
              </h2>
            </div>
            <div className="text-center">
              <p className="text-6xl font-black">{totalPoints}</p>
              <p className="text-sm opacity-90">Points</p>
            </div>
          </div>
          <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all"
              style={{ width: `${currentBadge.nextPoints ? (totalPoints / currentBadge.nextPoints) * 100 : 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            {currentBadge.nextPoints ? (
              <>
                <span>
                  {totalPoints} / {currentBadge.nextPoints} points to{" "}
                  {currentBadge.level === "Bronze" ? "Silver" : "Gold"}
                </span>
                <span>{Math.round((totalPoints / currentBadge.nextPoints) * 100)}%</span>
              </>
            ) : (
              <span>You've reached the highest level!</span>
            )}
          </div>
        </Card>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Medal className="w-8 h-8 text-[#0F4C81]" />
            <h3 className="text-2xl font-black text-foreground">Community Leaderboard</h3>
          </div>
          {totalPoints > 0 ? (
            <Card className="bg-card border-2 border-[#0F4C81] rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-[#0F4C81] to-[#2E3A4B] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Your Rank</p>
                    <p className="text-4xl font-black">#{userRank}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-90 mb-1">{userName || "You"}</p>
                    <p className="text-2xl font-bold">{currentBadge.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90 mb-1">Total Points</p>
                    <p className="text-4xl font-black">{totalPoints}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {fullLeaderboard.slice(0, 10).map((user, index) => {
                    const isCurrentUser = user.id === 0
                    const displayRank = index + 1

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                          isCurrentUser
                            ? "bg-[#0F4C81]/10 border-2 border-[#0F4C81] shadow-md"
                            : index < 3
                              ? "bg-card/80 border-2 border-[#0F4C81]"
                              : "bg-muted border-2 border-border"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-white ${
                              displayRank === 1
                                ? "bg-yellow-500 text-2xl"
                                : displayRank === 2
                                  ? "bg-gray-400 text-xl"
                                  : displayRank === 3
                                    ? "bg-orange-500 text-lg"
                                    : "bg-[#0F4C81] text-base"
                            }`}
                          >
                            {displayRank}
                          </div>
                          <div className="text-3xl">{user.avatar}</div>
                          <div>
                            <p className={`font-bold ${isCurrentUser ? "text-[#0F4C81]" : "text-foreground"}`}>
                              {user.name}
                              {isCurrentUser && <span className="ml-2 text-sm">(You)</span>}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.level} • {user.badges} badges
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-black ${isCurrentUser ? "text-[#0F4C81]" : "text-[#0F4C81]"}`}>
                            {user.points}
                          </p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-muted border-2 border-border rounded-2xl p-12 text-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <Lock className="w-20 h-20 text-muted-foreground" />
              </div>
              <div className="relative opacity-30">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Leaderboard Locked</h3>
              </div>
              <div className="relative z-10 mt-6">
                <p className="text-foreground font-bold mb-4">
                  Earn your first achievement to unlock the community leaderboard!
                </p>
                <p className="text-sm text-muted-foreground">Start by adding transactions to earn points and badges.</p>
              </div>
            </Card>
          )}
        </div>

        {/* Badge Levels */}
        <div className="mb-12">
          <h3 className="text-2xl font-black text-foreground mb-6">Badge Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { level: "Bronze", points: 25, color: "from-orange-400 to-amber-500", icon: "🥉" },
              { level: "Silver", points: 250, color: "from-gray-300 to-gray-400", icon: "🥈" },
              { level: "Gold", points: 500, color: "from-[#0F4C81] to-[#2E3A4B]", icon: "🥇" },
            ].map((badge) => (
              <Card
                key={badge.level}
                className={`rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow ${
                  totalPoints >= badge.points
                    ? `bg-gradient-to-br ${badge.color} border-0 text-${badge.level === "Gold" ? "black" : "white"}`
                    : "bg-muted border-border relative overflow-hidden"
                }`}
              >
                {totalPoints < badge.points && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className={`text-6xl text-center mb-4 ${totalPoints < badge.points ? "opacity-30" : ""}`}>
                  {badge.icon}
                </div>
                <h4 className={`text-2xl font-bold text-center mb-2 ${totalPoints < badge.points ? "text-black" : ""}`}>
                  {badge.level}
                </h4>
                <p className={`text-center mb-6 ${totalPoints < badge.points ? "text-secondary" : "opacity-90"}`}>
                  Requires {badge.points} points
                </p>
                <div
                  className={`rounded-full px-4 py-2 text-center ${totalPoints < badge.points ? "bg-gray-300" : "bg-black/20"}`}
                >
                  <p className={`text-sm font-bold ${totalPoints < badge.points ? "text-black" : ""}`}>
                    {totalPoints >= badge.points ? `✓ Earned` : `${badge.points - totalPoints} points away`}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-black text-foreground mb-6">Achievements</h3>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`rounded-2xl p-6 border-2 transition-all ${
                    achievement.unlocked ? "bg-card border-[#0F4C81] shadow-lg" : "bg-muted border-border opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{achievement.icon}</span>
                    {achievement.unlocked ? (
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-2">{achievement.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden border border-gray-400">
                      <div className="h-full bg-[#0F4C81]" style={{ width: `${achievement.progress}%` }}></div>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <p className="text-xs text-green-600 font-bold">Unlocked on {achievement.unlockedDate}</p>
                  )}
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function calculateConsecutiveDays(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0

  const uniqueDates = Array.from(new Set(transactions.map((t) => t.date))).sort()
  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1])
    const currDate = new Date(uniqueDates[i])
    const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return maxStreak
}

function calculateMonthStreak(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0

  const uniqueMonths = new Set(
    transactions.map((t) => {
      const date = new Date(t.date)
      return `${date.getFullYear()}-${date.getMonth()}`
    }),
  )

  return uniqueMonths.size
}
