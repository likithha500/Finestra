"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Calendar, Edit2, Save, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState({
    email: "",
    display_name: "",
    created_at: "",
  })
  const [editedName, setEditedName] = useState("")

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (profile) {
          setUserData({
            email: profile.email || user.email || "",
            display_name: profile.display_name || "",
            created_at: profile.created_at || "",
          })
          setEditedName(profile.display_name || "")
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("users").update({ display_name: editedName }).eq("id", user.id)

        setUserData((prev) => ({ ...prev, display_name: editedName }))
        setIsEditing(false)
      }
    } catch (error) {
      console.error("[v0] Failed to update profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account information</p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0F4C81] to-[#1E88E5] flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userData.display_name || "User"}</h2>
                <p className="text-gray-600 dark:text-gray-400">Account Settings</p>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                Display Name
              </Label>
              {isEditing ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              ) : (
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {userData.display_name || "Not set"}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {userData.email}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Email cannot be changed</p>
            </div>

            {/* Member Since */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </Label>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {new Date(userData.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[#0F4C81] hover:bg-[#0F4C81]/90 gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setEditedName(userData.display_name)
                  }}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Account Statistics */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account Status</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Active</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Profile Completion</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {userData.display_name ? "100%" : "80%"}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Days Active</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
