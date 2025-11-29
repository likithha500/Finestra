"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    if (!mobileNumber.trim()) {
      setError("Mobile number is required")
      setIsLoading(false)
      return
    }

    if (!/^\d{10}$/.test(mobileNumber.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit mobile number")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            display_name: displayName || email.split("@")[0],
            phone_number: mobileNumber,
          },
        },
      })
      if (error) throw error
      router.push("/auth/signup-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <Card className="shadow-lg text-background bg-slate-200 border-foreground">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Start your gamified finance journey today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-gray-900 font-semibold">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="focus:border-[#0F4C81] focus:ring-[#0F4C81] border-foreground text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:border-[#0F4C81] focus:ring-[#0F4C81] border-foreground text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="text-gray-900 font-semibold">
                  Mobile Number
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="10-digit mobile number"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="focus:border-[#0F4C81] focus:ring-[#0F4C81] border-foreground text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 font-semibold">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:border-[#0F4C81] focus:ring-[#0F4C81] border-foreground text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-900 font-semibold">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="focus:border-[#0F4C81] focus:ring-[#0F4C81] border-foreground text-foreground"
                />
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-[#0F4C81] hover:bg-[#0D3F6B] text-white font-semibold py-6"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-gray-900 hover:text-[#0F4C81] underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
