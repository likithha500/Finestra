"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { updateUserSettings } from "@/lib/actions/user-settings"
import { useToast } from "@/hooks/use-toast"

interface BudgetEditorProps {
  currentBudget?: number
  onBudgetUpdate: (newBudget: number) => void
}

export function BudgetEditor({ currentBudget = 0, onBudgetUpdate }: BudgetEditorProps) {
  const [open, setOpen] = useState(false)
  const [budget, setBudget] = useState((currentBudget || 0).toString())
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    const newBudget = Number.parseFloat(budget)
    if (isNaN(newBudget) || newBudget < 0) {
      toast({
        title: "Invalid budget",
        description: "Please enter a valid positive number",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await updateUserSettings({ monthly_budget: newBudget })
      onBudgetUpdate(newBudget)
      toast({
        title: "Budget updated",
        description: "Your monthly budget has been updated successfully",
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-accent bg-transparent">
          <Settings className="w-4 h-4" />
          Edit Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Monthly Budget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-foreground">
              Monthly Budget (₹)
            </Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Enter your monthly budget"
              className="bg-background border-border text-foreground"
              min="0"
              step="100"
            />
            <p className="text-sm text-muted-foreground">
              This will be used to calculate your daily and weekly budgets automatically.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
