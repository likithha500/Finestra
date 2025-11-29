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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting to create Supabase client...")
      const supabase = createClient()
      console.log("[v0] Supabase client created successfully")

      console.log("[v0] Attempting login for:", email)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error("[v0] Login error:", signInError)
        throw signInError
      }

      console.log("[v0] Login successful, redirecting to dashboard...")
      router.push("/dashboard")
    } catch (error: unknown) {
      console.error("[v0] Login exception:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 text-background">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-black bg-slate-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to continue your financial journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                  className="focus:border-[#0F4C81] focus:ring-[#0F4C81] border-black text-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 font-semibold">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:border-[#0F4C81] focus:ring-[#0F4C81] text-black border-black"
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
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-gray-900 hover:text-[#0F4C81] underline underline-offset-4"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
