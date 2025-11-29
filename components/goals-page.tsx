"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Trash2, Plus, TrendingUp } from "lucide-react"
import { formatRupees } from "@/lib/currency"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { getGoals, addGoal, deleteGoal, updateGoal, type Goal } from "@/lib/actions/goals"

const SUGGESTED_GOALS = [
  { name: "Emergency Fund", emoji: "🏦", target: 100000, category: "Savings" },
  { name: "Vacation Trip", emoji: "✈️", target: 75000, category: "Travel" },
  { name: "New Laptop", emoji: "💻", target: 60000, category: "Tech" },
  { name: "Wedding Fund", emoji: "💍", target: 500000, category: "Life Event" },
  { name: "Car Down Payment", emoji: "🚗", target: 200000, category: "Vehicle" },
  { name: "Home Renovation", emoji: "🏠", target: 300000, category: "Home" },
  { name: "Education Course", emoji: "📚", target: 50000, category: "Education" },
  { name: "New Phone", emoji: "📱", target: 40000, category: "Tech" },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [progressAmount, setProgressAmount] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    current: "",
    deadline: "",
    emoji: "🎯",
  })

  useEffect(() => {
    async function fetchGoals() {
      try {
        const data = await getGoals()
        setGoals(data)
      } catch (error) {
        console.error("[v0] Failed to fetch goals:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchGoals()
  }, [])

  const deleteGoalHandler = async (id: string) => {
    try {
      await deleteGoal(id)
      setGoals(goals.filter((g) => g.id !== id))
    } catch (error) {
      console.error("[v0] Failed to delete goal:", error)
      alert("Failed to delete goal. Please try again.")
    }
  }

  const addGoalHandler = async () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const goal = await addGoal({
        name: newGoal.name,
        target_amount: Number.parseFloat(newGoal.target),
        current_amount: newGoal.current ? Number.parseFloat(newGoal.current) : 0,
        deadline: newGoal.deadline,
        emoji: newGoal.emoji,
      })

      setGoals([goal, ...goals])
      setNewGoal({ name: "", target: "", current: "", deadline: "", emoji: "🎯" })
      setIsDialogOpen(false)
      setShowSuggestions(true)
    } catch (error) {
      console.error("[v0] Failed to add goal:", error)
      alert("Failed to add goal. Please try again.")
    }
  }

  const selectSuggestedGoal = (goal: (typeof SUGGESTED_GOALS)[0]) => {
    setNewGoal({
      name: goal.name,
      emoji: goal.emoji,
      target: goal.target.toString(),
      current: "",
      deadline: "",
    })
    setShowSuggestions(false)
  }

  const updateProgressHandler = async () => {
    if (!selectedGoal || !progressAmount) {
      alert("Please enter a valid amount")
      return
    }

    const newAmount = Number.parseFloat(progressAmount)
    if (isNaN(newAmount) || newAmount < 0) {
      alert("Please enter a valid positive number")
      return
    }

    try {
      const updatedGoal = await updateGoal(selectedGoal.id, {
        current_amount: selectedGoal.current_amount + newAmount,
      })

      setGoals(goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)))
      setProgressAmount("")
      setIsProgressDialogOpen(false)
      setSelectedGoal(null)
    } catch (error) {
      console.error("[v0] Failed to update goal progress:", error)
      alert("Failed to update progress. Please try again.")
    }
  }

  const openProgressDialog = (goal: Goal) => {
    setSelectedGoal(goal)
    setProgressAmount("")
    setIsProgressDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-foreground text-xl">Loading goals...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground flex items-center gap-3">
              <Target className="w-10 h-10 text-[#0F4C81]" />
              Financial Goals
            </h1>
            <p className="text-muted-foreground mt-2">Track your savings goals and celebrate when you reach them!</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#0F4C81] to-[#2E3A4B] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:shadow-lg transition-shadow">
                <Plus className="w-5 h-5" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-foreground">Create New Goal</DialogTitle>
              </DialogHeader>
              {showSuggestions ? (
                <div className="space-y-4 py-4">
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">Choose a suggested goal or create your own</p>
                    <Button variant="outline" size="sm" onClick={() => setShowSuggestions(false)} className="font-bold">
                      Create Custom Goal
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {SUGGESTED_GOALS.map((goal, index) => (
                      <Card
                        key={index}
                        className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-[#0F4C81] hover:border-[#0F4C81]/80"
                        onClick={() => selectSuggestedGoal(goal)}
                      >
                        <div className="text-3xl mb-2">{goal.emoji}</div>
                        <h4 className="font-bold text-foreground mb-1">{goal.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{goal.category}</p>
                        <p className="text-xs font-bold text-primary">{formatRupees(goal.target)}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowSuggestions(true)
                        setNewGoal({ name: "", target: "", current: "", deadline: "", emoji: "🎯" })
                      }}
                      className="text-primary font-bold"
                    >
                      ← Back to Suggestions
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-name">Goal Name *</Label>
                    <Input
                      id="goal-name"
                      placeholder="e.g., Vacation Fund"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-emoji">Emoji</Label>
                    <Input
                      id="goal-emoji"
                      placeholder="🎯"
                      value={newGoal.emoji}
                      onChange={(e) => setNewGoal({ ...newGoal, emoji: e.target.value })}
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-target">Target Amount (₹) *</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      placeholder="e.g., 50000"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-current">Current Amount (₹)</Label>
                    <Input
                      id="goal-current"
                      type="number"
                      placeholder="e.g., 10000"
                      value={newGoal.current}
                      onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-deadline">Deadline *</Label>
                    <Input
                      id="goal-deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={addGoalHandler}
                      className="bg-gradient-to-r from-[#0F4C81] to-[#2E3A4B] text-white font-bold"
                    >
                      Create Goal
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100
              const daysLeft = Math.ceil(
                (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
              )

              return (
                <Card
                  key={goal.id}
                  className="bg-card border-2 border-[#0F4C81] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{goal.emoji}</div>
                      <div>
                        <h3 className="text-2xl font-black text-foreground">{goal.name}</h3>
                        <p className="text-muted-foreground">
                          Target: <span className="font-bold text-green-600">{formatRupees(goal.target_amount)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProgressDialog(goal)}
                        className="text-[#0F4C81] border-[#0F4C81] hover:bg-[#0F4C81] hover:text-white font-bold"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Add Progress
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoalHandler(goal.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-foreground">
                        Progress: {formatRupees(goal.current_amount)} of {formatRupees(goal.target_amount)}
                      </span>
                      <span className="text-sm font-bold text-purple-600">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-6 bg-muted rounded-full overflow-hidden border-2 border-[#0F4C81]">
                      <div
                        className="h-full bg-gradient-to-r from-[#0F4C81] to-[#91A8D0] transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${progress}%` }}
                      >
                        {progress > 10 && <span className="text-xs font-bold text-white">{progress.toFixed(0)}%</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm font-bold ${daysLeft > 30 ? "text-green-600" : daysLeft > 7 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {daysLeft} days left
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">
                      {formatRupees(goal.target_amount - goal.current_amount)} needed to reach goal
                    </span>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card className="bg-card border-2 border-[#0F4C81] rounded-2xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No goals yet!</h3>
              <p className="text-muted-foreground mb-6">Create your first financial goal to get started.</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#0F4C81] to-[#2E3A4B] text-white px-6 py-3 rounded-full font-bold inline-flex items-center gap-2 hover:shadow-lg transition-shadow">
                    <Plus className="w-5 h-5" />
                    Create Your First Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-foreground">Create New Goal</DialogTitle>
                  </DialogHeader>
                  {showSuggestions ? (
                    <div className="space-y-4 py-4">
                      <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Choose a suggested goal or create your own</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSuggestions(false)}
                          className="font-bold"
                        >
                          Create Custom Goal
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {SUGGESTED_GOALS.map((goal, index) => (
                          <Card
                            key={index}
                            className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-[#0F4C81] hover:border-[#0F4C81]/80"
                            onClick={() => selectSuggestedGoal(goal)}
                          >
                            <div className="text-3xl mb-2">{goal.emoji}</div>
                            <h4 className="font-bold text-foreground mb-1">{goal.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{goal.category}</p>
                            <p className="text-xs font-bold text-primary">{formatRupees(goal.target)}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowSuggestions(true)
                            setNewGoal({ name: "", target: "", current: "", deadline: "", emoji: "🎯" })
                          }}
                          className="text-primary font-bold"
                        >
                          ← Back to Suggestions
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-name">Goal Name *</Label>
                        <Input
                          id="goal-name"
                          placeholder="e.g., Vacation Fund"
                          value={newGoal.name}
                          onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-emoji">Emoji</Label>
                        <Input
                          id="goal-emoji"
                          placeholder="🎯"
                          value={newGoal.emoji}
                          onChange={(e) => setNewGoal({ ...newGoal, emoji: e.target.value })}
                          maxLength={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-target">Target Amount (₹) *</Label>
                        <Input
                          id="goal-target"
                          type="number"
                          placeholder="e.g., 50000"
                          value={newGoal.target}
                          onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-current">Current Amount (₹)</Label>
                        <Input
                          id="goal-current"
                          type="number"
                          placeholder="e.g., 10000"
                          value={newGoal.current}
                          onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-deadline">Deadline *</Label>
                        <Input
                          id="goal-deadline"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={addGoalHandler}
                          className="bg-gradient-to-r from-[#0F4C81] to-[#2E3A4B] text-white font-bold"
                        >
                          Create Goal
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </Card>
          )}
        </div>

        {goals.length > 0 && (
          <Card className="bg-card/50 border-2 border-[#91A8D0] rounded-2xl p-8 mt-8 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">🚀</span>
              <h3 className="text-2xl font-black text-foreground">You're doing amazing!</h3>
            </div>
            <p className="text-foreground font-medium">
              You have {goals.length} active {goals.length === 1 ? "goal" : "goals"} with an average progress of{" "}
              {Math.round((goals.reduce((sum, g) => sum + g.current_amount / g.target_amount, 0) / goals.length) * 100)}
              %. Keep up the great work and you'll reach all your goals!
            </p>
          </Card>
        )}
      </div>

      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground">Add Progress</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{selectedGoal.emoji}</span>
                <div>
                  <h4 className="text-lg font-bold text-foreground">{selectedGoal.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Current: {formatRupees(selectedGoal.current_amount)} / {formatRupees(selectedGoal.target_amount)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="progress-amount">Amount to Add (₹)</Label>
                <Input
                  id="progress-amount"
                  type="number"
                  placeholder="e.g., 5000"
                  value={progressAmount}
                  onChange={(e) => setProgressAmount(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  This will increase your progress from {formatRupees(selectedGoal.current_amount)} to{" "}
                  {formatRupees(selectedGoal.current_amount + (Number.parseFloat(progressAmount) || 0))}
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={updateProgressHandler}
                  className="bg-gradient-to-r from-[#0F4C81] to-[#2E3A4B] text-white font-bold"
                >
                  Update Progress
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
