"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Target, Trophy, CreditCard, LogOut, Wallet, UserCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface NavigationProps {
  currentPage: "dashboard" | "goals" | "rewards" | "transactions" | "profile"
  onNavigate: (page: "dashboard" | "goals" | "rewards" | "transactions" | "profile") => void
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navItems = [
    { id: "dashboard", label: "Overview", icon: BarChart3 },
    { id: "goals", label: "Goals", icon: Target },
    { id: "rewards", label: "Rewards", icon: Trophy },
    { id: "transactions", label: "Transactions", icon: CreditCard },
    { id: "profile", label: "Profile", icon: UserCircle },
  ]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("[v0] Logout failed:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C81] flex items-center justify-center shadow-md bg-slate-600">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-foreground hidden sm:inline">Finestra</span>
        </div>

        <div className="flex gap-2 items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <Button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                variant={isActive ? "default" : "ghost"}
                className={`gap-2 transition-all bg-background text-foreground ${
                  isActive
                    ? "bg-[#0F4C81] text-white hover:bg-[#0F4C81]/90"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            )
          })}

          <ThemeToggle />

          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="ghost"
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
